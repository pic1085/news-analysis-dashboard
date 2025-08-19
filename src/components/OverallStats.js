import React from 'react';
import './OverallStats.css';

const OverallStats = ({ overallStats }) => {
  console.log(`📊 OverallStats 렌더링:`, overallStats);
  
  const {
    totalNews,
    averageClickbaitRate,
    averageAccuracy,
    highRiskNews,
    mediumRiskNews,
    lowRiskNews
  } = overallStats;

  const getProgressWidth = (value, max) => {
    return (value / max) * 100;
  };

  const formatPercentage = (value) => {
    return Math.round(value);
  };

  return (
    <div className="overall-stats">
      <h2 className="overall-stats-title">전체 뉴스 통계</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📰</div>
          <div className="stat-content">
            <div className="stat-number">{totalNews}</div>
            <div className="stat-label">총 뉴스 수</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-number">{formatPercentage(averageClickbaitRate)}%</div>
            <div className="stat-label">평균 클릭베이트 비율</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-number">{formatPercentage(averageAccuracy)}%</div>
            <div className="stat-label">평균 정확도</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{highRiskNews + mediumRiskNews + lowRiskNews}</div>
            <div className="stat-label">분석 완료</div>
          </div>
        </div>
      </div>

      <div className="risk-distribution">
        <h3 className="distribution-title">위험도별 뉴스 분포</h3>
        <div className="distribution-chart">
          <div className="risk-category high-risk">
            <div className="risk-label">
              <span className="risk-color high"></span>
              고위험 ({highRiskNews}개)
            </div>
            <div className="risk-bar">
              <div 
                className="risk-progress high" 
                style={{ width: `${getProgressWidth(highRiskNews, totalNews)}%` }}
              ></div>
            </div>
            <div className="risk-percentage">
              {formatPercentage((highRiskNews / totalNews) * 100)}%
            </div>
          </div>

          <div className="risk-category medium-risk">
            <div className="risk-label">
              <span className="risk-color medium"></span>
              중위험 ({mediumRiskNews}개)
            </div>
            <div className="risk-bar">
              <div 
                className="risk-progress medium" 
                style={{ width: `${getProgressWidth(mediumRiskNews, totalNews)}%` }}
              ></div>
            </div>
            <div className="risk-percentage">
              {formatPercentage((mediumRiskNews / totalNews) * 100)}%
            </div>
          </div>

          <div className="risk-category low-risk">
            <div className="risk-label">
              <span className="risk-color low"></span>
              저위험 ({lowRiskNews}개)
            </div>
            <div className="risk-bar">
              <div 
                className="risk-progress low" 
                style={{ width: `${getProgressWidth(lowRiskNews, totalNews)}%` }}
              ></div>
            </div>
            <div className="risk-percentage">
              {formatPercentage((lowRiskNews / totalNews) * 100)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverallStats;
