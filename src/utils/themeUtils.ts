import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../types';

const THEMES_KEY = 'THEMES';
const ACTIVE_THEME_KEY = 'ACTIVE_THEME';

// 기본 테마 (무료)
export const defaultTheme: Theme = {
  id: 'default',
  name: '기본',
  description: '깔끔하고 심플한 기본 테마',
  category: 'free',
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    text: '#000000',
    textSecondary: '#8E8E93',
    accent: '#FF9500',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    border: '#C6C6C8',
    shadow: '#000000',
  },
  icons: {
    home: '🏠',
    diary: '📖',
    search: '🔍',
    settings: '⚙️',
    add: '➕',
    edit: '✏️',
    delete: '🗑️',
    back: '⬅️',
    close: '❌',
    save: '💾',
    share: '📤',
    heart: '❤️',
    star: '⭐',
    moon: '🌙',
    sun: '☀️',
    cloud: '☁️',
    rain: '🌧️',
    snow: '❄️',
    wind: '💨',
    thunder: '⚡',
  },
  isActive: true,
};

// 천사 테마 (프리미엄) - 개선된 버전
export const angelTheme: Theme = {
  id: 'angel',
  name: '천사의 일기',
  description: '순백의 깃털과 황금빛 후광이 감싸는 신성한 테마',
  category: 'premium',
  price: 4500,
  colors: {
    primary: '#FFD700', // 황금색
    secondary: '#F0F8FF', // 앨리스 블루
    background: '#FFFAFA', // 설백색
    surface: '#F5F5DC', // 베이지
    text: '#2F4F4F', // 진한 슬레이트 그레이
    textSecondary: '#696969', // 딤 그레이
    accent: '#FFB6C1', // 라이트 핑크
    success: '#98FB98', // 팔레 그린
    warning: '#F0E68C', // 카키
    error: '#FFA07A', // 라이트 살몬
    border: '#E6E6FA', // 라벤더
    shadow: '#D3D3D3', // 라이트 그레이
  },
  icons: {
    home: '👼',
    diary: '📜',
    search: '🔍',
    settings: '⚙️',
    add: '✨',
    edit: '🖋️',
    delete: '🗑️',
    back: '⬅️',
    close: '❌',
    save: '💾',
    share: '📤',
    heart: '🤍',
    star: '⭐',
    moon: '🌙',
    sun: '☀️',
    cloud: '☁️',
    rain: '🌧️',
    snow: '❄️',
    wind: '💨',
    thunder: '⚡',
  },
  backgroundPattern: 'angel',
  fontFamily: 'System',
  isActive: false,
};

// 은하수 꿈 테마 (프리미엄)
export const galaxyDreamTheme: Theme = {
  id: 'galaxy-dream',
  name: '은하수 꿈',
  description: '별이 쏟아지는 밤하늘을 담은 신비로운 테마',
  category: 'premium',
  price: 3900,
  colors: {
    primary: '#6B46C1', // 보라
    secondary: '#1E1B4B', // 진한 남색
    background: '#0F0F23', // 거의 검정
    surface: '#1E1B4B', // 진한 남색
    text: '#E5E7EB', // 연한 회색
    textSecondary: '#9CA3AF', // 중간 회색
    accent: '#F59E0B', // 황금
    success: '#10B981', // 에메랄드
    warning: '#F59E0B', // 황금
    error: '#EF4444', // 빨강
    border: '#374151', // 진한 회색
    shadow: '#000000', // 검정
  },
  icons: {
    home: '🌌',
    diary: '📚',
    search: '🔭',
    settings: '⚙️',
    add: '✨',
    edit: '🖋️',
    delete: '🗑️',
    back: '⬅️',
    close: '❌',
    save: '💾',
    share: '📤',
    heart: '💜',
    star: '⭐',
    moon: '🌙',
    sun: '☀️',
    cloud: '☁️',
    rain: '🌧️',
    snow: '❄️',
    wind: '💨',
    thunder: '⚡',
  },
  isActive: false,
};

