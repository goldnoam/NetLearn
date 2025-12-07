
import React, { useEffect, useState } from 'react';

const RingAllReduce = () => {
  const [step, setStep] = useState(0);
  const nodes = [0, 1, 2, 3];
  
  // Simple simulation of data chunks moving
  // 0 -> 1 -> 2 -> 3 -> 0
  
  useEffect(() => {
    const timer = setInterval(() => {
      setStep(s => (s + 1) % 8);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const getPos = (index: number) => {
    // Circle layout
    const angle = (index * 90) * (Math.PI / 180);
    const radius = 80;
    const cx = 150;
    const cy = 150;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle)
    };
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center transition-colors">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 self-start w-full">NCCL Ring Topology Visualization</h3>
      
      <svg width="300" height="300" className="overflow-visible">
        {/* Connections */}
        {nodes.map((i) => {
          const start = getPos(i);
          const end = getPos((i + 1) % 4);
          return (
            <g key={`link-${i}`}>
               <path 
                d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`} 
                stroke="#64748b" 
                strokeWidth="4"
                strokeOpacity="0.3"
              />
              {/* Moving Data Packet */}
              <circle r="6" fill="#6366f1">
                <animateMotion 
                  dur="1.5s" 
                  repeatCount="indefinite"
                  path={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
                />
              </circle>
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((i) => {
          const pos = getPos(i);
          return (
            <g key={`node-${i}`}>
              <circle cx={pos.x} cy={pos.y} r="24" className="fill-white dark:fill-slate-800 stroke-slate-700 dark:stroke-slate-500" strokeWidth="2" />
              <text x={pos.x} y={pos.y} dy="5" textAnchor="middle" className="text-xs font-bold fill-slate-700 dark:fill-slate-200 select-none">
                GPU {i}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-4 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-3 rounded w-full border border-slate-100 dark:border-slate-800">
        <p className="font-medium">Algorithm Phase: {step < 4 ? 'Scatter-Reduce' : 'All-Gather'}</p>
        <p className="text-xs mt-1 text-slate-500 dark:text-slate-500">
          Data chunks circulate the ring. Each GPU receives a chunk, performs a reduction (sum), and sends it to the next neighbor.
        </p>
      </div>
    </div>
  );
};

export default RingAllReduce;
