import React, { useState, useEffect, useRef } from 'react';
import './App.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
}

interface Thought {
  id: string;
  text: string;
  status: 'pending' | 'active' | 'completed';
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'こんばんは！ (Good evening!) How can I help you learn today?',
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [expandedReasoning, setExpandedReasoning] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('Intro');
  const [referenceTopic, setReferenceTopic] = useState<string | null>(null);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, thoughts]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsThinking(true);
    
    const pedagogicalThoughts: Thought[] = [
      { id: '1', text: 'Analyzing student intent...', status: 'active' },
      { id: '2', text: 'Mapping grammatical structures...', status: 'pending' },
      { id: '3', text: 'Checking cultural nuance...', status: 'pending' },
      { id: '4', text: 'Selecting appropriate formality level...', status: 'pending' },
    ];
    setThoughts(pedagogicalThoughts);

    // Simulate thought progression
    let currentThought = 0;
    const thoughtInterval = setInterval(() => {
      currentThought++;
      if (currentThought < pedagogicalThoughts.length) {
        setThoughts(prev => prev.map((t, i) => {
          if (i < currentThought) return { ...t, status: 'completed' };
          if (i === currentThought) return { ...t, status: 'active' };
          return t;
        }));
      } else {
        clearInterval(thoughtInterval);
      }
    }, 1000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputValue, context: activeTab }),
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      
      clearInterval(thoughtInterval);
      setThoughts(pedagogicalThoughts.map(t => ({ ...t, status: 'completed' })));
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.content,
          reasoning: data.reasoning
        }]);
        setThoughts([]);
        setIsThinking(false);
      }, 500);

    } catch (error) {
      clearInterval(thoughtInterval);
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }]);
      setIsThinking(false);
    }
  };

  const navItems = ['Intro', 'Grammar', 'Vocab'];
  const referenceItems = [
    { name: 'Neko (猫)', info: 'Cat. Often used with the particle が or は.' },
    { name: 'Suki (好き)', info: 'To like. Takes the particle が for the object of liking.' },
    { name: 'Desu (です)', info: 'The polite copula (to be). Used at the end of sentences.' }
  ];

  return (
    <div className="dashboard-container">
      <header className="top-bar">
        <h1>TUTOR: English-Japanese Mastery</h1>
        <div className="session-timer">SESSION: {formatTime(sessionSeconds)}</div>
      </header>

      <nav className="sidebar-left">
        <div className="nav-group">
          <h3>MENU</h3>
          {navItems.map(item => (
            <div 
              key={item} 
              className={`nav-item ${activeTab === item ? 'active' : ''}`}
              onClick={() => setActiveTab(item)}
            >
              {item}
            </div>
          ))}
        </div>
        
        <div className="nav-group">
          <h3>REFERENCE</h3>
          {referenceItems.map(item => (
            <div 
              key={item.name} 
              className={`nav-item ${referenceTopic === item.name ? 'active' : ''}`}
              onClick={() => setReferenceTopic(referenceTopic === item.name ? null : item.name)}
            >
              {item.name}
            </div>
          ))}
        </div>

        {referenceTopic && (
          <div className="reference-panel">
            <h4>{referenceTopic}</h4>
            <p>{referenceItems.find(i => i.name === referenceTopic)?.info}</p>
          </div>
        )}

        <div className="stats-container">
          <h3>STATS</h3>
          <div>Progress: 15%</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '15%' }}></div>
          </div>
          <div style={{ marginTop: '8px' }}>Mastery: N5 Level</div>
        </div>
      </nav>

      <main className="main-content">
        <div className="chat-window">
          {messages.map((msg, idx) => (
            <div key={idx} className={`bubble ${msg.role}`}>
              <div className="content">{msg.content}</div>
              {msg.reasoning && (
                <>
                  <div 
                    className="reasoning-toggle"
                    onClick={() => setExpandedReasoning(expandedReasoning === idx ? null : idx)}
                  >
                    <span>🧠</span> {expandedReasoning === idx ? 'Hide Reasoning' : 'Show Reasoning'}
                  </div>
                  {expandedReasoning === idx && (
                    <div className="reasoning-content">
                      {msg.reasoning}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
          {isThinking && (
            <div className="bubble tutor thinking">
              <span className="pulse">Thinking...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input-container">
          <input 
            type="text" 
            className="chat-input" 
            placeholder={`Ask about ${activeTab.toLowerCase()}...`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="send-button" onClick={handleSend} disabled={isThinking}>
            {isThinking ? '...' : 'SEND'}
          </button>
        </div>
      </main>

      <aside className="sidebar-right">
        <h3>PEDAGOGICAL REASONING</h3>
        <div className="thoughts-stream">
          {thoughts.length === 0 && !isThinking && (
            <div className="thought-node">Awaiting student input...</div>
          )}
          {thoughts.map(thought => (
            <div key={thought.id} className={`thought-node ${thought.status}`}>
              {thought.text}
            </div>
          ))}
        </div>
      </aside>

      <footer className="bottom-bar">
        <div className="status-badge">MODEL: GEMMA4-4B</div>
        <div className="status-badge" style={{ marginLeft: 'auto' }}>CONTEXT: {activeTab.toUpperCase()}</div>
      </footer>
    </div>
  );
}

export default App;
