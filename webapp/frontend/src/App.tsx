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
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  
  const [stats, setStats] = useState({
    progress: 15,
    masteryLevel: 'N5 Level',
    wordsLearned: 0,
    lessonsCompleted: 0,
    streakDays: 0
  });

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats({
          progress: data.progress,
          masteryLevel: `${data.masteryLevel} Level`,
          wordsLearned: data.wordsLearned,
          lessonsCompleted: data.lessonsCompleted,
          streakDays: data.streakDays
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (isLoggedIn) {
      timer = setInterval(() => {
        setSessionSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLoggedIn]);

  useEffect(() => {
    const init = async () => {
      if (isLoggedIn) {
        await fetchStats();
      }
    };
    init();
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
    if (!inputValue.trim() || isThinking) return;

    const userMessage: Message = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsThinking(true);
    
    // On mobile, close sidebars when sending a message to focus on chat
    if (window.innerWidth <= 1100) {
      setIsLeftSidebarOpen(false);
      setIsRightSidebarOpen(false);
    }

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
    }, 800);

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
      
      // Update stats
      fetchStats();
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.content,
          reasoning: data.reasoning
        }]);
        // Persist the reasoning in the sidebar
        setThoughts([{
          id: 'reasoning',
          text: (data.reasoning && data.reasoning.trim()) ? data.reasoning : "No pedagogical reasoning provided for this response.",
          status: 'active'
        }]);
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
      <div className="login-container">
        <div className="login-card">
          <h1>SUPAA LOGIN</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <input 
                type="text" 
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="superagents"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {loginError && <p className="error-msg">{loginError}</p>}
            <button type="submit" className="login-btn">SIGN IN</button>
          </form>
        </div>
      </div>
    );
  }

  const closeSidebars = () => {
    setIsLeftSidebarOpen(false);
    setIsRightSidebarOpen(false);
  };

  return (
    <div className={`dashboard-container ${isLeftSidebarOpen ? 'left-open' : ''} ${isRightSidebarOpen ? 'right-open' : ''}`}>
      <header className="top-bar">
        <button 
          className="mobile-toggle-btn left" 
          onClick={(e) => {
            e.stopPropagation();
            setIsLeftSidebarOpen(!isLeftSidebarOpen);
            setIsRightSidebarOpen(false);
          }}
        >
          {isLeftSidebarOpen ? '✕' : '☰'}
        </button>
        
        <div className="top-bar-title">
          <h1>TUTOR: <span className="title-short">EN-JP</span><span className="title-full">English-Japanese Mastery</span></h1>
        </div>
        
        <div className="top-bar-right">
          <div 
            className={`mode-toggle ${learningMode ? 'active' : ''}`} 
            onClick={(e) => {
              e.stopPropagation();
              setLearningMode(!learningMode);
            }}
          >
            <span className="mode-text-full">{learningMode ? '🎓 LEARNING MODE ON' : '💬 CHAT MODE'}</span>
            <span className="mode-text-short">{learningMode ? '🎓' : '💬'}</span>
          </div>
          <div className="session-timer">SESSION: {formatTime(sessionSeconds)}</div>
          
          <button 
            className="mobile-toggle-btn right" 
            onClick={(e) => {
              e.stopPropagation();
              setIsRightSidebarOpen(!isRightSidebarOpen);
              setIsLeftSidebarOpen(false);
            }}
          >
            {isRightSidebarOpen ? '✕' : '🧠'}
          </button>
        </div>
      </header>

      <div 
        className={`mobile-overlay ${(isLeftSidebarOpen || isRightSidebarOpen) ? 'active' : ''}`} 
        onClick={closeSidebars}
      />

      <nav className={`sidebar-left ${isLeftSidebarOpen ? 'mobile-show' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="nav-group">
          <h3>MENU</h3>
          {navItems.map(item => (
            <div 
              key={item} 
              className={`nav-item ${activeTab === item ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab(item);
                // On mobile, close sidebar after selection
                if (window.innerWidth <= 768) {
                  setIsLeftSidebarOpen(false);
                }
              }}
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
              onClick={(e) => {
                e.stopPropagation();
                setReferenceTopic(referenceTopic === item.name ? null : item.name);
              }}
            >
              {item.name}
            </div>
          ))}
        </div>

        {referenceTopic && (
          <div className="reference-detail">
            <h4>{referenceTopic}</h4>
            <p>{referenceItems.find(i => i.name === referenceTopic)?.info}</p>
          </div>
        )}

        <div className="stats-container">
          <h3>STATS</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Progress:</span>
              <span className="stat-value">{stats.progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${stats.progress}%` }}></div>
            </div>
            <div className="stat-item">
              <span className="stat-label">Mastery:</span>
              <span className="stat-value">{stats.masteryLevel}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Words:</span>
              <span className="stat-value">{stats.wordsLearned}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Streak:</span>
              <span className="stat-value">{stats.streakDays} days</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="main-content" onClick={closeSidebars}>
        <div className="chat-window">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`bubble ${msg.role}`}
              onClick={(e) => {
                e.stopPropagation();
                if (msg.role === 'assistant' && msg.reasoning) {
                  setThoughts([{
                    id: 'reasoning',
                    text: msg.reasoning,
                    status: 'active'
                  }]);
                  // On mobile, if they click a bubble, show the reasoning sidebar automatically
                  if (window.innerWidth <= 1100) {
                    setIsRightSidebarOpen(true);
                  }
                }
              }}
            >
              <div className="content">{msg.content}</div>
              {msg.reasoning && (
                <>
                  <div 
                    className="reasoning-toggle"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedReasoning(expandedReasoning === idx ? null : idx);
                    }}
                  >
                    <span>🧠</span> {expandedReasoning === idx ? 'Hide Reasoning' : 'Show Reasoning'}
                  </div>
                  {expandedReasoning === idx && (
                    <div className="reasoning-content" onClick={(e) => e.stopPropagation()}>
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

        <div className="chat-input-container" onClick={(e) => e.stopPropagation()}>
          <input 
            type="text" 
            className="chat-input" 
            placeholder={learningMode ? `Ask about ${activeTab.toLowerCase()}...` : "Chat in Japanese..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isThinking}
          />
          <button className="send-button" onClick={handleSend} disabled={isThinking}>
            {isThinking ? '...' : 'SEND'}
          </button>
        </div>
      </main>

      <aside className={`sidebar-right ${isRightSidebarOpen ? 'mobile-show' : ''}`} onClick={(e) => e.stopPropagation()}>
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
