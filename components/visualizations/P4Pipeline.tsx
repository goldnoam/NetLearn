
import React, { useState, useEffect } from 'react';
import P4MatchActionTable from './P4MatchActionTable';
import { ArrowRight } from 'lucide-react';

const P4Pipeline = () => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'table'>('pipeline');
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const [packetPos, setPacketPos] = useState(0);

  const stages = [
    { id: 1, name: "Parser", desc: "Extracts headers (Eth, IP, TCP) from raw bits." },
    { id: 2, name: "Ingress", desc: "Match-Action Tables. Decisions (L3 fwd, ACLs) made before queuing." },
    { id: 3, name: "Traffic Mgr", desc: "Queuing, Scheduling, Replication, Buffer Management." },
    { id: 4, name: "Egress", desc: "Post-queue Match-Action. Header modifications before exit." },
    { id: 5, name: "Deparser", desc: "Reassembles headers back into a wire-format packet." }
  ];

  // Animation loop
  useEffect(() => {
    let animationFrameId: number;
    
    const animate = () => {
      setPacketPos(prev => {
        const next = prev + 0.3; // Smooth slow movement
        return next > 100 ? 0 : next;
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Calculate which stage the packet is currently in for highlighting
  useEffect(() => {
    // 5 stages distributed over 0-100. Each stage is roughly 20 units.
    const stageIndex = Math.floor(packetPos / 20);
    if (stageIndex >= 0 && stageIndex < 5) {
      setActiveStage(stageIndex);
    } else {
      setActiveStage(null);
    }
  }, [packetPos]);

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {activeTab === 'pipeline' ? 'P4 Processing Pipeline' : 'Match-Action Table Playground'}
        </h3>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('pipeline')}
            className={`text-xs px-3 py-1 rounded-md transition-all ${activeTab === 'pipeline' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            Pipeline View
          </button>
          <button 
            onClick={() => setActiveTab('table')}
            className={`text-xs px-3 py-1 rounded-md transition-all ${activeTab === 'table' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            Table Editor
          </button>
        </div>
      </div>
      
      {activeTab === 'pipeline' ? (
        <>
          <div className="relative h-48 w-full flex items-center justify-between px-4 select-none my-8">
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 -z-10 rounded-full"></div>
            
            {/* Progress Line */}
            <div 
                className="absolute top-1/2 left-0 h-1 bg-indigo-500/30 -z-10 rounded-full transition-all duration-75 ease-linear"
                style={{ width: `${packetPos}%` }}
            ></div>
            
            {/* Stages */}
            {stages.map((stage, idx) => {
              const isActive = activeStage === idx;
              const isPassed = packetPos > ((idx + 1) * 20);
              
              return (
                <div 
                  key={stage.id}
                  className={`relative z-10 w-24 h-24 rounded-xl flex flex-col items-center justify-center border-2 transition-all duration-300 ${
                    isActive 
                      ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-500 scale-110 shadow-lg shadow-indigo-500/20' 
                      : isPassed
                        ? 'bg-slate-50 dark:bg-slate-800 border-indigo-200 dark:border-indigo-900/30'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className={`text-xs font-bold mb-1 transition-colors ${isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>
                    {stage.name}
                  </div>
                  <div className={`text-[10px] text-center px-1 leading-tight hidden md:block ${isActive ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                    {isActive ? 'Processing...' : ''}
                  </div>

                  {/* Connector Arrow (except last) */}
                  {idx < stages.length - 1 && (
                     <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700">
                        <ArrowRight size={16} />
                     </div>
                  )}

                  {/* Tooltip on Hover */}
                  <div className="opacity-0 hover:opacity-100 absolute -top-28 left-1/2 -translate-x-1/2 w-48 bg-slate-900 dark:bg-slate-700 text-white text-xs p-3 rounded-lg shadow-xl pointer-events-none transition-opacity z-20">
                    <p className="font-semibold mb-1 text-indigo-300">{stage.name}</p>
                    {stage.desc}
                    <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 dark:bg-slate-700 rotate-45"></div>
                  </div>
                </div>
              );
            })}

            {/* Moving Packet */}
            <div 
              className="absolute top-1/2 w-8 h-5 bg-pink-500 rounded shadow-md z-20 transition-all duration-75 ease-linear flex items-center justify-center border border-pink-400"
              style={{ 
                left: `${packetPos}%`,
                transform: 'translate(-50%, -50%)',
                opacity: packetPos > 98 ? 0 : 1 // Fade out at end
              }}
            >
              {/* Packet decoration */}
              <div className="flex flex-col gap-[2px] w-full px-1">
                 <div className="w-full h-[1px] bg-pink-200/50"></div>
                 <div className="w-2/3 h-[1px] bg-pink-200/50"></div>
              </div>
            </div>

          </div>

          {/* Description Box */}
          <div className="mt-6 bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 min-h-[80px] flex items-center">
            {activeStage !== null ? (
              <div className="animate-in fade-in duration-300">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-base block mb-1">{stages[activeStage].name}</span> 
                {stages[activeStage].desc}
              </div>
            ) : (
              <span className="text-slate-400 dark:text-slate-600 italic">Initializing packet flow...</span>
            )}
          </div>
        </>
      ) : (
        <P4MatchActionTable />
      )}
    </div>
  );
};

export default P4Pipeline;
