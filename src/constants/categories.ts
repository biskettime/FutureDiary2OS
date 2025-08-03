import { CategoryOptionsMap } from '../types';

export const CATEGORY_OPTIONS: CategoryOptionsMap = {
  weather: {
    title: '날씨',
    options: {
      sunny: { name: '맑음', icon: '☀️', color: '#FFE066' },
      cloudy: { name: '흐림', icon: '☁️', color: '#E0E0E0' },
      rainy: { name: '비', icon: '🌧️', color: '#81D4FA' },
      snowy: { name: '눈', icon: '❄️', color: '#E1F5FE' },
      windy: { name: '바람', icon: '💨', color: '#B0BEC5' },
    },
  },
  people: {
    title: '사람',
    options: {
      friends: { name: '친구', icon: '⭐', color: '#64B5F6' },
      family: { name: '가족', icon: '🌱', color: '#81C784' },
      lover: { name: '연인', icon: '💖', color: '#F06292' },
      acquaintance: { name: '지인', icon: '😊', color: '#FFB74D' },
      alone: { name: '만나지 않음', icon: '❌', color: '#90A4AE' },
    },
  },
  school: {
    title: '학교',
    options: {
      class: { name: '수업', icon: '📚', color: '#4CAF50' },
      study: { name: '공부', icon: '🔍', color: '#FFC107' },
      assignment: { name: '과제', icon: '📝', color: '#FF9800' },
      exam: { name: '시험', icon: '🌸', color: '#E91E63' },
      teamwork: { name: '팀플', icon: '💬', color: '#4CAF50' },
    },
  },
  company: {
    title: '회사',
    options: {
      meeting: { name: '회의', icon: '👥', color: '#2196F3' },
      work: { name: '업무', icon: '💼', color: '#607D8B' },
      project: { name: '프로젝트', icon: '📊', color: '#9C27B0' },
      presentation: { name: '발표', icon: '🎤', color: '#FF5722' },
      training: { name: '교육', icon: '📖', color: '#795548' },
    },
  },
  travel: {
    title: '여행',
    options: {
      airplane: { name: '비행기', icon: '✈️', color: '#03A9F4' },
      ship: { name: '배', icon: '🚢', color: '#00BCD4' },
      train: { name: '기차', icon: '🚄', color: '#4CAF50' },
      bus: { name: '버스', icon: '🚌', color: '#FF9800' },
      car: { name: '승용차', icon: '🚗', color: '#9E9E9E' },
      motorcycle: { name: '오토바이', icon: '🏍️', color: '#F44336' },
    },
  },
  food: {
    title: '음식',
    options: {
      korean: { name: '한식', icon: '🍚', color: '#8BC34A' },
      western: { name: '양식', icon: '🍝', color: '#FFC107' },
      chinese: { name: '중식', icon: '🥢', color: '#FF5722' },
      japanese: { name: '일식', icon: '🍣', color: '#E91E63' },
      fast_food: { name: '패스트푸드', icon: '🍔', color: '#FF9800' },
    },
  },
  dessert: {
    title: '디저트',
    options: {
      cake: { name: '케이크', icon: '🎂', color: '#FFB3BA' },
      ice_cream: { name: '아이스크림', icon: '🍦', color: '#87CEEB' },
      chocolate: { name: '초콜릿', icon: '🍫', color: '#8B4513' },
      cookie: { name: '쿠키', icon: '🍪', color: '#DEB887' },
      candy: { name: '사탕', icon: '🍬', color: '#FF69B4' },
    },
  },
  drink: {
    title: '음료',
    options: {
      coffee: { name: '커피', icon: '☕', color: '#8B4513' },
      tea: { name: '차', icon: '🍵', color: '#228B22' },
      juice: { name: '주스', icon: '🧃', color: '#FF6347' },
      soda: { name: '탄산음료', icon: '🥤', color: '#FF69B4' },
      water: { name: '물', icon: '💧', color: '#87CEEB' },
    },
  },
};

export const MOOD_OPTIONS = {
  excited: { name: '신남', emoji: '🤩', color: '#FF6B6B' },
  happy: { name: '행복', emoji: '😊', color: '#4ECDC4' },
  content: { name: '만족', emoji: '😌', color: '#45B7D1' },
  neutral: { name: '보통', emoji: '😐', color: '#96CEB4' },
  sad: { name: '슬픔', emoji: '😢', color: '#FFEAA7' },
  angry: { name: '화남', emoji: '😠', color: '#DDA0DD' },
  anxious: { name: '불안', emoji: '😰', color: '#98D8C8' },
} as const;

export const RESULT_STATUS_OPTIONS = {
  realized: { name: '실현됨', emoji: '✅', color: '#4CAF50' },
  not_realized: { name: '실현되지 않음', emoji: '❌', color: '#F44336' },
} as const;
