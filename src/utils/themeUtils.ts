import AsyncStorage from '@react-native-async-storage/async-storage';
import {Theme} from '../types';

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

// 천사 테마 (프리미엄)
export const angelTheme: Theme = {
  id: 'angel',
  name: '천사의 일기',
  description: '순백의 깃털과 황금빛 빛으로 가득한 천상의 테마',
  category: 'premium',
  price: 2900,
  colors: {
    primary: '#FFD700', // 황금색
    secondary: '#E6E6FA', // 연한 라벤더
    background: '#FFFFFF', // 순백
    surface: '#F8F8FF', // 연한 하늘색
    text: '#2C3E50', // 진한 회색
    textSecondary: '#7F8C8D', // 중간 회색
    accent: '#FF69B4', // 핑크
    success: '#98FB98', // 연한 초록
    warning: '#FFB6C1', // 연한 빨강
    error: '#FF6B6B', // 산호색
    border: '#E8E8E8', // 연한 회색
    shadow: '#D3D3D3', // 연한 회색
  },
  icons: {
    home: '👼',
    diary: '📜',
    search: '🔍',
    settings: '⚙️',
    add: '✨',
    edit: '✏️',
    delete: '🗑️',
    back: '⬅️',
    close: '❌',
    save: '💾',
    share: '📤',
    heart: '💖',
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

// 모든 테마 목록
export const allThemes: Theme[] = [defaultTheme, angelTheme];

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
