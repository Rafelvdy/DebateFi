import * as React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import WordCloudPage from './pages/WordCloudPage';
import DebateCard from './components/DebateCard';
import './App.css';
import { Debate } from './types/Debate';

const App: React.FC = () => {
  const [debates, setDebates] = useState<Debate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'dateDesc' | 'dateAsc' | 'sentiment'>('dateDesc');
  const [sentimentRange, setSentimentRange] = useState(100);
  const [dateDirection, setDateDirection] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    const generateAndFetchDebates = async () => {
      try {
        // First fetch existing debates
        const response = await fetch('http://localhost:3001/api/debates');
        const jsonData = await response.json();
        const debateArray = Object.values(jsonData.data).map((item: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          ...item.data
        }));
        setDebates(debateArray);

        // Then generate new debates
        await fetch('http://localhost:3001/api/generate', {
          method: 'POST'
        });

        // Fetch updated debates after generation
        const updatedResponse = await fetch('http://localhost:3001/api/debates');
        const updatedJsonData = await updatedResponse.json();
        const updatedDebateArray = Object.values(updatedJsonData.data).map((item: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          ...item.data
        }));
        setDebates(updatedDebateArray);
      } catch (error) {
        console.error('Error fetching debates:', error);
      }
    };

    generateAndFetchDebates();
  }, []);

  const getFilteredAndSortedDebates = () => {
    if (!debates) return [];
    
    let filtered = [...debates];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(debate =>
        debate.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        debate.summary.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sentiment range filter
    filtered = filtered.filter(debate => {
      const rating = parseInt(debate.rating);
      return !isNaN(rating) && rating <= sentimentRange;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'sentiment') {
        return parseInt(b.rating) - parseInt(a.rating);
      }
      // Add other sorting logic as needed
      return 0;
    });

    return filtered;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="main-container">
            <div className="card-container">
              <div className="title-container">
                <h1 className="title">Crypto Debates</h1>
                <p className="subtitle">Real-time Analysis of Crypto Twitter</p>
                <button 
                  className="generate-button"
                  onClick={async () => {
                    try {
                      await fetch('http://localhost:3001/api/generate', {
                        method: 'POST'
                      });
                      const response = await fetch('http://localhost:3001/api/debates');
                      const jsonData = await response.json();
                      const debateArray = Object.values(jsonData.data).map((item: any) => ({
                        id: Math.random().toString(36).substr(2, 9),
                        ...item.data
                      }));
                      setDebates(debateArray);
                    } catch (error) {
                      console.error('Error generating debates:', error);
                    }
                  }}
                >
                  Generate New Debates
                </button>
              </div>

              <div className="controls">
                <div className="search-filters">
                  <input
                    type="text"
                    placeholder="Search debates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="events-list">
                {getFilteredAndSortedDebates().length === 0 ? (
                  <div className="no-debates">No debates found</div>
                ) : (
                  getFilteredAndSortedDebates().map((debate) => (
                    <DebateCard key={debate.id} debate={debate} />
                  ))
                )}
              </div>
            </div>
          </div>
        } />
        <Route path="/wordcloud" element={
          <WordCloudPage 
            debates={debates}
            sortBy={sortBy}
            sentimentRange={sentimentRange}
          />
        } />
      </Routes>
    </Router>
  );
};

export default App;