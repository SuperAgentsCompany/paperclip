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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUsername === 'superagents' && loginPassword === 'superagents') {
      setIsLoggedIn(true);
    } else {
      setLoginError('Invalid credentials. Hint: superagents / superagents');
    }
  };

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
  const [learningMode, setLearningMode] = useState(true);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: any;
    if (isLoggedIn) {
      timer = setInterval(() => {
        setSessionSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLoggedIn]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isLoggedIn) {
      scrollToBottom();
    }
  }, [messages, thoughts, isLoggedIn]);

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
        body: JSON.stringify({ 
          prompt: inputValue, 
          context: activeTab,
          learningMode: learningMode
        }),
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

  if (!isLoggedIn) {
    return (
      <div className="login-container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#0f172a',
        color: '#f1f5f9',
        fontFamily: 'sans-serif'
      }}>
        <div style={{
          padding: '2rem',
          backgroundColor: '#1e293b',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '400px'
        }}>
          <h1 style={{ color: '#00e5ff', textAlign: 'center', marginBottom: '1.5rem' }}>SUPAA LOGIN</h1>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>Username</label>
              <input 
                type="text" 
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white' }}
                placeholder="superagents"
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>Password</label>
              <input 
                type="password" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white' }}
                placeholder="••••••••"
              />
            </div>
            {loginError && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{loginError}</p>}
            <button type="submit" style={{ 
              marginTop: '1rem',
              padding: '0.75rem', 
              backgroundColor: '#00e5ff', 
              color: '#0a2540', 
              border: 'none', 
              borderRadius: '4px', 
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>SIGN IN</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="top-bar">
        <h1>TUTOR: English-Japanese Mastery</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div 
            className={`mode-toggle ${learningMode ? 'active' : ''}`} 
            onClick={() => setLearningMode(!learningMode)}
            style={{ 
              cursor: 'pointer', 
              padding: '4px 12px', 
              borderRadius: '20px', 
              fontSize: '12px', 
              fontWeight: 'bold',
              backgroundColor: learningMode ? 'var(--color-logic-green)' : 'var(--color-nebula-gray)',
              color: 'var(--color-quantum-blue-deep)',
              transition: 'all 0.3s ease'
            }}
          >
            {learningMode ? '🎓 LEARNING MODE ON' : '💬 CHAT MODE'}
          </div>
          <div className="session-timer">SESSION: {formatTime(sessionSeconds)}</div>
        </div>
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
            placeholder={learningMode ? `Ask about ${activeTab.toLowerCase()}...` : "Chat in Japanese..."}
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