// 로즈골드 러브 테마 (프리미엄)
export const rosegoldLoveTheme: Theme = {
  id: 'rosegold-love',
  name: '로즈골드 러브',
  description: '따뜻한 로즈골드가 사랑을 속삭이는 로맨틱 테마',
  category: 'premium',
  price: 3400,
  colors: {
    primary: '#E91E63', // 딥핑크
    secondary: '#F8BBD9', // 연한 핑크
    background: '#FFF8F0', // 크림색
    surface: '#FCE4EC', // 연한 로즈
    text: '#4A148C', // 진한 보라
    textSecondary: '#7B1FA2', // 중간 보라
    accent: '#FF6F91', // 코랄핑크
    success: '#81C784', // 연한 초록
    warning: '#FFB74D', // 연한 주황
    error: '#E57373', // 연한 빨강
    border: '#F8BBD9', // 연한 핑크
    shadow: '#E1BEE7', // 연한 라벤더
  },
  icons: {
    home: '💖',
    diary: '💕',
    search: '🔍',
    settings: '⚙️',
    add: '💝',
    edit: '✏️',
    delete: '🗑️',
    back: '⬅️',
    close: '❌',
    save: '💾',
    share: '📤',
    heart: '💗',
    star: '🌟',
    moon: '🌙',
    sun: '☀️',
    cloud: '☁️',
    rain: '🌧️',
    snow: '❄️',
    wind: '💨',
    thunder: '⚡',
  },
  isActive: false,
};

// 오로라 비전 테마 (프리미엄)
export const auroraVisionTheme: Theme = {
  id: 'aurora-vision',
  name: '오로라 비전',
  description: '신비로운 극광이 춤추는 환상적인 테마',
  category: 'premium',
  price: 4200,
  colors: {
    primary: '#00FFF0', // 시안
    secondary: '#8A2BE2', // 블루바이올렛
    background: '#0A0A1A', // 어두운 남색
    surface: '#1A1A2E', // 진한 남색
    text: '#E0FFFF', // 연한 시안
    textSecondary: '#B0E0E6', // 파우더 블루
    accent: '#FF1493', // 딥핑크
    success: '#00FF7F', // 스프링그린
    warning: '#FFD700', // 골드
    error: '#FF6347', // 토마토
    border: '#4169E1', // 로얄블루
    shadow: '#191970', // 미드나잇블루
  },
  icons: {
    home: '🌃',
    diary: '📔',
    search: '🔍',
    settings: '⚙️',
    add: '🌠',
    edit: '✏️',
    delete: '🗑️',
    back: '⬅️',
    close: '❌',
    save: '💾',
    share: '📤',
    heart: '💙',
    star: '⭐',
    moon: '🌙',
    sun: '☀️',
    cloud: '☁️',
    rain: '🌧️',
    snow: '❄️',
    wind: '💨',
    thunder: '⚡',
  },
  isActive: false,
};

// 달빛 세레나데 테마 (프리미엄)
export const moonlightSerenadeTheme: Theme = {
  id: 'moonlight-serenade',
  name: '달빛 세레나데',
  description: '은은한 달빛 아래 흐르는 고요한 선율의 테마',
  category: 'premium',
  price: 3600,
  colors: {
    primary: '#4FC3F7', // 스카이블루
    secondary: '#E1F5FE', // 연한 블루
    background: '#F8F9FA', // 연한 회색
    surface: '#E3F2FD', // 연한 블루
    text: '#263238', // 블루그레이
    textSecondary: '#546E7A', // 중간 블루그레이
    accent: '#29B6F6', // 라이트블루
    success: '#66BB6A', // 라이트그린
    warning: '#FFA726', // 오렌지
    error: '#EF5350', // 레드
    border: '#B3E5FC', // 연한 스카이블루
    shadow: '#90A4AE', // 블루그레이
  },
  icons: {
    home: '🌙',
    diary: '📖',
    search: '🔍',
    settings: '⚙️',
    add: '🌟',
    edit: '✏️',
    delete: '🗑️',
    back: '⬅️',
    close: '❌',
    save: '💾',
    share: '📤',
    heart: '🤍',
    star: '⭐',
    moon: '🌙',
    sun: '☀️',
    cloud: '☁️',
    rain: '🌧️',
    snow: '❄️',
    wind: '💨',
    thunder: '⚡',
  },
  isActive: false,
};

