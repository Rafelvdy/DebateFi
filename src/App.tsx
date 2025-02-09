import * as React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import WordCloudPage from './pages/WordCloudPage';
import './App.css';

interface Debate {
  ticker: string;
  summary: string;
  reason: string;
  analysis: string;
  rating: string;
}

const App: React.FC = () => {
  const [debates, setDebates] = useState<Debate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'dateDesc' | 'dateAsc' | 'sentiment'>('dateDesc');
  const [sentimentRange, setSentimentRange] = useState(100);
  const [dateDirection, setDateDirection] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    const fetchDebates = async () => {
      try {
        const response = await fetch('/api/debates');
        if (!response.ok) throw new Error('Failed to fetch debates');
        const data = await response.json();
        setDebates(data.prompt_num);
      } catch (error) {
        console.error('Error fetching debates:', error);
      }
    };

    fetchDebates();
  }, []);

  const getSentimentColor = (sentiment: number) => {
    const red = Math.round(255 * (1 - sentiment));
    const green = Math.round(255 * sentiment);
    return `rgba(${red}, ${green}, 0, 0.8)`;
  };

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
    return debates
      .filter(debate => {
        const matchesSearch = debate.summary.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (sortBy === 'sentiment') {
          return matchesSearch && (parseFloat(debate.rating) <= sentimentRange);
        }
        return matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'sentiment':
            return parseFloat(b.rating) - parseFloat(a.rating);
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
                  <div key={debate.ticker} className="event-card">
                    <div className="content-section">
                      <h3>Overview</h3>
                      <p className="description">{debate.summary}</p>
                    </div>

                    <div className="content-section">
                      <h3>Why This Matters</h3>
                      <p className="importance">{debate.reason}</p>
                    </div>

                    <div className="content-section">
                      <h3>Analysis</h3>
                      <p className="analysis">{debate.analysis}</p>
                    </div>

                    <div className="sentiment-container">
                      <span>Rating:</span>
                      <div className="sentiment-bar">
                        <div 
                          className="sentiment-fill"
                          style={{ 
                            width: `${parseFloat(debate.rating)}%`,
                            backgroundColor: getSentimentColor(parseFloat(debate.rating) / 100)
                          }}
                        />
                        <span className="sentiment-value">
                          {debate.rating}
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
              debates={debates}
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