import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../types';
import firestoreService from '../services/FirestoreService';
import authService from '../services/AuthService';

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

// 천사의 일기 테마 (프리미엄)
export const angelTheme: Theme = {
  id: 'angel',
  name: '천사의 일기',
  description: '순백의 깃털과 황금빛 후광이 감싸는 천상의 테마',
  category: 'premium',
  price: 3900,
  colors: {
    primary: '#FFD700', // 골드
    secondary: '#F5F5DC', // 베이지
    background: '#FFFEF7', // 아이보리
    surface: '#FEFEFE', // 순백
    text: '#4A4A4A', // 차콜그레이
    textSecondary: '#8B7355', // 브론즈
    accent: '#FFA500', // 오렌지골드
    success: '#32CD32', // 라임그린
    warning: '#FF8C00', // 다크오렌지
    error: '#DC143C', // 크림슨
    border: '#E6E6FA', // 라벤더
    shadow: '#D3D3D3', // 라이트그레이
  },
  icons: {
    home: '🏠',
    diary: '📖',
    search: '🔍',
    settings: '⚙️',
    add: '✨',
    edit: '✏️',
    delete: '🗑️',
    back: '⬅️',
    close: '❌',
    save: '💾',
    share: '📤',
    heart: '💛',
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

// 은하수 꿈 테마 (프리미엄)
export const galaxyDreamTheme: Theme = {
  id: 'galaxy-dream',
  name: '은하수 꿈',
  description: '별이 쏟아지는 밤하늘을 담은 신비로운 다크 테마',
  category: 'premium',
  price: 3900,
  colors: {
    primary: '#4A148C', // 딥퍼플
    secondary: '#7B1FA2', // 퍼플
    background: '#2A2A5E', // 밝은 다크네이비
    surface: '#1E2A4E', // 밝은 미드나잇블루
    text: '#E8EAF6', // 라이트퍼플
    textSecondary: '#B39DDB', // 라벤더
    accent: '#9C27B0', // 퍼플액센트
    success: '#00BCD4', // 시안
    warning: '#FF9800', // 오렌지
    error: '#F44336', // 레드
    border: '#3F51B5', // 인디고
    shadow: '#000051', // 다크인디고
  },
  icons: {
    home: '🌌',
    diary: '📘',
    search: '🔍',
    settings: '⚙️',
    add: '💫',
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

// 로즈골드 러브 테마 (프리미엄)
export const rosegoldLoveTheme: Theme = {
  id: 'rosegold-love',
  name: '로즈골드 러브',
  description: '따뜻한 로즈골드가 사랑을 속삭이는 로맨틱 테마',
  category: 'premium',
  price: 3900,
  colors: {
    primary: '#E91E63', // 핑크
    secondary: '#F8BBD9', // 라이트핑크
    background: '#FFF0F5', // 라벤더블러시
    surface: '#FCE4EC', // 연한핑크
    text: '#880E4F', // 다크핑크
    textSecondary: '#AD1457', // 핑크800
    accent: '#FF4081', // 핑크액센트
    success: '#4CAF50', // 그린
    warning: '#FF9800', // 오렌지
    error: '#F44336', // 레드
    border: '#F48FB1', // 핑크300
    shadow: '#EC407A', // 핑크400
  },
  icons: {
    home: '💖',
    diary: '📕',
    search: '🔍',
    settings: '⚙️',
    add: '💕',
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

// 달빛 세레나데 테마 (프리미엄)
export const moonlightSerenadeTheme: Theme = {
  id: 'moonlight-serenade',
  name: '달빛 세레나데',
  description: '은은한 달빛 아래 흐르는 고요한 선율의 테마',
  category: 'premium',
  price: 3900,
  colors: {
    primary: '#3F51B5', // 인디고
    secondary: '#C5CAE9', // 라이트인디고
    background: '#283593', // 진한 인디고 (더 선명함)
    surface: '#3949AB', // 인디고 600
    text: '#E8EAF6', // 연한 인디고 (텍스트는 밝게)
    textSecondary: '#C5CAE9', // 라이트인디고
    accent: '#536DFE', // 인디고액센트
    success: '#4CAF50', // 그린
    warning: '#FF9800', // 오렌지
    error: '#F44336', // 레드
    border: '#5C6BC0', // 인디고400
    shadow: '#1A237E', // 다크인디고
  },
  icons: {
    home: '🌙',
    diary: '📘',
    search: '🔍',
    settings: '⚙️',
    add: '🌟',
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

// 모든 테마 목록
export const allThemes: Theme[] = [
  defaultTheme,
  angelTheme,
  galaxyDreamTheme,
  rosegoldLoveTheme,
  moonlightSerenadeTheme,
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
    // Firebase에서 사용자 로그인 상태 확인
    const currentUser = authService.getCurrentUser();
    if (currentUser && !currentUser.isAnonymous) {
      // 실제 로그인된 사용자 (익명 제외): 구매 상태 반영
      const purchasedThemes = await firestoreService.getUserPurchasedThemes();
      const userCurrentTheme = await firestoreService.getUserCurrentTheme();

      const updatedThemes = allThemes.map(theme => ({
        ...theme,
        category: purchasedThemes.includes(theme.id) ? 'free' : theme.category,
        isActive: theme.id === userCurrentTheme,
      }));

      return updatedThemes;
    } else {
      // 익명 사용자 또는 로그인되지 않은 사용자: 기본 테마만 표시
      console.log('🎨 익명/비로그인 사용자 - 기본 테마만 표시');
      const restrictedThemes = allThemes.map(theme => ({
        ...theme,
        category:
          theme.id === 'default' ? ('free' as const) : ('premium' as const),
        isActive: theme.id === 'default',
      }));
      return restrictedThemes;
    }
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
  try {
    // Firebase에서 사용자 로그인 상태 확인
    const currentUser = authService.getCurrentUser();
    if (currentUser && !currentUser.isAnonymous) {
      // 실제 로그인된 사용자 (익명 제외): Firebase에서 테마 가져오기
      const userThemeId = await firestoreService.getUserCurrentTheme();
      const purchasedThemes = await firestoreService.getUserPurchasedThemes();

      // 테마 목록 로드하고 사용자 구매 상태 반영
      const themes = await loadThemes();
      const updatedThemes = themes.map(theme => ({
        ...theme,
        category: purchasedThemes.includes(theme.id) ? 'free' : theme.category,
        isActive: theme.id === userThemeId,
      }));

      return (
        updatedThemes.find(theme => theme.id === userThemeId) || defaultTheme
      );
    } else {
      // 익명 사용자 또는 로그인되지 않은 사용자: 기본 테마만 사용
      console.log('🎨 익명/비로그인 사용자 - 기본 테마 강제 적용');
      return defaultTheme;
    }
  } catch (error) {
    console.error('현재 테마 가져오기 실패:', error);
    return defaultTheme;
  }
};

// 테마 구매 처리 (구매 후 바로 적용)
export const purchaseTheme = async (themeId: string): Promise<void> => {
  try {
    const currentUser = authService.getCurrentUser();
    if (currentUser && !currentUser.isAnonymous) {
      // 실제 로그인된 사용자 (익명 제외): Firebase에서 처리
      await firestoreService.purchaseTheme(themeId);
    } else {
      // 익명 사용자 또는 로그인되지 않은 사용자: 구매 차단
      if (currentUser && currentUser.isAnonymous) {
        throw new Error(
          '🔒 익명 사용자는 테마를 구매할 수 없습니다.\n\n💡 이메일로 회원가입하면:\n• 테마 구매 가능\n• 데이터 안전 보관\n• 기기간 동기화',
        );
      } else {
        throw new Error('🔒 로그인 후 테마를 구매할 수 있습니다.');
      }
    }
  } catch (error) {
    console.error('테마 구매 처리 중 오류:', error);
    throw error;
  }
};

// 테마 적용
export const applyTheme = async (themeId: string): Promise<void> => {
  try {
    const currentUser = authService.getCurrentUser();
    if (currentUser && !currentUser.isAnonymous) {
      // 실제 로그인된 사용자 (익명 제외): Firebase에서 처리 (구매 확인 포함)
      await firestoreService.applyTheme(themeId);
    } else {
      // 익명 사용자 또는 로그인되지 않은 사용자: 기본 테마만 가능
      if (themeId !== 'default') {
        if (currentUser && currentUser.isAnonymous) {
          throw new Error(
            '🔒 익명 사용자는 기본 테마만 사용할 수 있습니다.\n이메일로 가입하면 프리미엄 테마를 구매할 수 있어요!',
          );
        } else {
          throw new Error('🔒 로그인 후 프리미엄 테마를 사용할 수 있습니다.');
        }
      }

      console.log('🎨 기본 테마 적용 중...');
      await saveActiveTheme(themeId);

      // 테마 활성화 상태 업데이트
      const themes = await loadThemes();
      const updatedThemes = themes.map(theme => ({
        ...theme,
        isActive: theme.id === themeId,
      }));
      await saveThemes(updatedThemes);
    }
  } catch (error) {
    console.error('테마 적용 중 오류:', error);
    throw error;
  }
};
