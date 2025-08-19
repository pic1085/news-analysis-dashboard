import React, { useState } from 'react';
import NewsChart from './NewsChart';
import './ChartDashboard.css';

const ChartDashboard = ({ newsData }) => {
  const [activeChart, setActiveChart] = useState('pie');

  const chartOptions = [
    { value: 'pie', label: '위험도 분포', icon: '🍰' },
    { value: 'bar', label: '언론사별 비교', icon: '📊' }
  ];

  return (
    <div className="chart-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">데이터 시각화</h2>
        <div className="chart-selector">
          {chartOptions.map(option => (
            <button
              key={option.value}
              className={`chart-button ${activeChart === option.value ? 'active' : ''}`}
              onClick={() => setActiveChart(option.value)}
            >
              <span className="chart-icon">{option.icon}</span>
              <span className="chart-label">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="chart-content">
        <NewsChart newsData={newsData} chartType={activeChart} />
      </div>
      
      <div className="chart-description">
        {activeChart === 'pie' && (
          <div className="description-content">
            <h4>위험도 분포</h4>
            <p>전체 뉴스를 위험도별로 분류하여 비율을 표시합니다. 고위험, 중위험, 저위험 뉴스의 분포를 한눈에 확인할 수 있습니다.</p>
          </div>
        )}
        {activeChart === 'bar' && (
          <div className="description-content">
            <h4>언론사별 비교</h4>
            <p>각 언론사의 평균 클릭베이트 비율과 허위정보 위험률을 비교합니다. 언론사별 신뢰도를 객관적으로 평가할 수 있습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartDashboard;
