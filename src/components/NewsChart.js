import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import './NewsChart.css';

const NewsChart = ({ newsData, chartType = 'pie' }) => {

  // 위험도별 분포 데이터 (겹치지 않는 명확한 구분)
  const riskDistribution = [
    {
      name: '저위험',
      value: newsData.filter(news => {
        const maxRisk = Math.max(news.clickbaitRate, 100 - news.accuracy);
        return maxRisk < 30;
      }).length,
      color: '#2ed573'
    },
    {
      name: '중위험',
      value: newsData.filter(news => {
        const maxRisk = Math.max(news.clickbaitRate, 100 - news.accuracy);
        return maxRisk >= 30 && maxRisk < 60;
      }).length,
      color: '#ffa502'
    },
    {
      name: '고위험',
      value: newsData.filter(news => {
        const maxRisk = Math.max(news.clickbaitRate, 100 - news.accuracy);
        return maxRisk >= 60;
      }).length,
      color: '#ff4757'
    }
  ];

  // 언론사별 데이터
  const publisherData = newsData.reduce((acc, news) => {
    const existing = acc.find(item => item.name === news.publisher);
    if (existing) {
      existing.clickbaitRate += news.clickbaitRate;
      existing.accuracy += news.accuracy;
      existing.count += 1;
    } else {
      acc.push({
        name: news.publisher,
        clickbaitRate: news.clickbaitRate,
        accuracy: news.accuracy,
        count: 1
      });
    }
    return acc;
  }, []).map(item => ({
    ...item,
    clickbaitRate: Math.round(item.clickbaitRate / item.count),
    accuracy: Math.round(item.accuracy / item.count)
  }));

  const renderChart = () => {
    switch (chartType) {

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={publisherData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="clickbaitRate" 
                fill="#ff4757" 
                name="클릭베이트 비율"
              />
              <Bar 
                dataKey="accuracy" 
                fill="#2ed573" 
                name="정확도"
              />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="news-chart">
      <div className="chart-container">
        {renderChart()}
      </div>
    </div>
  );
};

export default NewsChart;
