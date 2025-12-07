
import React, { useState } from 'react';

const RDMAQueuePair = () => {
  const [sqItems, setSqItems] = useState<number[]>([]);
  const [cqItems, setCqItems] = useState<number[]>([]);
  const [mrRegistered, setMrRegistered] = useState(false);

  const registerMr = () => {
    setMrRegistered(true);
  };

  const deregisterMr = () => {
    setMrRegistered(false);
    // Optional: clear queues if MR is gone, but in reality queues persist
  };

  const postSend = () => {
    if (!mrRegistered) return;
    const id = Math.floor(Math.random() * 1000);
    setSqItems(prev => [...prev, id]);
    
    // Simulate completion after delay
    setTimeout(() => {
      setSqItems(prev => prev.filter(x => x !== id));
      setCqItems(prev => [...prev, id]);
    }, 2000);
  };

  const pollCq = () => {
    if (cqItems.length > 0) {
      setCqItems(prev => prev.slice(1));
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">RDMA Work Queue Model</h3>
        
        {/* MR Controls */}
        <div className="flex items-center gap-2">
          <div className={`text-xs px-2 py-1 rounded font-mono border ${mrRegistered ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
             MR: {mrRegistered ? 'REGISTERED' : 'UNREGISTERED'}
          </div>
          {!mrRegistered ? (
             <button onClick={registerMr} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition">
               Register MR
             </button>
          ) : (
             <button onClick={deregisterMr} className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition">
               Deregister MR
             </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        {!mrRegistered && (
           <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-900/80 z-10 flex items-center justify-center backdrop-blur-[1px] rounded">
              <div className="bg-white dark:bg-slate-800 p-3 rounded shadow-lg border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-bold">
                 Memory Region Not Registered
              </div>
           </div>
        )}

        {/* Send Queue */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Send Queue (SQ)</span>
            <button 
              onClick={postSend}
              disabled={!mrRegistered}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post Send (WR)
            </button>
          </div>
          <div className="h-40 bg-slate-100 dark:bg-slate-950 rounded-md p-2 border border-slate-200 dark:border-slate-800 overflow-y-auto relative transition-colors">
             {sqItems.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-slate-600 text-xs">Empty</div>}
             <div className="flex flex-col-reverse gap-2">
               {sqItems.map(item => (
                 <div key={item} className="bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-900/50 p-2 rounded shadow-sm text-xs flex justify-between animate-pulse text-slate-700 dark:text-slate-200">
                   <span>WR #{item}</span>
                   <span className="text-blue-500 dark:text-blue-400 font-mono">PENDING</span>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Completion Queue */}
        <div className="flex flex-col gap-2">
           <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Completion Queue (CQ)</span>
            <button 
              onClick={pollCq}
              disabled={cqItems.length === 0}
              className="text-xs bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700 active:scale-95 transition disabled:opacity-50"
            >
              Poll CQ
            </button>
          </div>
          <div className="h-40 bg-slate-100 dark:bg-slate-950 rounded-md p-2 border border-slate-200 dark:border-slate-800 overflow-y-auto relative transition-colors">
            {cqItems.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-slate-600 text-xs">Empty</div>}
            <div className="flex flex-col gap-2">
               {cqItems.map(item => (
                 <div key={item} className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-2 rounded shadow-sm text-xs flex justify-between text-slate-700 dark:text-slate-200">
                   <span>WC for #{item}</span>
                   <span className="text-emerald-600 dark:text-emerald-400 font-bold">SUCCESS</span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-500 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-2 transition-colors">
        1. <strong>Register MR</strong> to allow NIC access to memory buffer.<br/>
        2. <strong>Post Send</strong> creates a Work Request (WR) in the Send Queue. <br/>
        3. The NIC processes it asynchronously (simulated delay). <br/>
        4. A Work Completion (WC) is pushed to the CQ. <br/>
        5. <strong>Poll CQ</strong> consumes the completion event.
      </div>
    </div>
  );
};

export default RDMAQueuePair;
