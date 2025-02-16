import React, { useState } from 'react';
import './DebateCard.css';
import { Debate } from '../types/Debate';

interface DebateCardProps {
  debate: Debate;
  groupedDebates?: Debate[];
  isGrouped?: boolean;
}

const DebateCard: React.FC<DebateCardProps> = ({ debate, groupedDebates, isGrouped }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return '0';
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (isGrouped && groupedDebates && groupedDebates.length > 1) {
    return (
      <div className={`debate-card-group ${isExpanded ? 'expanded' : ''}`} onClick={() => setIsExpanded(!isExpanded)}>
        <div className="stacked-cards">
          {!isExpanded && groupedDebates.slice(1, 3).reverse().map((_, index) => (
            <div key={index} className="stacked-card" style={{ transform: `translateY(${(index + 1) * 10}px)` }} />
          ))}
        </div>
        {isExpanded ? (
          groupedDebates.map((groupDebate) => (
            <div key={groupDebate.id} className="debate-card">
              <div className="debate-header">
                <div className="ticker-container">
                  <h3 className="ticker">{groupDebate.ticker}</h3>
                  <div className="sentiment-container">
                    <span className="sentiment-score">
                      Sentiment: {groupDebate.rating}
                    </span>
                    {parseInt(groupDebate.rating) > 50 ? (
                      <i className="fas fa-arrow-up" style={{ color: '#00ff88', marginLeft: '8px' }}></i>
                    ) : (
                      <i className="fas fa-arrow-down" style={{ color: '#ff4444', marginLeft: '8px' }}></i>
                    )}
                  </div>
                </div>
                <div className="timestamp">
                  {formatDate(groupDebate.time)}
                </div>
              </div>

              <div className="debate-content">
                <div className="summary-section">
                  <h4>Summary</h4>
                  <p>{groupDebate.summary}</p>
                </div>
                
                <div className="reason-section">
                  <h4>Context & Importance</h4>
                  <p>{groupDebate.reason}</p>
                </div>

                <div className="analysis-section">
                  <h4>Analysis</h4>
                  <p>{groupDebate.analysis}</p>
                </div>
              </div>

              <div className="debate-footer">
                <div className="engagement-metrics">
                  <span className="metric">
                    <i className="fa-regular fa-heart"></i> {formatNumber(groupDebate.likes || 0)}
                  </span>
                  <span className="metric">
                    <i className="fa-solid fa-retweet"></i> {formatNumber(groupDebate.retweets || 0)}
                  </span>
                  <span className="metric">
                    <i className="fa-regular fa-comment"></i> {formatNumber(groupDebate.replies || 0)}
                  </span>
                </div>
                <a 
                  href={groupDebate.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="view-tweet-btn"
                  onClick={(e) => {
                    if (!groupDebate.url || groupDebate.url === '#') {
                      e.preventDefault();
                    }
                  }}
                >
                  View on Twitter
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="debate-card main-card">
            <div className="debate-header">
              <div className="ticker-container">
                <h3 className="ticker">
                  {debate.ticker}
                  {groupedDebates && groupedDebates.length > 1 && (
                    <span className="ticker-count">+{groupedDebates.length - 1}</span>
                  )}
                </h3>
                <div className="sentiment-container">
                  <span className="sentiment-score">
                    {groupedDebates && groupedDebates.length > 1 ? 'Avg. ' : ''}
                    Sentiment: {groupedDebates && groupedDebates.length > 1 
                      ? Math.round(groupedDebates.reduce((acc, debate) => acc + parseInt(debate.rating), 0) / groupedDebates.length)
                      : debate.rating}
                  </span>
                  {groupedDebates && groupedDebates.length > 1 
                    ? (Math.round(groupedDebates.reduce((acc, debate) => acc + parseInt(debate.rating), 0) / groupedDebates.length) > 50 ? (
                        <i className="fas fa-arrow-up" style={{ color: '#00ff88', marginLeft: '8px' }}></i>
                      ) : (
                        <i className="fas fa-arrow-down" style={{ color: '#ff4444', marginLeft: '8px' }}></i>
                      ))
                    : (parseInt(debate.rating) > 50 ? (
                        <i className="fas fa-arrow-up" style={{ color: '#00ff88', marginLeft: '8px' }}></i>
                      ) : (
                        <i className="fas fa-arrow-down" style={{ color: '#ff4444', marginLeft: '8px' }}></i>
                      ))
                  }
                </div>
              </div>
              <div className="timestamp">
                {formatDate(debate.time)}
              </div>
            </div>

            <div className="debate-content">
              <div className="summary-section">
                <h4>Summary</h4>
                <p>{debate.summary}</p>
              </div>
              
              <div className="reason-section">
                <h4>Context & Importance</h4>
                <p>{debate.reason}</p>
              </div>

              <div className="analysis-section">
                <h4>Analysis</h4>
                <p>{debate.analysis}</p>
              </div>
            </div>

            <div className="debate-footer">
              <div className="engagement-metrics">
                <span className="metric">
                  <i className="fa-regular fa-heart"></i> {formatNumber(debate.likes || 0)}
                </span>
                <span className="metric">
                  <i className="fa-solid fa-retweet"></i> {formatNumber(debate.retweets || 0)}
                </span>
                <span className="metric">
                  <i className="fa-regular fa-comment"></i> {formatNumber(debate.replies || 0)}
                </span>
              </div>
              <a 
                href={debate.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="view-tweet-btn"
                onClick={(e) => {
                  if (!debate.url || debate.url === '#') {
                    e.preventDefault();
                  }
                }}
              >
                View on Twitter
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="debate-card">
      <div className="debate-header">
        <div className="ticker-container">
          <h3 className="ticker">{debate.ticker}</h3>
          <div className="sentiment-container">
            <span className="sentiment-score">
              Sentiment: {debate.rating}
            </span>
            {parseInt(debate.rating) > 50 ? (
              <i className="fas fa-arrow-up" style={{ color: '#00ff88', marginLeft: '8px' }}></i>
            ) : (
              <i className="fas fa-arrow-down" style={{ color: '#ff4444', marginLeft: '8px' }}></i>
            )}
          </div>
        </div>
        <div className="timestamp">
          {formatDate(debate.time)}
        </div>
      </div>

      <div className="debate-content">
        <div className="summary-section">
          <h4>Summary</h4>
          <p>{debate.summary}</p>
        </div>
        
        <div className="reason-section">
          <h4>Context & Importance</h4>
          <p>{debate.reason}</p>
        </div>

        <div className="analysis-section">
          <h4>Analysis</h4>
          <p>{debate.analysis}</p>
        </div>
      </div>

      <div className="debate-footer">
        <div className="engagement-metrics">
          <span className="metric">
            <i className="fa-regular fa-heart"></i> {formatNumber(debate.likes || 0)}
          </span>
          <span className="metric">
            <i className="fa-solid fa-retweet"></i> {formatNumber(debate.retweets || 0)}
          </span>
          <span className="metric">
            <i className="fa-regular fa-comment"></i> {formatNumber(debate.replies || 0)}
          </span>
        </div>
        <a 
          href={debate.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="view-tweet-btn"
          onClick={(e) => {
            if (!debate.url || debate.url === '#') {
              e.preventDefault();
            }
          }}
        >
          View on Twitter
        </a>
      </div>
    </div>
  );
};

export default DebateCard; 