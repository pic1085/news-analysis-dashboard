import React from 'react';
import './NewsCard.css';

const NewsCard = ({ news }) => {
  console.log(`🎴 NewsCard 렌더링:`, {
    title: news.title?.substring(0, 30) + '...',
    clickbaitRate: news.clickbaitRate,
    accuracy: news.accuracy,
    hasTitle: !!news.title,
    hasClickbaitRate: typeof news.clickbaitRate === 'number',
    hasAccuracy: typeof news.accuracy === 'number'
  });
  
  const {
    title,
    content,
    publisher,
    author,
    clickbaitRate,
    accuracy,
    publishedAt,
    url
  } = news;

  const handleCardClick = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getClickbaitColor = (rate) => {
    if (rate >= 70) return '#ff4757';
    if (rate >= 50) return '#ffa502';
    return '#2ed573';
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return '#2ed573';
    if (accuracy >= 60) return '#ffa502';
    return '#ff4757';
  };

  return (
    <div 
      className={`news-card ${url ? 'clickable' : ''}`}
      onClick={handleCardClick}
      role={url ? 'button' : 'article'}
      tabIndex={url ? 0 : undefined}
      onKeyDown={(e) => {
        if (url && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className="news-card-header">
        <h3 className="news-title">{title}</h3>
        <div className="news-meta">
          <span className="publisher">{publisher}</span>
          <span className="author">by {author}</span>
          <span className="date">{new Date(publishedAt).toLocaleDateString('ko-KR')}</span>
        </div>
      </div>
      
      <div className="news-content">
        <p>{content}</p>
      </div>
      
      <div className="news-metrics">
        <div className="metric">
          <div className="metric-label">Click Bait 비율</div>
          <div className="metric-circle" style={{ backgroundColor: getClickbaitColor(clickbaitRate) }}>
            <span className="metric-value">{clickbaitRate}%</span>
          </div>
        </div>
        
        <div className="metric">
          <div className="metric-label">정확도</div>
          <div className="metric-circle" style={{ backgroundColor: getAccuracyColor(accuracy) }}>
            <span className="metric-value">{accuracy}%</span>
          </div>
        </div>
      </div>
      
      {url && (
        <div className="news-link-indicator">
          <span className="link-icon">🔗</span>
          <span className="link-text">클릭하여 원문 보기</span>
        </div>
      )}
    </div>
  );
};

export default NewsCard;
