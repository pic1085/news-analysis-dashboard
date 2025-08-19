import React, { useState, useEffect, useCallback } from 'react';
import NewsCard from './components/NewsCard';
import Sidebar from './components/Sidebar';
import OverallStats from './components/OverallStats';
import NewsFilter from './components/NewsFilter';
import ChartDashboard from './components/ChartDashboard';
import TrendingTopics from './components/TrendingTopics';
import { crawlAllNews } from './services/newsCrawler';
import './App.css';

// 기존 샘플 데이터 제거 - 실제 크롤링 데이터만 사용

function App() {
  const [newsData, setNewsData] = useState([]);
  const [filteredNewsData, setFilteredNewsData] = useState([]);
  const [publisherStats, setPublisherStats] = useState([]);
  const [journalistStats, setJournalistStats] = useState([]);
  const [overallStats, setOverallStats] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 10;

  // 실제 뉴스 데이터 가져오기
  const fetchNewsData = useCallback(async () => {
    setLoading(true);
    try {
      console.log(`🔄 fetchNewsData 시작 ====================`);
      
      const crawledNews = await crawlAllNews();
      
      console.log(`📥 크롤링된 뉴스 데이터:`, crawledNews.length, '개');
      console.log(`📥 첫 번째 뉴스 샘플:`, crawledNews[0] ? {
        title: crawledNews[0].title,
        clickbaitRate: crawledNews[0].clickbaitRate,
        accuracy: crawledNews[0].accuracy
      } : '뉴스 없음');
      
      if (crawledNews.length > 0) {
        console.log(`📥 뉴스 데이터 설정 시작 ====================`);
        
        setNewsData(crawledNews);
        setFilteredNewsData(crawledNews);
        setLastUpdated(new Date());
        
        console.log(`📥 뉴스 데이터 설정 완료`);
        console.log(`📥 newsData 길이:`, crawledNews.length);
        console.log(`📥 filteredNewsData 길이:`, crawledNews.length);
        
        console.log(`📊 통계 계산 시작 ====================`);
        calculateOverallStats(crawledNews);
        calculatePublisherStats(crawledNews);
        calculateJournalistStats(crawledNews);
        console.log(`📊 통계 계산 완료 ====================`);
      } else {
        // 크롤링 데이터가 없으면 빈 배열로 초기화
        console.log('크롤링 데이터가 없습니다.');
        setNewsData([]);
        setFilteredNewsData([]);
        setPublisherStats([]);
        setJournalistStats([]);
        setOverallStats({ totalNews: 0, avgClickbaitRate: 0, avgMisinformationRisk: 0 });
      }
    } catch (error) {
      console.error('뉴스 데이터 가져오기 실패:', error);
      // 오류 시 빈 배열로 초기화
      setNewsData([]);
      setFilteredNewsData([]);
      setPublisherStats([]);
      setJournalistStats([]);
      setOverallStats({ totalNews: 0, avgClickbaitRate: 0, avgMisinformationRisk: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNewsData();
    
    // 1시간마다 데이터 업데이트
    const interval = setInterval(fetchNewsData, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchNewsData]);

  const calculateOverallStats = (data) => {
    if (data.length === 0) return;
    
    const totalNews = data.length;
    const averageClickbaitRate = data.reduce((sum, news) => sum + news.clickbaitRate, 0) / totalNews;
    const averageAccuracy = data.reduce((sum, news) => sum + news.accuracy, 0) / totalNews;
    
    const highRiskNews = data.filter(news => {
      const maxRisk = Math.max(news.clickbaitRate, 100 - news.accuracy);
      return maxRisk >= 60;
    }).length;
    const mediumRiskNews = data.filter(news => {
      const maxRisk = Math.max(news.clickbaitRate, 100 - news.accuracy);
      return maxRisk >= 30 && maxRisk < 60;
    }).length;
    const lowRiskNews = data.filter(news => {
      const maxRisk = Math.max(news.clickbaitRate, 100 - news.accuracy);
      return maxRisk < 30;
    }).length;

    setOverallStats({
      totalNews,
      averageClickbaitRate,
      averageAccuracy,
      highRiskNews,
      mediumRiskNews,
      lowRiskNews
    });
  };

  // 언론사별 통계 계산
  const calculatePublisherStats = (data) => {
    const publisherMap = {};
    
    data.forEach(news => {
      if (!publisherMap[news.publisher]) {
        publisherMap[news.publisher] = {
          name: news.publisher,
          totalClickbait: 0,
          totalAccuracy: 0,
          count: 0
        };
      }
      
      publisherMap[news.publisher].totalClickbait += news.clickbaitRate;
      publisherMap[news.publisher].totalAccuracy += news.accuracy;
      publisherMap[news.publisher].count += 1;
    });

    const stats = Object.values(publisherMap).map(pub => ({
      name: pub.name,
      clickbaitRate: Math.round(pub.totalClickbait / pub.count),
      accuracy: Math.round(pub.totalAccuracy / pub.count)
    })).sort((a, b) => b.clickbaitRate - a.clickbaitRate);

    setPublisherStats(stats);
  };

  // 기자별 통계 계산
  const calculateJournalistStats = (data) => {
    const journalistMap = {};
    
    data.forEach(news => {
      if (!journalistMap[news.author]) {
        journalistMap[news.author] = {
          name: news.author,
          totalClickbait: 0,
          totalAccuracy: 0,
          count: 0
        };
      }
      
      journalistMap[news.author].totalClickbait += news.clickbaitRate;
      journalistMap[news.author].totalAccuracy += news.accuracy;
      journalistMap[news.author].count += 1;
    });

    const stats = Object.values(journalistMap).map(journalist => ({
      name: journalist.name,
      clickbaitRate: Math.round(journalist.totalClickbait / journalist.count),
      accuracy: Math.round(journalist.totalAccuracy / journalist.count)
    })).sort((a, b) => b.clickbaitRate - a.clickbaitRate);

    setJournalistStats(stats);
  };

  const handleFilterChange = (filters) => {
    let filtered = [...newsData];

    // 검색어 필터
    if (filters.searchTerm) {
      filtered = filtered.filter(news => 
        news.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        news.content.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // 언론사 필터
    if (filters.publisher !== 'all') {
      filtered = filtered.filter(news => news.publisher === filters.publisher);
    }

    // 기자 필터
    if (filters.author !== 'all') {
      filtered = filtered.filter(news => news.author === filters.author);
    }

    // 위험도 필터
    if (filters.riskLevel !== 'all') {
      filtered = filtered.filter(news => {
        const maxRisk = Math.max(news.clickbaitRate, 100 - news.accuracy);
        if (filters.riskLevel === 'low') return maxRisk < 30;
        if (filters.riskLevel === 'medium') return maxRisk >= 30 && maxRisk < 60;
        if (filters.riskLevel === 'high') return maxRisk >= 60;
        return true;
      });
    }

    // 날짜 범위 필터
    if (filters.dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(news => {
        const newsDate = new Date(news.publishedAt);
        if (filters.dateRange === 'today') {
          return newsDate.toDateString() === now.toDateString();
        }
        if (filters.dateRange === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return newsDate >= weekAgo;
        }
        if (filters.dateRange === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return newsDate >= monthAgo;
        }
        return true;
      });
    }

    // 정렬
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'clickbaitRate':
          aValue = a.clickbaitRate;
          bValue = b.clickbaitRate;
          break;
        case 'accuracy':
          aValue = a.accuracy;
          bValue = b.accuracy;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default: // publishedAt
          aValue = new Date(a.publishedAt);
          bValue = new Date(b.publishedAt);
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredNewsData(filtered);
    setCurrentPage(1); // 필터링 시 페이지 1로 리셋
    calculateOverallStats(filtered);
  };

  // 고유한 언론사와 기자 목록 추출
  const uniquePublishers = [...new Set(newsData.map(news => news.publisher))];
  const uniqueAuthors = [...new Set(newsData.map(news => news.author))];

  // 페이지네이션 로직
  const indexOfLastNews = currentPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const currentNews = filteredNewsData.slice(indexOfFirstNews, indexOfLastNews);
  const totalPages = Math.ceil(filteredNewsData.length / newsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };



  const tabs = [
    { id: 'dashboard', label: '대시보드', icon: '📊' },
    { id: 'analysis', label: '상세 분석', icon: '📈' },
    { id: 'trends', label: '트렌드', icon: '🔥' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
  return (
          <>
            <OverallStats overallStats={overallStats} />
            <NewsFilter 
              onFilterChange={handleFilterChange}
              publishers={uniquePublishers}
              authors={uniqueAuthors}
            />
        <div className="content-wrapper">
          <div className="news-section">
                <h2 className="section-title">필터링된 뉴스 ({filteredNewsData.length}개) - 페이지 {currentPage}/{totalPages}</h2>
            <div className="news-grid">
                  {currentNews.map(news => (
                <NewsCard key={news.id} news={news} />
              ))}
            </div>
            
            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="page-button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ◀ 이전
                </button>
                
                <div className="page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                    <button
                      key={pageNumber}
                      className={`page-number ${currentPage === pageNumber ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>
                
                <button 
                  className="page-button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  다음 ▶
                </button>
              </div>
            )}
          </div>
          <div className="sidebar-section">
            <Sidebar 
              publisherStats={publisherStats}
              journalistStats={journalistStats}
            />
          </div>
        </div>
          </>
        );
      case 'analysis':
        return (
          <>
            <ChartDashboard newsData={filteredNewsData} />
        <OverallStats overallStats={overallStats} />
          </>
        );
      case 'trends':
        return (
          <TrendingTopics newsData={filteredNewsData} />
        );

      default:
        return null;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <div className="header-info">
            <h1>뉴스 신뢰도 분석 대시보드</h1>
            <p>클릭베이트와 허위정보를 실시간으로 분석합니다</p>
          </div>
          <div className="header-controls">
            <button 
              className="refresh-button" 
              onClick={fetchNewsData}
              disabled={loading}
            >
              {loading ? '🔄 업데이트 중...' : '🔄 새로고침'}
            </button>
            {lastUpdated && (
              <div className="last-updated">
                마지막 업데이트: {lastUpdated.toLocaleTimeString('ko-KR')}
              </div>
            )}
          </div>
        </div>

        <nav className="tab-navigation">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="app-main">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>뉴스 데이터를 가져오는 중...</p>
          </div>
        ) : (
          renderTabContent()
        )}
      </main>
    </div>
  );
}

export default App;