// 벚꽃 환상 테마 (프리미엄)
export const cherryBlossomTheme: Theme = {
  id: 'cherry-blossom',
  name: '벚꽃 환상',
  description: '봄바람에 흩날리는 벚꽃 꽃잎의 꿈결같은 테마',
  category: 'premium',
  price: 3200,
  colors: {
    primary: '#F8BBD9', // 체리블라썸
    secondary: '#FCE4EC', // 연한 핑크
    background: '#FFFDE7', // 크림 옐로우
    surface: '#FFF3E0', // 연한 오렌지
    text: '#4A148C', // 퍼플
    textSecondary: '#6A1B9A', // 중간 퍼플
    accent: '#FF4081', // 핑크 액센트
    success: '#8BC34A', // 라이트그린
    warning: '#FFC107', // 앰버
    error: '#F44336', // 레드
    border: '#F8BBD9', // 체리블라썸
    shadow: '#E1BEE7', // 라이트퍼플
  },
  icons: {
    home: '🌸',
    diary: '📝',
    search: '🔍',
    settings: '⚙️',
    add: '🌺',
    edit: '✏️',
    delete: '🗑️',
    back: '⬅️',
    close: '❌',
    save: '💾',
    share: '📤',
    heart: '💗',
    star: '⭐',
    moon: '🌙',
    sun: '☀️',
    cloud: '☁️',
    rain: '🌧️',
    snow: '❄️',
    wind: '💨',
    thunder: '⚡',
  },
  isActive: false,
};

// 라벤더 드림 테마 (프리미엄)
export const lavenderDreamTheme: Theme = {
  id: 'lavender-dream',
  name: '라벤더 드림',
  description: '향긋한 라벤더 향이 감도는 평온한 꿈의 테마',
  category: 'premium',
  price: 2800,
  colors: {
    primary: '#9C27B0', // 퍼플
    secondary: '#E1BEE7', // 라이트퍼플
    background: '#F3E5F5', // 연한 퍼플
    surface: '#EDE7F6', // 연한 딥퍼플
    text: '#4A148C', // 딥퍼플
    textSecondary: '#7B1FA2', // 퍼플
    accent: '#AB47BC', // 미디엄퍼플
    success: '#66BB6A', // 라이트그린
    warning: '#FF9800', // 오렌지
    error: '#F44336', // 레드
    border: '#CE93D8', // 퍼플 200
    shadow: '#BA68C8', // 퍼플 300
  },
  icons: {
    home: '🏠',
    diary: '📓',
    search: '🔍',
    settings: '⚙️',
    add: '💜',
    edit: '✏️',
    delete: '🗑️',
    back: '⬅️',
    close: '❌',
    save: '💾',
    share: '📤',
    heart: '💜',
    star: '⭐',
    moon: '🌙',
    sun: '☀️',
    cloud: '☁️',
    rain: '🌧️',
    snow: '❄️',
    wind: '💨',
    thunder: '⚡',
  },
  isActive: false,
};

