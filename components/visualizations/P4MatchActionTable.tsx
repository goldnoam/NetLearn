
import React, { useState } from 'react';
import { Plus, Trash2, Play, AlertCircle, CheckCircle, Layers, X, GripHorizontal, Search, ArrowRight, Ban, Edit, Settings } from 'lucide-react';

interface TableEntry {
  id: string;
  matchKey: string; // e.g., Dest IP
  action: 'forward' | 'drop' | 'modify';
  param: string; // e.g., Port Number
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
      name: 'IPv4_Lookup',
      entries: [
        { id: '1', matchKey: '10.0.0.1', action: 'forward', param: '1' },
        { id: '2', matchKey: '10.0.0.2', action: 'drop', param: '-' },
      ],
      defaultAction: { action: 'drop', param: '-' }
    },
    {
      id: 't2',
      name: 'ACL_Ingress',
      entries: [
        { id: '3', matchKey: '192.168.1.5', action: 'drop', param: 'Block malicious' },
        { id: '4', matchKey: '192.168.1.0/24', action: 'modify', param: 'set_dscp 46' }
      ],
      defaultAction: { action: 'forward', param: 'next_table' }
    }
  ]);

  const [activeTableId, setActiveTableId] = useState<string>('t1');
  const [newTableName, setNewTableName] = useState('');
  const [isCreatingTable, setIsCreatingTable] = useState(false);

  const [newMatch, setNewMatch] = useState('');
  const [newAction, setNewAction] = useState<'forward' | 'drop' | 'modify'>('forward');
  const [newParam, setNewParam] = useState('');
  
  const [testPacket, setTestPacket] = useState('10.0.0.1');
  const [matchResult, setMatchResult] = useState<{ hit: boolean; entry?: TableEntry; defaultActionUsed?: DefaultAction; tableId: string } | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

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
    const newEntry: TableEntry = { id, matchKey: newMatch, action: newAction, param: newParam || '-' };
    
    const updatedTables = tables.map(t => {
      if (t.id === activeTableId) {
        return { ...t, entries: [...t.entries, newEntry] };
      }
      return t;
    });
    setTables(updatedTables);
    setNewMatch('');
    setNewParam('');
    setMatchResult(null); // Clear old results to avoid confusion
  };

  const removeEntry = (entryId: string) => {
    const updatedTables = tables.map(t => {
      if (t.id === activeTableId) {
        return { ...t, entries: t.entries.filter(e => e.id !== entryId) };
      }
      return t;
    });
    setTables(updatedTables);
    setMatchResult(null);
  };

  const updateDefaultAction = (action: 'forward' | 'drop' | 'modify', param: string) => {
    const updatedTables = tables.map(t => {
      if (t.id === activeTableId) {
        return { ...t, defaultAction: { action, param } };
      }
      return t;
    });
    setTables(updatedTables);
    // If currently showing a miss result for this table, update the view
    if (matchResult && matchResult.tableId === activeTableId && !matchResult.hit) {
         setMatchResult({ ...matchResult, defaultActionUsed: { action, param } });
    }
  };

  const runTest = () => {
    if (!activeTable) return;
    const hit = activeTable.entries.find(e => e.matchKey === testPacket);
    setMatchResult({ 
        hit: !!hit, 
        entry: hit, 
        defaultActionUsed: !hit ? activeTable.defaultAction : undefined,
        tableId: activeTableId 
    });
  };

  if (!activeTable) return <div>Loading...</div>;

  const filteredEntries = activeTable.entries.filter(entry => {
    const matchesSearch = entry.matchKey.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          entry.param.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterAction === 'all' || entry.action === filterAction;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col gap-6">
      
      {/* Table Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-thin">
        {tables.map(table => (
          <div 
            key={table.id}
            onClick={() => { setActiveTableId(table.id); setMatchResult(null); setSearchTerm(''); setFilterAction('all'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg cursor-pointer text-sm font-medium transition-all duration-200 border-t border-l border-r min-w-[140px] justify-between group select-none ${
              activeTableId === table.id 
              ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 relative top-[1px] shadow-sm z-10' 
              : 'bg-white dark:bg-slate-950 border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
                <Layers size={14} className="shrink-0" />
                <span className="truncate">{table.name}</span>
            </div>
            {tables.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); deleteTable(table.id); }}
                className="opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-500 rounded-full p-1 transition-all"
                title="Delete Table"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
        
        {!isCreatingTable ? (
          <button 
            onClick={() => setIsCreatingTable(true)}
            className="flex items-center gap-1 px-3 py-2 text-xs text-slate-500 hover:text-indigo-600 transition hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg ml-1 whitespace-nowrap"
          >
            <Plus size={14} /> New Table
          </button>
        ) : (
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded px-2 py-1 ml-1 animate-in fade-in zoom-in-95 shrink-0">
            <input 
              autoFocus
              value={newTableName}
              onChange={e => setNewTableName(e.target.value)}
              placeholder="Name..."
              className="bg-transparent border-none outline-none text-xs w-24 dark:text-slate-200"
              onKeyDown={e => e.key === 'Enter' && addTable()}
            />
            <button onClick={addTable} className="text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded p-0.5"><CheckCircle size={14} /></button>
            <button onClick={() => setIsCreatingTable(false)} className="text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded p-0.5"><X size={14} /></button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Table Definition */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[600px]">
          <div className="flex justify-between items-center mb-3 shrink-0">
             <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
               Entries
               <span className="text-[10px] normal-case font-normal text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                 {filteredEntries.length} / {activeTable.entries.length}
               </span>
             </h4>
             <span className="text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800">
               {activeTable.name}
            </span>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-2 mb-3 shrink-0">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search keys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-8 pr-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-200 transition-colors"
              />
            </div>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="text-xs px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">All</option>
              <option value="forward">Forward</option>
              <option value="drop">Drop</option>
              <option value="modify">Modify</option>
            </select>
            
            {(searchTerm || filterAction !== 'all') && (
              <button 
                onClick={() => { setSearchTerm(''); setFilterAction('all'); }}
                className="flex items-center gap-1 text-xs px-2 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded transition-colors animate-in fade-in slide-in-from-right-2"
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>

          {/* Default Action Config */}
          <div className="mb-3 shrink-0 bg-slate-100 dark:bg-slate-900/50 p-2 rounded border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <Settings size={12} className="text-slate-400" />
                 <span className="text-[10px] font-bold text-slate-500 uppercase">Default Action</span>
              </div>
              <div className="flex items-center gap-2">
                 <select 
                   value={activeTable.defaultAction.action}
                   onChange={(e) => updateDefaultAction(e.target.value as any, activeTable.defaultAction.param)}
                   className="text-[10px] px-1 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded outline-none cursor-pointer dark:text-slate-200"
                 >
                   <option value="forward">FORWARD</option>
                   <option value="drop">DROP</option>
                   <option value="modify">MODIFY</option>
                 </select>
                 <input 
                   type="text"
                   value={activeTable.defaultAction.param}
                   onChange={(e) => updateDefaultAction(activeTable.defaultAction.action, e.target.value)}
                   className="w-16 text-[10px] px-1 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded outline-none dark:text-slate-200"
                   placeholder="Param"
                 />
              </div>
          </div>
          
          {/* Entries List */}
          <div className="space-y-2 mb-4 overflow-y-auto pr-1 scrollbar-thin flex-1">
            {activeTable.entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-600 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg h-full">
                    <GripHorizontal size={24} className="mb-2 opacity-50" />
                    <span className="text-xs italic">Table is empty.</span>
                    <span className="text-[10px] mt-1 opacity-70">Add a rule below.</span>
                </div>
            ) : filteredEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-600 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg h-full">
                    <Search size={24} className="mb-2 opacity-50" />
                    <span className="text-xs italic">No matching entries.</span>
                </div>
            ) : (
                filteredEntries.map(entry => {
                // Determine visual state based on match result
                const isMatched = matchResult?.tableId === activeTableId && matchResult.hit && matchResult.entry?.id === entry.id;
                const isOtherHit = matchResult?.tableId === activeTableId && matchResult.hit && !isMatched;

                return (
                    <div 
                        key={entry.id} 
                        className={`relative flex items-center justify-between p-3 rounded-md border shadow-sm text-xs transition-all duration-300 group ${
                            isMatched 
                            ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 ring-1 ring-emerald-400 dark:ring-emerald-600 z-10' 
                            : isOtherHit
                                ? 'bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60' 
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                        }`}
                    >
                        <div className="flex gap-3 items-center flex-1 min-w-0">
                          <span className={`font-mono truncate ${isMatched ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`} title={entry.matchKey}>
                              {entry.matchKey}
                          </span>
                          
                          {/* Action Badge */}
                          <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            entry.action === 'drop' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                            entry.action === 'forward' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' :
                            'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                          }`}>
                             {entry.action === 'drop' && <Ban size={10} />}
                             {entry.action === 'forward' && <ArrowRight size={10} />}
                             {entry.action === 'modify' && <Edit size={10} />}
                             {entry.action}
                          </div>

                          <span className="text-slate-400 dark:text-slate-500 truncate" title={entry.param}>{entry.param}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 pl-2">
                            {isMatched && (
                                <span className="animate-in zoom-in spin-in-1 text-[10px] font-bold text-white bg-emerald-500 px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                                    HIT <CheckCircle size={10} />
                                </span>
                            )}
                            <button onClick={() => removeEntry(entry.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                );
                })
            )}
          </div>

          {/* Add Entry Form */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
            <div className="flex gap-2 mb-2">
              <div className="flex-1">
                <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Match Key</label>
                <input 
                  type="text" 
                  value={newMatch} 
                  onChange={(e) => setNewMatch(e.target.value)}
                  placeholder="IP / Header..." 
                  className="w-full text-xs p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded focus:ring-2 focus:ring-indigo-500 outline-none dark:text-slate-200"
                />
              </div>
              <div className="w-1/3">
                 <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Param</label>
                 <input 
                  type="text" 
                  value={newParam} 
                  onChange={(e) => setNewParam(e.target.value)}
                  placeholder="Port/Val" 
                  className="w-full text-xs p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded focus:ring-2 focus:ring-indigo-500 outline-none dark:text-slate-200"
                />
              </div>
            </div>

            <div className="flex gap-2 items-center">
               <div className="flex-1">
                  <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Action</label>
                  <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded border border-slate-200 dark:border-slate-800">
                    <button 
                      onClick={() => setNewAction('forward')}
                      className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-[10px] font-bold transition-all ${
                        newAction === 'forward' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                      title="Forward"
                    >
                      <ArrowRight size={12} /> FWD
                    </button>
                    <button 
                      onClick={() => setNewAction('drop')}
                      className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-[10px] font-bold transition-all ${
                        newAction === 'drop' ? 'bg-white dark:bg-slate-700 text-red-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                      title="Drop"
                    >
                      <Ban size={12} /> DROP
                    </button>
                    <button 
                      onClick={() => setNewAction('modify')}
                      className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-[10px] font-bold transition-all ${
                        newAction === 'modify' ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                      title="Modify"
                    >
                      <Edit size={12} /> MOD
                    </button>
                  </div>
               </div>
               
               <div className="flex flex-col justify-end">
                 <button 
                    onClick={addEntry}
                    disabled={!newMatch}
                    className="mt-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white h-[30px] w-[30px] rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    title="Add Entry"
                 >
                   <Plus size={16} />
                 </button>
               </div>
            </div>
          </div>
        </div>

        {/* Packet Simulator */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Play size={16} className="text-indigo-500" /> Packet Simulator
          </h4>

          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
               <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2 block">Test Packet Header</label>
               <div className="flex gap-2">
                 <input 
                    type="text" 
                    value={testPacket}
                    onChange={(e) => setTestPacket(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none dark:text-slate-200"
                    placeholder="10.0.0.1"
                    onKeyDown={(e) => e.key === 'Enter' && runTest()}
                 />
                 <button 
                   onClick={runTest}
                   className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded font-medium text-sm transition shadow-sm"
                 >
                   Check
                 </button>
               </div>
               <p className="text-[10px] text-slate-400 mt-2">Enter a value to simulate a packet entering the pipeline stage.</p>
            </div>

            <div className="relative min-h-[160px]">
              {matchResult && matchResult.tableId === activeTableId ? (
                <div className={`animate-in fade-in slide-in-from-bottom-2 rounded-xl p-5 border-l-4 shadow-sm ${
                  matchResult.hit 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500' 
                    : 'bg-slate-100 dark:bg-slate-800 border-indigo-400'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${matchResult.hit ? 'text-emerald-500' : 'text-indigo-500'}`}>
                      {matchResult.hit ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                    </div>
                    <div>
                      <h5 className={`font-bold text-sm mb-1 ${matchResult.hit ? 'text-emerald-800 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-300'}`}>
                        {matchResult.hit ? 'MATCH FOUND' : 'MISS - DEFAULT ACTION'}
                      </h5>
                      
                      <div className="text-xs space-y-2 mt-3">
                        {matchResult.hit ? (
                           <>
                             <div className="flex items-center gap-2">
                               <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold w-12">Rule ID:</span>
                               <span className="font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/50">{matchResult.entry?.id}</span>
                             </div>
                             <div className="flex items-center gap-2">
                               <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold w-12">Matched:</span>
                               <span className="font-mono text-slate-800 dark:text-slate-200">{matchResult.entry?.matchKey}</span>
                             </div>
                           </>
                        ) : (
                          <p className="text-slate-600 dark:text-slate-400 mb-2">No exact match found in table.</p>
                        )}
                        
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700/50 mt-2">
                           <div className="flex items-center gap-2 mb-1">
                              <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold w-12">Action:</span>
                              <span className={`font-bold uppercase ${
                                (matchResult.hit ? matchResult.entry?.action : matchResult.defaultActionUsed?.action) === 'drop' ? 'text-red-600 dark:text-red-400' :
                                (matchResult.hit ? matchResult.entry?.action : matchResult.defaultActionUsed?.action) === 'forward' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                              }`}>
                                {matchResult.hit ? matchResult.entry?.action : matchResult.defaultActionUsed?.action}
                              </span>
                           </div>
                           <div className="flex items-center gap-2">
                              <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold w-12">Param:</span>
                              <span className="font-mono text-slate-800 dark:text-slate-200">
                                {matchResult.hit ? matchResult.entry?.param : matchResult.defaultActionUsed?.param}
                              </span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600">
                  <div className="w-16 h-1 bg-slate-100 dark:bg-slate-800 rounded mb-3"></div>
                  <span className="text-xs italic text-center">Enter a packet value above to see<br/>which rule triggers.</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default P4MatchActionTable;
