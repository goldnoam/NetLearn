
import React from 'react';
import { TopicData } from '../types';
import { getIcon } from '../constants';
import { BookOpen, Moon, Sun } from 'lucide-react';

interface SidebarProps {
  topics: TopicData[];
  activeTopicId: string;
  onSelectTopic: (id: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ topics, activeTopicId, onSelectTopic, isDarkMode, toggleTheme }) => {
  return (
    <div className="w-72 bg-slate-900 dark:bg-slate-950 h-full flex flex-col text-slate-300 shrink-0 border-r border-slate-800">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
            <BookOpen size={18} />
          </div>
          <span className="font-bold text-white text-lg tracking-wide">NetLearn</span>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {topics.map((topic) => {
          const isActive = topic.id === activeTopicId;
          return (
            <button
              key={topic.id}
              onClick={() => onSelectTopic(topic.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className={`${isActive ? 'text-indigo-200' : 'text-slate-500 group-hover:text-slate-300'}`}>
                {getIcon(topic.icon, { size: 20 })}
              </div>
              <span className="font-medium text-sm text-left">{topic.title}</span>
            </button>
          );
        })}
      </div>

      <div className="p-6 border-t border-slate-800 text-xs text-slate-500 text-center">
        v1.2.0 &bull; NetLearn
      </div>
    </div>
  );
};

export default Sidebar;
