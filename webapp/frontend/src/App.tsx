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
  
  const chatEndRef = useRef<HTMLDivElement>(null);

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
    }, 1500);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputValue }),
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      
      clearInterval(thoughtInterval);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content,
        reasoning: data.reasoning
      }]);
      setThoughts([]);
    } catch (error) {
      clearInterval(thoughtInterval);
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="top-bar">
        <h1>TUTOR: English-Japanese Mastery</h1>
        <div className="session-timer">SESSION: 00:15</div>
      </header>

      <nav className="sidebar-left">
        <div className="nav-group">
          <h3>MENU</h3>
          <div className="nav-item active">Intro</div>
          <div className="nav-item">Grammar</div>
          <div className="nav-item">Vocab</div>
        </div>
        
        <div className="nav-group">
          <h3>REFERENCE</h3>
          <div className="nav-item">Neko (猫)</div>
          <div className="nav-item">Suki (好き)</div>
          <div className="nav-item">Desu (です)</div>
        </div>

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
              <span className="pulse">...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input-container">
          <input 
            type="text" 
            className="chat-input" 
            placeholder="Type here..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="send-button" onClick={handleSend}>SEND</button>
        </div>
      </main>

      <aside className="sidebar-right">
        <h3>REASONING</h3>
        <div className="thoughts-stream">
          {thoughts.length === 0 && !isThinking && (
            <div className="thought-node">Awaiting input...</div>
          )}
          {thoughts.map(thought => (
            <div key={thought.id} className={`thought-node ${thought.status}`}>
              {thought.text}
            </div>
          ))}
          {isThinking && thoughts.length > 0 && (
             <div className="thought-node active pulse">Thinking...</div>
          )}
        </div>
      </aside>

      <footer className="bottom-bar">
        <div className="status-badge">MODEL: GEMMA4-4B</div>
      </footer>
    </div>
  );
}

export default App;
