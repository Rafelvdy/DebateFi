import * as React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DebateCard from './components/DebateCard';
import './App.css';
import { Debate } from './types/Debate';

// Dynamically set API URL for Render deployment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://your-backend-service.onrender.com";

const App: React.FC = () => {
  const [debates, setDebates] = useState<Debate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDebates = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/debates`);
        const jsonData = await response.json();
        setDebates(Object.values(jsonData.data));
      } catch (error) {
        console.error('Error fetching debates:', error);
      }
    };

    fetchDebates();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="main-container">
            <button onClick={async () => {
              setIsLoading(true);
              try {
                await fetch(`${API_BASE_URL}/api/generate`, { method: 'POST' });
                const response = await fetch(`${API_BASE_URL}/api/debates`);
                const jsonData = await response.json();
                setDebates(Object.values(jsonData.data));
              } catch (error) {
                console.error("Error generating debates:", error);
              } finally {
                setIsLoading(false);
              }
            }}>
              Generate Debates
            </button>

            {isLoading && <p>Loading...</p>}

            {debates.map(debate => (
              <DebateCard key={debate.id} debate={debate} />
            ))}
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default App;