// 황금 일몰 테마 (프리미엄)
export const goldenSunsetTheme: Theme = {
  id: 'golden-sunset',
  name: '황금 일몰',
  description: '따뜻한 노을이 물든 황금빛 하늘의 테마',
  category: 'premium',
  price: 3800,
  colors: {
    primary: '#FF9800', // 오렌지
    secondary: '#FFE0B2', // 연한 오렌지
    background: '#FFF8E1', // 연한 앰버
    surface: '#FFECB3', // 연한 앰버
    text: '#E65100', // 딥오렌지
    textSecondary: '#FF8F00', // 앰버
    accent: '#FF5722', // 딥오렌지
    success: '#8BC34A', // 라이트그린
    warning: '#FFC107', // 앰버
    error: '#F44336', // 레드
    border: '#FFCC02', // 앰버 A200
    shadow: '#FFB300', // 앰버 600
  },
  icons: {
    home: '🌅',
    diary: '📒',
    search: '🔍',
    settings: '⚙️',
    add: '🧡',
    edit: '✏️',
    delete: '🗑️',
    back: '⬅️',
    close: '❌',
    save: '💾',
    share: '📤',
    heart: '🧡',
    star: '⭐',
    moon: '🌙',
    sun: '☀️',
    cloud: '☁️',
    rain: '🌧️',
    snow: '❄️',
    wind: '💨',
    thunder: '⚡',
  },
  isActive: false,
};

// 모든 테마 목록
export const allThemes: Theme[] = [
  defaultTheme,
  angelTheme,
  galaxyDreamTheme,
  rosegoldLoveTheme,
  auroraVisionTheme,
  moonlightSerenadeTheme,
  cherryBlossomTheme,
  lavenderDreamTheme,
  goldenSunsetTheme,
];

// 테마 저장
export const saveThemes = async (themes: Theme[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(THEMES_KEY, JSON.stringify(themes));
  } catch (error) {
    console.error('테마 저장 중 오류:', error);
    throw error;
  }
};

// 테마 불러오기
export const loadThemes = async (): Promise<Theme[]> => {
  try {
    const data = await AsyncStorage.getItem(THEMES_KEY);
    if (data) {
      return JSON.parse(data);
    }
    // 기본 테마들 저장
    await saveThemes(allThemes);
    return allThemes;
  } catch (error) {
    console.error('테마 불러오기 중 오류:', error);
    return allThemes;
  }
};

// 활성 테마 저장
export const saveActiveTheme = async (themeId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(ACTIVE_THEME_KEY, themeId);
  } catch (error) {
    console.error('활성 테마 저장 중 오류:', error);
    throw error;
  }
};

// 활성 테마 불러오기
export const loadActiveTheme = async (): Promise<string> => {
  try {
    const themeId = await AsyncStorage.getItem(ACTIVE_THEME_KEY);
    return themeId || 'default';
  } catch (error) {
    console.error('활성 테마 불러오기 중 오류:', error);
    return 'default';
  }
};

// 현재 활성 테마 가져오기
export const getCurrentTheme = async (): Promise<Theme> => {
  const themes = await loadThemes();
  const activeThemeId = await loadActiveTheme();
  return themes.find(theme => theme.id === activeThemeId) || defaultTheme;
};

// 테마 구매 처리
export const purchaseTheme = async (themeId: string): Promise<void> => {
  try {
    const themes = await loadThemes();
    const themeIndex = themes.findIndex(theme => theme.id === themeId);

    if (themeIndex >= 0) {
      themes[themeIndex].category = 'free'; // 구매 후 무료로 변경
      await saveThemes(themes);
    }
  } catch (error) {
    console.error('테마 구매 처리 중 오류:', error);
    throw error;
  }
};

// 테마 적용
export const applyTheme = async (themeId: string): Promise<void> => {
  try {
    await saveActiveTheme(themeId);

    // 테마 활성화 상태 업데이트
    const themes = await loadThemes();
    const updatedThemes = themes.map(theme => ({
      ...theme,
      isActive: theme.id === themeId,
    }));
    await saveThemes(updatedThemes);
  } catch (error) {
    console.error('테마 적용 중 오류:', error);
    throw error;
  }
};
