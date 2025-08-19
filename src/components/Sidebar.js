import React from 'react';
import './Sidebar.css';

const Sidebar = ({ publisherStats, journalistStats }) => {
  // 상위 5개만 표시
  const topPublishers = publisherStats.slice(0, 5);
  const topJournalists = journalistStats.slice(0, 5);

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-title">
          Click Bait 위험 언론사 
          <span className="total-count">({publisherStats.length}개 중 상위 5개)</span>
        </h3>
        <div className="stats-list">
          {topPublishers.map((publisher, index) => (
            <div key={publisher.name} className="stat-item">
              <div className="stat-rank">{index + 1}.</div>
              <div className="stat-info">
                <div className="stat-name">{publisher.name}</div>
                <div className="stat-value">{publisher.clickbaitRate}%</div>
              </div>
            </div>
          ))}
        </div>
        {publisherStats.length > 5 && (
          <div className="more-info">
            +{publisherStats.length - 5}개 더 있음
          </div>
        )}
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-title">
          Click Bait 위험 기자
          <span className="total-count">({journalistStats.length}개 중 상위 5개)</span>
        </h3>
        <div className="stats-list">
          {topJournalists.map((journalist, index) => (
            <div key={journalist.name} className="stat-item">
              <div className="stat-rank">{index + 1}.</div>
              <div className="stat-info">
                <div className="stat-name">{journalist.name}</div>
                <div className="stat-value">{journalist.clickbaitRate}%</div>
              </div>
            </div>
          ))}
        </div>
        {journalistStats.length > 5 && (
          <div className="more-info">
            +{journalistStats.length - 5}개 더 있음
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
