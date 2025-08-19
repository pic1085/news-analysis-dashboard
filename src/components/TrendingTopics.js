import React from 'react';
import './TrendingTopics.css';

const TrendingTopics = ({ newsData }) => {
  // 키워드 추출 및 빈도 계산
  const extractKeywords = (text) => {
    // 간단한 키워드 추출 (실제로는 더 정교한 NLP 처리 필요)
    const keywords = text
      .toLowerCase()
      .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, '')
      .split(/\s+/)
      .filter(word => 
        word.length > 1 && 
        !['이', '그', '저', '것', '수', '있', '없', '하다', '되다', '이다', '아니다', '때문', '통해', '위해', '대한', '관련', '발표', '진행', '계획', '예정', '소식', '발생'].includes(word)
      );
    return keywords;
  };

  // 모든 뉴스에서 키워드 추출 및 빈도 계산
  const keywordFrequency = newsData.reduce((acc, news) => {
    const titleKeywords = extractKeywords(news.title);
    const contentKeywords = extractKeywords(news.content);
    const allKeywords = [...titleKeywords, ...contentKeywords];
    
    allKeywords.forEach(keyword => {
      if (!acc[keyword]) {
        acc[keyword] = {
          word: keyword,
          count: 0,
          totalClickbait: 0,
          totalAccuracy: 0,
          articles: []
        };
      }
      acc[keyword].count += 1;
      acc[keyword].totalClickbait += news.clickbaitRate;
      acc[keyword].totalAccuracy += news.accuracy;
      acc[keyword].articles.push({
        title: news.title,
        publisher: news.publisher,
        id: news.id
      });
    });
    
    return acc;
  }, {});

  // 상위 트렌딩 키워드 추출 (빈도 기준)
  const trendingKeywords = Object.values(keywordFrequency)
    .filter(item => item.count >= 2) // 최소 2번 이상 언급
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(item => ({
      ...item,
      avgClickbait: Math.round(item.totalClickbait / item.count),
      avgAccuracy: Math.round(item.totalAccuracy / item.count)
    }));



  // 언론사별 주요 토픽
  const publisherTopics = newsData.reduce((acc, news) => {
    if (!acc[news.publisher]) {
      acc[news.publisher] = [];
    }
    const keywords = extractKeywords(news.title);
    acc[news.publisher].push(...keywords);
    return acc;
  }, {});

  const publisherTrends = Object.entries(publisherTopics).map(([publisher, keywords]) => {
    const frequency = keywords.reduce((acc, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1;
      return acc;
    }, {});
    
    const topKeywords = Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([keyword]) => keyword);
    
    return {
      publisher,
      topKeywords
    };
  });

  const getRiskColor = (clickbait, misinformation) => {
    const avgRisk = (clickbait + misinformation) / 2;
    if (avgRisk >= 60) return '#ff4757';
    if (avgRisk >= 40) return '#ffa502';
    return '#2ed573';
  };

  return (
    <div className="trending-topics">
      <h2 className="trending-title">트렌딩 토픽 분석</h2>
      
      <div className="trending-grid">
        {/* 인기 키워드 */}
        <div className="trending-section">
          <h3 className="section-title">
            <span className="section-icon">🔥</span>
            인기 키워드
          </h3>
          <div className="keyword-list">
            {trendingKeywords.map((keyword, index) => (
              <div key={keyword.word} className="keyword-item">
                <div className="keyword-rank">{index + 1}</div>
                <div className="keyword-info">
                  <div className="keyword-text">{keyword.word}</div>
                  <div className="keyword-stats">
                    <span className="keyword-count">{keyword.count}회 언급</span>
                    <div className="keyword-risks">
                      <span className="risk-badge clickbait" style={{ backgroundColor: getRiskColor(keyword.avgClickbait, 0) }}>
                        CB: {keyword.avgClickbait}%
                      </span>
                      <span className="risk-badge accuracy" style={{ backgroundColor: getRiskColor(0, keyword.avgAccuracy) }}>
                        정확도: {keyword.avgAccuracy}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>



        {/* 언론사별 주요 토픽 */}
        <div className="trending-section">
          <h3 className="section-title">
            <span className="section-icon">📰</span>
            언론사별 주요 토픽
          </h3>
          <div className="publisher-topics">
            {publisherTrends.map(({ publisher, topKeywords }) => (
              <div key={publisher} className="publisher-topic-item">
                <div className="publisher-name">{publisher}</div>
                <div className="topic-tags">
                  {topKeywords.map(keyword => (
                    <span key={keyword} className="topic-tag">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingTopics;
