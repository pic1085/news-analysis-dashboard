import axios from 'axios';

// AI 분석 서버 URL
const AI_ANALYSIS_URL = 'http://210.119.33.7:4610/predict';

// AI 서버로 뉴스 분석 요청
const analyzeNewsWithAI = async (title, content) => {
  try {
    console.log(`📤 AI 분석 요청 시작 ====================`);
    console.log(`📤 제목: "${title}"`);
    console.log(`📤 본문: "${content.substring(0, 100)}..."`);
    console.log(`📤 요청 URL: ${AI_ANALYSIS_URL}`);
    
    const requestData = {
      title: title,
      body: content // AI 서버는 'body' 필드를 사용
    };
    
    console.log(`📤 전송할 데이터:`, JSON.stringify(requestData, null, 2));
    
    const response = await axios.post(AI_ANALYSIS_URL, requestData, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📥 AI 서버 응답 상태: ${response.status}`);
    console.log(`📥 AI 서버 응답 헤더:`, response.headers);
    
    const data = response.data;
    console.log(`📥 AI 서버 응답 데이터:`, JSON.stringify(data, null, 2));
    
    // 응답 데이터 유효성 검사
    if (!data || !data.probabilities || !data.score) {
      console.error(`❌ AI 서버 응답 데이터 형식 오류:`, data);
      throw new Error('AI 서버 응답 데이터 형식이 올바르지 않습니다.');
    }
    
    // AI 서버 응답을 우리 형식으로 변환
    const clickbaitProbability = data.probabilities[0]; // 첫 번째 값이 클릭베이트 확률
    const clickbaitRate = Math.round(clickbaitProbability * 100);
    const accuracy = Math.round(data.score * 100); // score를 정확도로 사용
    
    console.log(`🤖 변환된 결과:`);
    console.log(`🤖 - 원본 clickbaitProbability: ${clickbaitProbability}`);
    console.log(`🤖 - 변환된 clickbaitRate: ${clickbaitRate}%`);
    console.log(`🤖 - 원본 score: ${data.score}`);
    console.log(`🤖 - 변환된 accuracy: ${accuracy}%`);
    console.log(`🤖 - label_name: ${data.label_name}`);
    
    const result = {
      clickbaitRate: clickbaitRate,
      accuracy: accuracy
    };
    
    console.log(`🤖 최종 반환값:`, result);
    console.log(`📤 AI 분석 요청 완료 ====================`);
    
    return result;
  } catch (error) {
    console.error('AI 분석 요청 실패:', error.message);
    // AI 분석 실패 시 기본값 반환
    return {
      clickbaitRate: 0,
      accuracy: 0
    };
  }
};

// CORS 프록시 URL들
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://thingproxy.freeboard.io/fetch/',
  'https://cors.bridged.cc/'
];

// AI 분석을 통한 클릭베이트/허위정보 위험도 계산 함수
const calculateClickbaitRate = async (title, content) => {
  try {
    const analysis = await analyzeNewsWithAI(title, content);
    return analysis.clickbaitRate || 0;
  } catch (error) {
    console.error('클릭베이트 분석 실패:', error);
    return 0;
  }
};

const calculateAccuracy = async (title, content, publisher) => {
  try {
    const analysis = await analyzeNewsWithAI(title, content);
    return analysis.accuracy || 0;
  } catch (error) {
    console.error('정확도 분석 실패:', error);
    return 0;
  }
};

// 실시간 뉴스 크롤링 (실제 RSS 피드 사용)
export const crawlNaverNews = async () => {
  try {
    console.log('🔄 실시간 뉴스 크롤링 시작...');
    
    const allNews = [];
    
    // 실제 작동하는 RSS 피드 URL들
    const rssFeeds = [
      {
        name: 'SBS 뉴스',
        url: 'https://news.sbs.co.kr/news/SectionRssFeed.do?sectionId=01',
        oid: '055'
      },
      {
        name: 'BBC 코리아',
        url: 'https://feeds.bbci.co.uk/korean/rss.xml',
        oid: 'BBC'
      },
      {
        name: 'SBS 경제',
        url: 'https://news.sbs.co.kr/news/SectionRssFeed.do?sectionId=08',
        oid: '055'
      },
      {
        name: 'SBS 스포츠',
        url: 'https://news.sbs.co.kr/news/SectionRssFeed.do?sectionId=07',
        oid: '055'
      },
      {
        name: 'SBS 연예',
        url: 'https://news.sbs.co.kr/news/SectionRssFeed.do?sectionId=14',
        oid: '055'
      },
      // 🆕 추가 SBS 카테고리들 (이미 작동하는 것으로 확인됨)
      {
        name: 'SBS 사회',
        url: 'https://news.sbs.co.kr/news/SectionRssFeed.do?sectionId=02',
        oid: '055'
      },
      {
        name: 'SBS 국제',
        url: 'https://news.sbs.co.kr/news/SectionRssFeed.do?sectionId=03',
        oid: '055'
      },
      {
        name: 'SBS 정치',
        url: 'https://news.sbs.co.kr/news/SectionRssFeed.do?sectionId=04',
        oid: '055'
      },
      {
        name: 'SBS IT/과학',
        url: 'https://news.sbs.co.kr/news/SectionRssFeed.do?sectionId=05',
        oid: '055'
      }
    ];
    
    // 각 RSS 피드에서 뉴스 가져오기
    let successCount = 0;
    for (const feed of rssFeeds) {
      try {
        console.log(`📡 ${feed.name} RSS 크롤링 중...`);
        const feedNews = await crawlRSSFeed(feed);
        if (feedNews.length > 0) {
          allNews.push(...feedNews.slice(0, 30)); // 각 소스에서 30개씩
          console.log(`✅ ${feed.name}: ${feedNews.length}개 뉴스 수집 (${feedNews.slice(0, 3).map(n => n.title.substring(0, 20)).join(', ')}...)`);
          successCount++;
        } else {
          console.log(`⚠️ ${feed.name}: 뉴스 없음`);
        }
      } catch (error) {
        console.error(`❌ ${feed.name} 크롤링 실패:`, error.message);
      }
    }
    
    console.log(`📊 성공한 RSS 피드: ${successCount}/${rssFeeds.length}개`);
    console.log(`📰 총 수집된 뉴스: ${allNews.length}개`);
    
    console.log(`🎯 총 ${allNews.length}개 실시간 뉴스 수집 완료`);
    return allNews;
    
  } catch (error) {
    console.error('뉴스 크롤링 중 오류 발생:', error);
    return [];
  }
};

// RSS 피드 크롤링 함수
const crawlRSSFeed = async (feed) => {
  const news = [];
  
  for (const proxy of CORS_PROXIES) {
    try {
      const proxyUrl = proxy + encodeURIComponent(feed.url);
      console.log(`🔗 프록시 시도: ${proxy}`);
      
      const response = await axios.get(proxyUrl, {
        timeout: 10000,
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      // XML 파싱
      const xmlText = response.data;
      console.log(`📄 ${feed.name} XML 응답 길이:`, xmlText.length);
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      // 파싱 에러 확인
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        console.error(`❌ ${feed.name} XML 파싱 에러:`, parseError.textContent);
        continue;
      }
      
      // RSS 아이템들 추출
      const items = xmlDoc.querySelectorAll('item');
      console.log(`📰 ${feed.name} 아이템 개수:`, items.length);
      
      items.forEach((item, index) => {
        if (index >= 1000) return; // 최대 1000개만
        
        const title = item.querySelector('title')?.textContent || '제목 없음';
        const link = item.querySelector('link')?.textContent || item.querySelector('guid')?.textContent || '#';
        const description = item.querySelector('description')?.textContent || title;
        const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
        
        // 텍스트 정리 (HTML 엔티티 제거 포함)
        const cleanTitle = cleanText(title);
        const cleanDescription = cleanText(description).substring(0, 200) + '...';
        
        // AI 분석을 위한 뉴스 객체 생성 (임시로 기본값 사용)
        const newsItem = {
          id: Date.now() + index + Math.random() * 1000,
          title: cleanTitle,
          content: cleanDescription,
          publisher: feed.name,
          author: `${feed.name} 기자`,
          publishedAt: parseRSSDate(pubDate),
          url: link.trim(),
          clickbaitRate: 0, // AI 분석 후 업데이트
          accuracy: 0, // AI 분석 후 업데이트
          category: '뉴스'
        };
        
        news.push(newsItem);
      });
      
      console.log(`✅ ${feed.name} RSS 파싱 성공: ${news.length}개`);
      
      // AI 분석 수행
      console.log(`🤖 ${feed.name} AI 분석 시작 ====================`);
      console.log(`🤖 분석할 뉴스 개수: ${news.length}개`);
      
      for (let i = 0; i < news.length; i++) {
        try {
          console.log(`📝 ${feed.name} ${i + 1}번째 뉴스 분석 시작 ====================`);
          console.log(`📝 뉴스 ID: ${news[i].id}`);
          console.log(`📝 뉴스 제목: "${news[i].title}"`);
          console.log(`📝 뉴스 본문: "${news[i].content.substring(0, 100)}..."`);
          console.log(`📝 분석 전 clickbaitRate: ${news[i].clickbaitRate}`);
          console.log(`📝 분석 전 accuracy: ${news[i].accuracy}`);
          
          const analysis = await analyzeNewsWithAI(news[i].title, news[i].content);
          
          console.log(`📝 AI 분석 결과 받음:`, analysis);
          
          // 결과 할당
          news[i].clickbaitRate = analysis.clickbaitRate || 0;
          news[i].accuracy = analysis.accuracy || 0;
          
          console.log(`📝 분석 후 clickbaitRate: ${news[i].clickbaitRate}`);
          console.log(`📝 분석 후 accuracy: ${news[i].accuracy}`);
          console.log(`✅ ${feed.name} ${i + 1}번째 뉴스 분석 완료 ====================`);
          
          if (i % 5 === 0) { // 5개마다 진행상황 로그
            console.log(`📊 ${feed.name} AI 분석 진행: ${i + 1}/${news.length}`);
          }
        } catch (error) {
          console.error(`❌ ${feed.name} ${i + 1}번째 뉴스 AI 분석 실패 ====================`);
          console.error(`❌ 에러 메시지:`, error.message);
          console.error(`❌ 에러 스택:`, error.stack);
          // AI 분석 실패 시 기본값 유지
          news[i].clickbaitRate = 0;
          news[i].accuracy = 0;
          console.error(`❌ 기본값으로 설정: clickbaitRate=0, accuracy=0`);
        }
      }
      
      console.log(`✅ ${feed.name} AI 분석 완료 ====================`);
      console.log(`✅ 분석된 뉴스 샘플:`, news.slice(0, 3).map(n => ({
        title: n.title.substring(0, 30) + '...',
        clickbaitRate: n.clickbaitRate,
        accuracy: n.accuracy
      })));
      
      break; // 성공하면 다음 프록시 시도하지 않음
      
    } catch (error) {
      console.log(`❌ 프록시 ${proxy} 실패:`, error.message);
      continue;
    }
  }
  
  return news;
};

// HTML 엔티티 디코딩 함수 (Node.js 환경용)
const decodeHtmlEntities = (text) => {
  if (!text) return '';
  
  // 일반적인 HTML 엔티티들을 직접 치환
  let decoded = text;
  
  // 숫자 엔티티 (&#9650; 등)
  decoded = decoded.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(dec);
  });
  
  // 16진수 엔티티 (&#x9650; 등)
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  
  // 일반 엔티티들
  const entities = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™'
  };
  
  Object.keys(entities).forEach(entity => {
    decoded = decoded.replace(new RegExp(entity, 'g'), entities[entity]);
  });
  
  return decoded;
};

// 텍스트 정리 함수
const cleanText = (text) => {
  if (!text) return '';
  
  // HTML 엔티티 디코딩
  let cleaned = decodeHtmlEntities(text);
  
  // HTML 태그 제거
  cleaned = cleaned.replace(/<[^>]*>/g, '');
  
  // 특수 문자 정리 (삼각형 기호 등)
  cleaned = cleaned.replace(/[▲▼]/g, ''); // 삼각형 기호 제거
  
  // 연속된 공백 정리
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  // 앞뒤 공백 제거
  cleaned = cleaned.trim();
  
  return cleaned;
};

// RSS 날짜 파싱 함수
const parseRSSDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toISOString();
  } catch (error) {
    return new Date().toISOString();
  }
};

// 하드코딩된 함수들 제거 - 실시간 RSS만 사용

// 다른 뉴스 사이트 크롤링 함수들도 추가할 수 있습니다
export const crawlDaumNews = async () => {
  // Daum 뉴스 크롤링 로직
  return [];
};

export const crawlGoogleNews = async () => {
  // Google 뉴스 크롤링 로직  
  return [];
};

// 여러 소스에서 뉴스를 가져오는 통합 함수
export const crawlAllNews = async () => {
  try {
    console.log('🚀 통합 뉴스 크롤링 시작...');
    
    // 실시간 RSS 피드 크롤링만 사용
    const rssNews = await crawlNaverNews();

    console.log(`실시간 RSS: ${rssNews.length}개`);

    // RSS 뉴스만 사용
    const allNews = [...rssNews];
    
    // 중복 제거 (제목 기준)
    const uniqueNews = allNews.filter((news, index, self) => 
      index === self.findIndex(n => n.title === news.title)
    );

    // 최신순 정렬
    const sortedNews = uniqueNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    
    console.log(`✅ 총 ${sortedNews.length}개 뉴스 수집 완료`);
    return sortedNews;
    
  } catch (error) {
    console.error('통합 뉴스 크롤링 중 오류 발생:', error);
    
    // 오류 시 기존 방식으로 폴백
    try {
      console.log('기존 크롤링으로 폴백...');
      return await crawlNaverNews();
    } catch (fallbackError) {
      console.error('폴백 크롤링도 실패:', fallbackError);
      return [];
    }
  }
};

// 특정 키워드로 뉴스 검색하는 함수
export const searchNewsWithKeywords = async (keywords) => {
  try {
    console.log(`🔍 키워드 검색: ${keywords.join(', ')}`);
    
    // 실제 네이버에서 키워드 필터링
    const allNews = await crawlNaverNews();
    const filteredNews = allNews.filter(news => 
      keywords.some(keyword => 
        news.title.includes(keyword) || news.content.includes(keyword)
      )
    );
    
    console.log(`🎯 키워드 검색 완료: ${filteredNews.length}개 결과`);
    return filteredNews;
    
  } catch (error) {
    console.error('키워드 검색 중 오류:', error);
    return [];
  }
};