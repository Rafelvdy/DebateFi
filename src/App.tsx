import * as React from "react";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DebateCard from "./components/DebateCard";
import "./App.css";
import { Debate } from "./types/Debate";

// Dynamically set API URL for deployment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://debatefi-19.onrender.com";

const App: React.FC = () => {
  const [debates, setDebates] = useState<Debate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDebates = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/debates`);
        const jsonData = await response.json();
        const debateArray = Object.values(jsonData.data).map((item: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          ...item.data,
        }));
        setDebates(debateArray);
      } catch (error) {
        console.error("Error fetching debates:", error);
      }
    };

    fetchDebates();
  }, []);

  const getFilteredAndSortedDebates = () => {
    if (!debates) return [];

    let filtered = [...debates];

    // Filter out debates with N/A tickers
    filtered = filtered.filter((debate) => debate.ticker !== "N/A");

    // Define priority order for pinned tickers
    const pinnedOrder = ["ETH", "SOL", "BNB", "BTC"];

    // Apply sorting
    filtered.sort((a, b) => {
      const aIndex = pinnedOrder.indexOf(a.ticker);
      const bIndex = pinnedOrder.indexOf(b.ticker);

      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;

      return 0;
    });

    return filtered;
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="main-container">
              <div className="card-container">
                {/* Logos */}
                <img src="/DebateFi logo PNG.png" alt="DebateFi Logo" className="logo" />
                <img src="/torus logo.png" alt="Torus Logo" className="torus-logo" />

                {/* Title and Subtitle */}
                <div className="title-container">
                  <h1 className="title">Crypto Debates</h1>
                  <p className="subtitle">Real-time Analysis of Crypto Twitter</p>
                </div>

                {/* Generate Debates Button */}
                <div className="controls">
                  <button
                    className="generate-button"
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        await fetch(`${API_BASE_URL}/api/generate`, {
                          method: "POST",
                        });
                        const response = await fetch(`${API_BASE_URL}/api/debates`);
                        const jsonData = await response.json();
                        const debateArray = Object.values(jsonData.data).map((item: any) => ({
                          id: Math.random().toString(36).substr(2, 9),
                          ...item.data,
                        }));
                        setDebates(debateArray);
                      } catch (error) {
                        console.error("Error generating debates:", error);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    Find More Tweets From This Hour!
                  </button>
                </div>

                {/* Loading Bar */}
                {isLoading && (
                  <div className="loading-bar-container">
                    <div className="loading-bar"></div>
                  </div>
                )}

                {/* Events List */}
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
                      <DebateCard key={ticker} debate={groupedDebates[0]} groupedDebates={groupedDebates} isGrouped={true} />
                    ))
                  )}
                </div>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
