import React from 'react';
import './DebateCard.css';
import { Debate } from '../types/Debate';

interface DebateCardProps {
  debate: Debate;
}

const DebateCard: React.FC<DebateCardProps> = ({ debate }) => {
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

  return (
    <div className="debate-card">
      <div className="debate-header">
        <div className="ticker-container">
          <h3 className="ticker">{debate.ticker}</h3>
          <span className="sentiment-score">
            Sentiment: {debate.rating}
          </span>
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
            <i className="fas fa-heart"></i> {formatNumber(debate.likes || 0)}
          </span>
          <span className="metric">
            <i className="fas fa-retweet"></i> {formatNumber(debate.retweets || 0)}
          </span>
          <span className="metric">
            <i className="fas fa-comment"></i> {formatNumber(debate.replies || 0)}
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