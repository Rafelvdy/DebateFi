import * as React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import WordCloudPage from './pages/WordCloudPage';
import './App.css';

const App: React.FC = () => {
  const demoDebates = [
    {
      id: 1,
      title: "Bitcoin's Role as Digital Gold",
      date: "2024-03-25",
      description: "yap",
      topic: "Store of Value",
      sentiment: 0.75,
      isHotTopic: true
    },
    {
      id: 2,
      title: "Ethereum's Transition to PoS",
      date: "2024-03-24",
      description: "yap",
      topic: "Consensus Mechanisms",
      sentiment: 0.85,
      isHotTopic: false
    },
    {
      id: 3,
      title: "Layer 2 vs Alternative L1s",
      date: "2024-03-23",
      description: "yap",
      topic: "Scalability",
      sentiment: 0.22,
      isHotTopic: true
    },
    {
      id: 4,
      title: "DeFi's Future",
      date: "2024-03-22",
      description: "yap",
      topic: "DeFi",
      sentiment: 0.95,
      isHotTopic: true
    }
  ];

  const getSentimentColor = (sentiment: number) => {
    const red = Math.round(255 * (1 - sentiment));
    const green = Math.round(255 * sentiment);
    return `rgba(${red}, ${green}, 0, 0.8)`;
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'dateDesc' | 'dateAsc' | 'sentiment'>('dateDesc');
  const [dateDirection, setDateDirection] = useState<'desc' | 'asc'>('desc');
  const [sentimentRange, setSentimentRange] = useState<number>(0);
  const [rotation, setRotation] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const numSquares = 15;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        setMousePosition({
          x: e.clientX,
          y: e.clientY
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const animate = () => {
      setRotation(prev => (prev + 1) % 360);
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const renderSquares = () => {
    return Array.from({ length: numSquares }).map((_, i) => {
      const size = 30 + i * 15;
      const opacity = 1 - (i / numSquares);
      
      return (
        <div
          key={i}
          className="square"
          style={{
            left: mousePosition.x,
            top: mousePosition.y,
            width: size,
            height: size,
            opacity: opacity,
            transform: `translate(-50%, -50%) rotate(${rotation + (i * 5)}deg)`,
          }}
        />
      );
    });
  };

  const handleSortChange = (value: string) => {
    if (value === 'date') {
      if (sortBy.startsWith('date')) {
        const newDirection = dateDirection === 'desc' ? 'asc' : 'desc';
        setDateDirection(newDirection);
        setSortBy(`date${newDirection.charAt(0).toUpperCase() + newDirection.slice(1)}` as 'dateDesc' | 'dateAsc');
      } else {
        setSortBy('dateDesc');
        setDateDirection('desc');
      }
    } else {
      setSortBy(value as 'sentiment');
      setSentimentRange(100);
    }
  };

  const toggleDateDirection = () => {
    const newDirection = dateDirection === 'desc' ? 'asc' : 'desc';
    setDateDirection(newDirection);
    setSortBy(`date${newDirection.charAt(0).toUpperCase() + newDirection.slice(1)}` as 'dateDesc' | 'dateAsc');
  };

  const getFilteredAndSortedDebates = () => {
    return demoDebates
      .filter(debate => {
        const matchesSearch = debate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          debate.topic.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (sortBy === 'sentiment') {
          return matchesSearch && (debate.sentiment * 100 <= sentimentRange);
        }
        return matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'dateDesc':
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          case 'dateAsc':
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          case 'sentiment':
            return b.sentiment - a.sentiment;
          default:
            return 0;
        }
      });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('dateDesc');
    setDateDirection('desc');
    setSentimentRange(0);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="main-container">
            <Link to="/wordcloud" className="menu-button" aria-label="Word Cloud View">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
              </svg>
            </Link>
            <div className="mouse-squares">
              {renderSquares()}
            </div>
            <div className="card-container">
              <h1 className="title">Crypto Community Debates</h1>
              
              <div className="controls">
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Search debates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="sort-controls">
                  <select 
                    value={sortBy.startsWith('date') ? 'date' : sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                  >
                    <option value="date">Sort by Date</option>
                    <option value="sentiment">Community Consensus</option>
                  </select>
                  
                  {sortBy.startsWith('date') ? (
                    <button 
                      className={`direction-toggle ${dateDirection}`}
                      onClick={toggleDateDirection}
                      aria-label="Toggle sort direction"
                    >
                      ↑
                    </button>
                  ) : sortBy === 'sentiment' && (
                    <select
                      className="sentiment-range"
                      value={sentimentRange}
                      onChange={(e) => setSentimentRange(Number(e.target.value))}
                    >
                      {Array.from({ length: 11 }, (_, i) => i * 10).map(value => (
                        <option key={value} value={value}>
                          {value === 0 ? 'Select Range' : `Up to ${value}%`}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {(searchTerm || sortBy !== 'dateDesc' || sentimentRange > 0) && (
                    <button 
                      className="clear-filters"
                      onClick={clearFilters}
                      aria-label="Clear all filters"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              <div className="events-list">
                {getFilteredAndSortedDebates().map((debate) => (
                  <div key={debate.id} className="event-card">
                    <div className="event-header">
                      <h2>{debate.title}</h2>
                      <span className="date">{debate.date}</span>
                    </div>
                    <div className="description-wrapper">
                      <p className="description">{debate.description}</p>
                    </div>
                    <div className="event-details">
                      <span className="location">🏷️ {debate.topic}</span>
                      {debate.isHotTopic && (
                        <span className="announcement-badge">
                          Hot Topic
                        </span>
                      )}
                    </div>
                    <div className="sentiment-container">
                      <span>Community Consensus:</span>
                      <div className="sentiment-bar">
                        <div 
                          className="sentiment-fill"
                          style={{ 
                            width: `${debate.sentiment * 100}%`,
                            backgroundColor: getSentimentColor(debate.sentiment)
                          }}
                        />
                        <span className="sentiment-value">
                          {(debate.sentiment * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        } />
        <Route path="/wordcloud" element={
          <>
            <Link to="/" className="menu-button" aria-label="Back to List View">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
            </Link>
            <WordCloudPage 
              debates={demoDebates} 
              sortBy={sortBy} 
              sentimentRange={sentimentRange}
            />
          </>
        } />
      </Routes>
    </Router>
  );
};

export default App;