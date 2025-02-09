import * as React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import WordCloudPage from './pages/WordCloudPage';
import DebateCard from './components/DebateCard';
import './App.css';
import { Debate } from './types/Debate';

const App: React.FC = () => {
  const [debates, setDebates] = useState<Debate[]>([]);
  const [sortBy, setSortBy] = useState<'dateDesc' | 'dateAsc' | 'sentiment'>('dateDesc');
  const [sentimentRange, setSentimentRange] = useState(100);
  const [dateDirection, setDateDirection] = useState<'desc' | 'asc'>('desc');
  const [isLoading, setIsLoading] = useState(false);

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

    // Filter out debates with N/A tickers
    filtered = filtered.filter(debate => debate.ticker !== "N/A");

    // Apply sentiment range filter
    filtered = filtered.filter(debate => {
      const rating = parseInt(debate.rating);
      return !isNaN(rating) && rating <= sentimentRange;
    });

    // Define priority order for pinned tickers
    const pinnedOrder = ["ETH", "SOL", "BNB", "BTC"];

    // Apply sorting
    filtered.sort((a, b) => {
      // Get index of tickers in pinnedOrder (-1 if not found)
      const aIndex = pinnedOrder.indexOf(a.ticker);
      const bIndex = pinnedOrder.indexOf(b.ticker);
      
      // If both are pinned, sort by pinnedOrder
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      
      // If only one is pinned, it goes first
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      // For non-pinned items, apply normal sorting
      if (sortBy === 'sentiment') {
        return parseInt(b.rating) - parseInt(a.rating);
      }
      // Add other sorting logic as needed
      return 0;
    });

    // Add console.log to debug
    console.log('Filtered debates:', filtered);

    return filtered;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="main-container">
            <div className="card-container">
              <img 
                src="/DebateFi logo PNG.png"
                alt="DebateFi Logo" 
                className="logo"
              />
              <img 
                src="/torus logo.png"
                alt="Torus Logo" 
                className="torus-logo"
              />
              <div className="title-container">
                <h1 className="title">Crypto Debates</h1>
                <p className="subtitle">Real-time Analysis of Crypto Twitter</p>
              </div>

              <div className="controls">
                <button 
                  className="generate-button"
                  onClick={async () => {
                    try {
                      setIsLoading(true);
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
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  Find More Tweets From This Hour!
                </button>
              </div>

              {isLoading && (
                <div className="loading-bar-container">
                  <div className="loading-bar"></div>
                </div>
              )}

              <div className="events-list">
                {getFilteredAndSortedDebates().length === 0 ? (
                  <div className="no-debates">No debates found</div>
                ) : (
                  Object.entries(
                    getFilteredAndSortedDebates().reduce((acc, debate) => {
                      if (!acc[debate.ticker]) {
                        acc[debate.ticker] = [];
                      }
                      acc[debate.ticker].push(debate);
                      return acc;
                    }, {} as Record<string, Debate[]>)
                  ).map(([ticker, groupedDebates]) => (
                    <DebateCard
                      key={ticker}
                      debate={groupedDebates[0]}
                      groupedDebates={groupedDebates}
                      isGrouped={true}
                    />
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