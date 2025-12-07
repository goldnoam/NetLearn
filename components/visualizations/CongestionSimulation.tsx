
import React, { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CongestionSimulation = () => {
  const [data, setData] = useState<{ time: number; cwnd: number; ssthresh: number }[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  
  // Simulation state
  const stateRef = useRef({
    cwnd: 1,
    ssthresh: 32,
    time: 0,
    phase: 'slow_start' as 'slow_start' | 'avoidance'
  });

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const s = stateRef.current;
      
      // Basic TCP Reno-like simulation
      // Grow
      if (s.phase === 'slow_start') {
        s.cwnd += 1; // Exponential growth roughly
        if (s.cwnd >= s.ssthresh) {
          s.phase = 'avoidance';
        }
      } else {
        s.cwnd += 1 / s.cwnd; // Linear growth
      }

      // Random Drop event
      const dropChance = s.cwnd > 40 ? 0.1 : (s.cwnd > 20 ? 0.02 : 0.001);
      if (Math.random() < dropChance) {
        // Congestion event
        s.ssthresh = Math.max(2, Math.floor(s.cwnd / 2));
        s.cwnd = s.ssthresh;
        s.phase = 'avoidance';
      }

      s.time += 1;

      setData(prev => {
        const next = [...prev, { time: s.time, cwnd: Math.floor(s.cwnd), ssthresh: s.ssthresh }];
        if (next.length > 50) next.shift();
        return next;
      });

    }, 100);

    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Live Congestion Window (cwnd) Simulation</h3>
        <button 
          onClick={() => setIsRunning(!isRunning)}
          className="text-xs px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800 transition"
        >
          {isRunning ? 'Pause' : 'Resume'}
        </button>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
            <XAxis dataKey="time" hide />
            <YAxis domain={[0, 60]} hide />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              itemStyle={{ fontSize: '12px', color: '#64748b' }}
            />
            <Line 
              type="monotone" 
              dataKey="cwnd" 
              stroke="#6366f1" 
              strokeWidth={2} 
              dot={false} 
              isAnimationActive={false}
            />
            <Line 
              type="step" 
              dataKey="ssthresh" 
              stroke="#fb7185" 
              strokeWidth={2} 
              strokeDasharray="4 4" 
              dot={false} 
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-1 bg-indigo-500"></div> CWND (Congestion Window)
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-1 bg-rose-400 border-dashed border-b-2"></div> SSTHRESH (Slow Start Threshold)
        </div>
      </div>
    </div>
  );
};

export default CongestionSimulation;
