
import React, { useState } from 'react';
import { Plus, Trash2, Play, CircleAlert, CircleCheck, Layers, X, GripVertical, Search, ArrowRight, Ban, Pencil, Settings, RotateCcw, Hash, Network, Zap, Info } from 'lucide-react';

type MatchType = 'exact' | 'lpm' | 'ternary';

interface TableEntry {
  id: string;
  matchKey: string;
  matchType: MatchType;
  action: 'forward' | 'drop' | 'modify';
  param: string;
}

interface DefaultAction {
  action: 'forward' | 'drop' | 'modify';
  param: string;
}

interface P4Table {
  id: string;
  name: string;
  entries: TableEntry[];
  defaultAction: DefaultAction;
}

const P4MatchActionTable = () => {
  const [tables, setTables] = useState<P4Table[]>([
    {
      id: 't1',
      name: 'IPv4_L3_Fwd',
      entries: [
        { id: '1', matchKey: '10.0.0.1', matchType: 'exact', action: 'forward', param: 'Port 1' },
        { id: '2', matchKey: '192.168.0.', matchType: 'lpm', action: 'forward', param: 'Port 2' },
        { id: '3', matchKey: '10.*.*.*', matchType: 'ternary', action: 'drop', param: 'Firewall Deny' },
      ],
      defaultAction: { action: 'drop', param: '-' }
    }
  ]);

  const [activeTableId, setActiveTableId] = useState<string>('t1');
  const [newTableName, setNewTableName] = useState('');
  const [isCreatingTable, setIsCreatingTable] = useState(false);

  const [newMatch, setNewMatch] = useState('');
  const [newMatchType, setNewMatchType] = useState<MatchType>('exact');
  const [newAction, setNewAction] = useState<'forward' | 'drop' | 'modify'>('forward');
  const [newParam, setNewParam] = useState('');
  
  const [testPacket, setTestPacket] = useState('10.0.0.1');
  const [matchResult, setMatchResult] = useState<{ hit: boolean; entry?: TableEntry; defaultActionUsed?: DefaultAction; tableId: string } | null>(null);

  const [searchTerm, setSearchTerm] = useState('');

  const activeTable = tables.find(t => t.id === activeTableId) || tables[0];

  const addTable = () => {
    if (!newTableName) return;
    const id = Math.random().toString(36).substring(2, 9);
    setTables([...tables, { id, name: newTableName, entries: [], defaultAction: { action: 'drop', param: '-' } }]);
    setActiveTableId(id);
    setNewTableName('');
    setIsCreatingTable(false);
  };

  const deleteTable = (id: string) => {
    if (tables.length <= 1) return;
    const newTables = tables.filter(t => t.id !== id);
    setTables(newTables);
    if (activeTableId === id) setActiveTableId(newTables[0].id);
  };

  const addEntry = () => {
    if (!newMatch) return;
    const id = Math.random().toString(36).substring(2, 9);
    const newEntry: TableEntry = { id, matchKey: newMatch, matchType: newMatchType, action: newAction, param: newParam || '-' };
    
    setTables(prev => prev.map(t => t.id === activeTableId ? { ...t, entries: [...t.entries, newEntry] } : t));
    setNewMatch('');
    setNewParam('');
    setMatchResult(null);
  };

  const removeEntry = (entryId: string) => {
    setTables(prev => prev.map(t => t.id === activeTableId ? { ...t, entries: t.entries.filter(e => e.id !== entryId) } : t));
    setMatchResult(null);
  };

  const runTest = () => {
    if (!activeTable) return;
    
    // P4 priority logic simulation:
    // Usually Exact > LPM (longest wins) > Ternary (first/priority wins)
    // We sort our current entries by this priority for the search
    const sortedEntries = [...activeTable.entries].sort((a, b) => {
      const typePriority = { exact: 0, lpm: 1, ternary: 2 };
      if (typePriority[a.matchType] !== typePriority[b.matchType]) {
        return typePriority[a.matchType] - typePriority[b.matchType];
      }
      // For LPM, longer prefix wins
      if (a.matchType === 'lpm') return b.matchKey.length - a.matchKey.length;
      return 0;
    });

    const hit = sortedEntries.find(e => {
      if (e.matchType === 'exact') return e.matchKey === testPacket;
      if (e.matchType === 'lpm') return testPacket.startsWith(e.matchKey);
      if (e.matchType === 'ternary') {
        const pattern = e.matchKey.replace(/\./g, '\\.').replace(/\*/g, '.*');
        return new RegExp(`^${pattern}$`).test(testPacket);
      }
      return false;
    });

    setMatchResult({ 
        hit: !!hit, 
        entry: hit, 
        defaultActionUsed: !hit ? activeTable.defaultAction : undefined,
        tableId: activeTableId 
    });
  };

  const getMatchTypeIcon = (type: MatchType) => {
    switch(type) {
      case 'exact': return <Hash size={12} />;
      case 'lpm': return <Network size={12} />;
      case 'ternary': return <Zap size={12} />;
    }
  };

  const getMatchTypeStyles = (type: MatchType) => {
    switch(type) {
      case 'exact': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'lpm': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'ternary': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border-pink-200 dark:border-pink-800';
    }
  };

  const filteredEntries = activeTable.entries.filter(entry => 
    entry.matchKey.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Table Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-thin">
        {tables.map(table => (
          <div 
            key={table.id}
            onClick={() => { setActiveTableId(table.id); setMatchResult(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg cursor-pointer text-sm font-medium transition-all duration-200 border-t border-l border-r min-w-[140px] justify-between group ${
              activeTableId === table.id 
              ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm z-10' 
              : 'bg-white dark:bg-slate-950 border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
                <Layers size={14} />
                <span className="truncate">{table.name}</span>
            </div>
            {tables.length > 1 && (
              <X size={12} className="opacity-0 group-hover:opacity-100 hover:text-red-500" onClick={(e) => { e.stopPropagation(); deleteTable(table.id); }} />
            )}
          </div>
        ))}
        <button onClick={() => setIsCreatingTable(true)} className="px-3 py-2 text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors">
          <Plus size={14} /> New Table
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entry Manager */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col h-[650px]">
          <div className="flex justify-between items-center mb-4">
             <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Table Entries</h4>
             <div className="relative">
                <Search className="absolute left-2 top-1.5 text-slate-400" size={12} />
                <input 
                  type="text" 
                  placeholder="Filter keys..." 
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded pl-7 pr-2 py-1 text-[10px] outline-none focus:ring-1 focus:ring-indigo-500 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar mb-4">
             {filteredEntries.map((entry) => {
               const isHit = matchResult?.hit && matchResult.entry?.id === entry.id;
               return (
                 <div key={entry.id} className={`p-3 rounded-md border text-xs flex justify-between items-center transition-all ${isHit ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 scale-[1.02] shadow-md shadow-emerald-500/10' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                    <div className="flex items-center gap-3">
                       <GripVertical size={14} className="text-slate-300" />
                       <div>
                         <div className="flex items-center gap-2">
                           <span className={`px-1.5 py-0.5 rounded-full border text-[9px] font-bold uppercase flex items-center gap-1 ${getMatchTypeStyles(entry.matchType)}`}>
                              {getMatchTypeIcon(entry.matchType)} {entry.matchType}
                           </span>
                           <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{entry.matchKey}</span>
                         </div>
                         <div className="flex gap-2 mt-1">
                           <span className={`px-1 rounded text-[10px] uppercase font-bold ${entry.action === 'drop' ? 'text-red-500' : 'text-blue-500'}`}>{entry.action}</span>
                           <span className="text-slate-400 font-mono">{entry.param}</span>
                         </div>
                       </div>
                    </div>
                    <button onClick={() => removeEntry(entry.id)} className="text-slate-400 hover:text-red-500 p-1 transition-colors"><Trash2 size={14} /></button>
                 </div>
               );
             })}
          </div>

          <div className="mt-auto border-t border-slate-200 dark:border-slate-800 pt-3">
             <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Configure New Entry</div>
             
             {/* Match Type Segmented Control */}
             <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-md mb-3">
                {(['exact', 'lpm', 'ternary'] as MatchType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewMatchType(t)}
                    className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${newMatchType === t ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
                  >
                    {getMatchTypeIcon(t)} {t}
                  </button>
                ))}
             </div>

             <div className="flex flex-col gap-2">
               <div className="flex gap-2">
                 <input 
                   placeholder={newMatchType === 'exact' ? "Ex: 10.0.0.1" : newMatchType === 'lpm' ? "Ex: 192.168." : "Ex: 10.*.*.*"}
                   className="flex-1 text-xs p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white font-mono placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 outline-none"
                   value={newMatch}
                   onChange={e => setNewMatch(e.target.value)}
                 />
                 <input 
                   placeholder="Param"
                   className="w-1/4 text-xs p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                   value={newParam}
                   onChange={e => setNewParam(e.target.value)}
                 />
               </div>
               
               <div className="flex gap-2">
                  <select 
                    value={newAction} 
                    onChange={e => setNewAction(e.target.value as any)}
                    className="flex-1 text-xs p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="forward">Forward</option>
                    <option value="drop">Drop</option>
                    <option value="modify">Modify</option>
                  </select>
                  <button onClick={addEntry} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-xs font-bold flex items-center gap-1 transition-all">
                    <Plus size={14} /> Add Entry
                  </button>
               </div>
             </div>
             
             <div className="mt-3 text-[9px] text-slate-400 flex gap-1 items-start bg-slate-100 dark:bg-slate-900 p-2 rounded">
                <Info size={10} className="mt-0.5 shrink-0" />
                <span>Priority: Exact > LPM (Longest Prefix Match) > Ternary (Wildcards). First matching entry in list wins within priority groups.</span>
             </div>
          </div>
        </div>

        {/* Simulator Panel */}
        <div className="bg-slate-900 text-slate-100 p-6 rounded-lg shadow-xl flex flex-col h-[650px] border border-slate-800">
           <h4 className="text-sm font-bold mb-6 flex items-center gap-2 opacity-60 uppercase tracking-widest">
             <Play size={14} /> Live Packet Simulation
           </h4>

           <div className="space-y-6 flex-1 flex flex-col">
             <div>
               <label className="text-[10px] text-slate-400 font-bold uppercase block mb-2">Ingress Packet Header</label>
               <div className="flex gap-2">
                 <input 
                    className="flex-1 bg-slate-800 border border-slate-700 rounded p-3 text-sm font-mono focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    value={testPacket}
                    onChange={e => setTestPacket(e.target.value)}
                    placeholder="e.g. 10.0.0.1"
                 />
                 <button onClick={runTest} className="bg-indigo-600 hover:bg-indigo-500 px-6 rounded font-bold transition-all active:scale-95">Lookup</button>
               </div>
             </div>

             <div className="flex-1 bg-slate-950/50 rounded-xl border border-slate-800 p-6 flex flex-col items-center justify-center text-center">
                {!matchResult ? (
                   <div className="text-slate-600 animate-pulse">
                      <Search size={48} className="mx-auto mb-4 opacity-10" />
                      <p className="text-xs font-medium uppercase tracking-widest">Awaiting Lookup</p>
                      <p className="text-[10px] mt-2 opacity-50">Enter a packet header value to test logic</p>
                   </div>
                ) : (
                   <div className="animate-in zoom-in-95 duration-200 w-full max-w-sm">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 ${matchResult.hit ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/30'}`}>
                         {matchResult.hit ? <CircleCheck size={40} /> : <CircleAlert size={40} />}
                      </div>
                      <h3 className={`text-2xl font-bold ${matchResult.hit ? 'text-white' : 'text-slate-200'}`}>
                        {matchResult.hit ? 'TABLE HIT' : 'TABLE MISS'}
                      </h3>
                      
                      {matchResult.hit ? (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-emerald-500 uppercase flex items-center justify-center gap-2">
                             Matched by {matchResult.entry?.matchType.toUpperCase()} {getMatchTypeIcon(matchResult.entry!.matchType)}
                          </p>
                          <p className="text-[10px] text-slate-500">Key: "{matchResult.entry?.matchKey}"</p>
                        </div>
                      ) : (
                        <p className="text-xs mt-1 text-amber-500 font-medium uppercase">Falling back to Default Action</p>
                      )}

                      <div className="mt-10 grid grid-cols-2 gap-4 text-left">
                         <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 shadow-lg">
                            <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">Action</span>
                            <span className={`text-sm font-mono font-bold uppercase ${matchResult.hit && matchResult.entry?.action === 'drop' ? 'text-red-400' : 'text-indigo-400'}`}>
                              {matchResult.hit ? matchResult.entry?.action : matchResult.defaultActionUsed?.action}
                            </span>
                         </div>
                         <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 shadow-lg">
                            <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">Parameter</span>
                            <span className="text-sm font-mono text-white truncate block">
                              {matchResult.hit ? matchResult.entry?.param : matchResult.defaultActionUsed?.param}
                            </span>
                         </div>
                      </div>
                   </div>
                )}
             </div>
             
             <div className="text-[10px] text-slate-500 text-center italic opacity-60">
                P4 Match-Action Table Simulator v2.0 &bull; NetLearn Engine
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default P4MatchActionTable;
