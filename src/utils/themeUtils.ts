import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme } from '../types';
import supabaseService from '../services/SupabaseService';
import supabaseAuthService from '../services/SupabaseAuthService';

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
    primary: '#6A1B9A', // 더 밝은 딥퍼플
    secondary: '#8E24AA', // 더 밝은 퍼플
    background: '#1A1A3E', // 더 어두운 다크네이비
    surface: '#2A2A4E', // 더 어두운 미드나잇블루
    text: '#FFFFFF', // 순백
    textSecondary: '#E1BEE7', // 더 밝은 라벤더
    accent: '#BA68C8', // 더 밝은 퍼플액센트
    success: '#4DD0E1', // 더 밝은 시안
    warning: '#FFB74D', // 더 밝은 오렌지
    error: '#EF5350', // 더 밝은 레드
    border: '#5C6BC0', // 더 밝은 인디고
    shadow: '#1A237E', // 더 밝은 다크인디고
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
    console.log('🎨 loadThemes 호출됨');

    // Supabase에서 사용자 로그인 상태 확인
    const currentUser = supabaseAuthService.getCurrentUser();
    console.log('🔍 현재 사용자 (loadThemes):', currentUser);

    if (currentUser && !currentUser.isAnonymous) {
      // 실제 로그인된 사용자 (익명 제외): 구매 상태 반영
      console.log('✅ 로그인된 사용자 - 구매 상태 반영');
      const purchasedThemes = await supabaseService.getUserPurchasedThemes();
      const userCurrentTheme = await supabaseService.getUserCurrentTheme();

      console.log('📊 구매한 테마들 (loadThemes):', purchasedThemes);
      console.log('📊 현재 사용자 테마 (loadThemes):', userCurrentTheme);

      const updatedThemes = allThemes.map(theme => ({
        ...theme,
        category: purchasedThemes.includes(theme.id) ? 'free' : theme.category,
        isActive: theme.id === userCurrentTheme,
      }));

      console.log(
        '🎨 업데이트된 테마들:',
        updatedThemes.map(t => ({
          id: t.id,
          category: t.category,
          isActive: t.isActive,
        })),
      );
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
      console.log(
        '🎨 제한된 테마들:',
        restrictedThemes.map(t => ({
          id: t.id,
          category: t.category,
          isActive: t.isActive,
        })),
      );
      return restrictedThemes;
    }
  } catch (error) {
    console.error('❌ 테마 불러오기 중 오류:', error);
    console.log('🔄 기본 테마 목록으로 폴백');
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
    console.log('🎨 getCurrentTheme 호출됨');

    // Supabase에서 사용자 로그인 상태 확인
    const currentUser = supabaseAuthService.getCurrentUser();
    console.log('🔍 현재 사용자:', currentUser);

    // 테스트 계정 확인
    const isTestAccount = supabaseAuthService.isTestAccount();

    if (currentUser && (!currentUser.isAnonymous || isTestAccount)) {
      // 실제 로그인된 사용자 또는 테스트 계정: Supabase에서 테마 가져오기
      console.log(
        '✅ 로그인된 사용자 또는 테스트 계정 - Supabase에서 테마 가져오기',
      );
      const userThemeId = await supabaseService.getUserCurrentTheme();
      const purchasedThemes = await supabaseService.getUserPurchasedThemes();

      console.log('📊 사용자 테마 ID:', userThemeId);
      console.log('📊 구매한 테마들:', purchasedThemes);

      // 신규 사용자 확인: 구매한 테마가 'default'만 있으면 신규 사용자로 간주
      const isNewUser =
        purchasedThemes.length === 1 && purchasedThemes.includes('default');

      if (isNewUser) {
        console.log('🆕 신규 사용자 감지 - 기본 테마 강제 적용');
        // 신규 사용자는 무조건 기본 테마로 시작
        await supabaseService.applyTheme('default');
        return defaultTheme;
      }

      // 테스트 계정인 경우 모든 테마를 무료로 설정
      const themes = await loadThemes();
      const updatedThemes = themes.map(theme => ({
        ...theme,
        category: isTestAccount
          ? 'free'
          : purchasedThemes.includes(theme.id)
          ? 'free'
          : theme.category,
        isActive: theme.id === userThemeId,
      }));

      const selectedTheme =
        updatedThemes.find(theme => theme.id === userThemeId) || defaultTheme;
      console.log('🎨 선택된 테마:', selectedTheme.id);
      return selectedTheme;
    } else {
      // 익명 사용자 또는 로그인되지 않은 사용자: 기본 테마만 사용
      console.log('🎨 익명/비로그인 사용자 - 기본 테마 강제 적용');
      return defaultTheme;
    }
  } catch (error) {
    console.error('❌ 현재 테마 가져오기 실패:', error);
    console.log('🔄 기본 테마로 폴백');
    return defaultTheme;
  }
};

// 테마 구매 처리 (구매 후 바로 적용)
export const purchaseTheme = async (themeId: string): Promise<void> => {
  try {
    const currentUser = supabaseAuthService.getCurrentUser();
    const isTestAccount = supabaseAuthService.isTestAccount();

    if (currentUser && (!currentUser.isAnonymous || isTestAccount)) {
      // 실제 로그인된 사용자 또는 테스트 계정: Supabase에서 처리
      if (isTestAccount) {
        console.log('🧪 테스트 계정 - 테마 구매 시뮬레이션');
        // 테스트 계정은 구매 없이 바로 적용
        await applyTheme(themeId);
      } else {
        await supabaseService.purchaseTheme(themeId);
      }
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
    console.log('🎨 applyTheme 호출됨 - 테마 ID:', themeId);

    const currentUser = supabaseAuthService.getCurrentUser();
    const isTestAccount = supabaseAuthService.isTestAccount();
    console.log('🔍 현재 사용자 (applyTheme):', currentUser);
    console.log('🧪 테스트 계정 여부:', isTestAccount);

    if (currentUser && (!currentUser.isAnonymous || isTestAccount)) {
      // 실제 로그인된 사용자 또는 테스트 계정: Supabase에서 처리
      console.log(
        '✅ 로그인된 사용자 또는 테스트 계정 - Supabase에서 테마 적용',
      );
      await supabaseService.applyTheme(themeId);
      console.log('✅ Supabase 테마 적용 완료');
    } else {
      // 익명 사용자 또는 로그인되지 않은 사용자: 기본 테마만 가능
      if (themeId !== 'default') {
        console.log('🔒 익명/비로그인 사용자 - 기본 테마만 허용');
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
      console.log('✅ 로컬 테마 적용 완료 - 테마 ID:', themeId);
    }
  } catch (error) {
    console.error('❌ 테마 적용 중 오류:', error);
    throw error;
  }
};
