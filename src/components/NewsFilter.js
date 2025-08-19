import React, { useState } from 'react';
import './NewsFilter.css';

const NewsFilter = ({ onFilterChange, publishers, authors }) => {
  const [filters, setFilters] = useState({
    searchTerm: '',
    publisher: 'all',
    author: 'all',
    riskLevel: 'all',
    dateRange: 'all',
    sortBy: 'publishedAt',
    sortOrder: 'desc'
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      searchTerm: '',
      publisher: 'all',
      author: 'all',
      riskLevel: 'all',
      dateRange: 'all',
      sortBy: 'publishedAt',
      sortOrder: 'desc'
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="news-filter">
      <div className="filter-header">
        <h3 className="filter-title">뉴스 필터 및 검색</h3>
        <button className="reset-button" onClick={resetFilters}>
          초기화
        </button>
      </div>

      <div className="filter-grid">
        {/* 검색어 입력 */}
        <div className="filter-group">
          <label className="filter-label">검색어</label>
          <input
            type="text"
            className="filter-input"
            placeholder="제목이나 내용으로 검색..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          />
        </div>

        {/* 언론사 필터 */}
        <div className="filter-group">
          <label className="filter-label">언론사</label>
          <select
            className="filter-select"
            value={filters.publisher}
            onChange={(e) => handleFilterChange('publisher', e.target.value)}
          >
            <option value="all">전체</option>
            {publishers.map(publisher => (
              <option key={publisher} value={publisher}>{publisher}</option>
            ))}
          </select>
        </div>

        {/* 기자 필터 */}
        <div className="filter-group">
          <label className="filter-label">기자</label>
          <select
            className="filter-select"
            value={filters.author}
            onChange={(e) => handleFilterChange('author', e.target.value)}
          >
            <option value="all">전체</option>
            {authors.map(author => (
              <option key={author} value={author}>{author}</option>
            ))}
          </select>
        </div>

        {/* 위험도 필터 */}
        <div className="filter-group">
          <label className="filter-label">위험도</label>
          <select
            className="filter-select"
            value={filters.riskLevel}
            onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
          >
            <option value="all">전체</option>
            <option value="low">저위험 (30% 미만)</option>
            <option value="medium">중위험 (30-60%)</option>
            <option value="high">고위험 (60% 이상)</option>
          </select>
        </div>

        {/* 날짜 범위 */}
        <div className="filter-group">
          <label className="filter-label">기간</label>
          <select
            className="filter-select"
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
          >
            <option value="all">전체</option>
            <option value="today">오늘</option>
            <option value="week">최근 1주일</option>
            <option value="month">최근 1개월</option>
          </select>
        </div>

        {/* 정렬 기준 */}
        <div className="filter-group">
          <label className="filter-label">정렬</label>
          <select
            className="filter-select"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="publishedAt">발행일</option>
            <option value="clickbaitRate">클릭베이트 비율</option>
            <option value="accuracy">정확도</option>
            <option value="title">제목</option>
          </select>
        </div>

        {/* 정렬 순서 */}
        <div className="filter-group">
          <label className="filter-label">순서</label>
          <select
            className="filter-select"
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
          >
            <option value="desc">내림차순</option>
            <option value="asc">오름차순</option>
          </select>
        </div>
      </div>

      {/* 활성 필터 표시 */}
      <div className="active-filters">
        {filters.searchTerm && (
          <div className="filter-tag">
            검색: "{filters.searchTerm}"
            <button onClick={() => handleFilterChange('searchTerm', '')}>×</button>
          </div>
        )}
        {filters.publisher !== 'all' && (
          <div className="filter-tag">
            언론사: {filters.publisher}
            <button onClick={() => handleFilterChange('publisher', 'all')}>×</button>
          </div>
        )}
        {filters.author !== 'all' && (
          <div className="filter-tag">
            기자: {filters.author}
            <button onClick={() => handleFilterChange('author', 'all')}>×</button>
          </div>
        )}
        {filters.riskLevel !== 'all' && (
          <div className="filter-tag">
            위험도: {
              filters.riskLevel === 'low' ? '저위험' :
              filters.riskLevel === 'medium' ? '중위험' : '고위험'
            }
            <button onClick={() => handleFilterChange('riskLevel', 'all')}>×</button>
          </div>
        )}
        {filters.dateRange !== 'all' && (
          <div className="filter-tag">
            기간: {
              filters.dateRange === 'today' ? '오늘' :
              filters.dateRange === 'week' ? '최근 1주일' : '최근 1개월'
            }
            <button onClick={() => handleFilterChange('dateRange', 'all')}>×</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsFilter;
