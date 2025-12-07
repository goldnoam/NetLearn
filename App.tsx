
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopicContent from './components/TopicContent';
import { TOPICS } from './constants';
import { TopicId } from './types';

const App: React.FC = () => {
  const [activeTopicId, setActiveTopicId] = useState<string>(TopicId.WELCOME);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Initialize from URL and handle theme
  useEffect(() => {
    // Theme
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // URL Routing
    const params = new URLSearchParams(window.location.search);
    const topicParam = params.get('topic');
    if (topicParam && TOPICS.some(t => t.id === topicParam)) {
      setActiveTopicId(topicParam);
    }
  }, [isDarkMode]);

  const handleSelectTopic = (id: string) => {
    setActiveTopicId(id);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('topic', id);
    window.history.pushState({}, '', newUrl);
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const activeTopic = TOPICS.find(t => t.id === activeTopicId) || TOPICS[0];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      <Sidebar 
        topics={TOPICS} 
        activeTopicId={activeTopicId} 
        onSelectTopic={handleSelectTopic}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
            <TopicContent data={activeTopic} />
        </div>
      </main>
    </div>
  );
};

export default App;
