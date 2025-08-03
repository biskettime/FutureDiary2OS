import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Theme } from '../types';
import {
  getCurrentTheme,
  loadThemes,
  applyTheme as applyThemeUtil,
  purchaseTheme as purchaseThemeUtil,
} from '../utils/themeUtils';

interface ThemeContextType {
  currentTheme: Theme;
  allThemes: Theme[];
  applyTheme: (themeId: string) => Promise<void>;
  purchaseTheme: (themeId: string) => Promise<void>;
  refreshThemes: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [allThemes, setAllThemes] = useState<Theme[]>([]);

  const loadCurrentTheme = async () => {
    try {
      console.log('🎨 ThemeContext: 현재 테마 로드 시작');
      const theme = await getCurrentTheme();
      console.log('🎨 ThemeContext: 테마 로드 완료:', theme.id);
      setCurrentTheme(theme);
    } catch (error) {
      console.error('❌ ThemeContext: 현재 테마 로드 중 오류:', error);
    }
  };

  const loadAllThemes = async () => {
    try {
      console.log('🎨 ThemeContext: 모든 테마 로드 시작');
      const themes = await loadThemes();
      console.log('🎨 ThemeContext: 모든 테마 로드 완료:', themes.length, '개');
      setAllThemes(themes);
    } catch (error) {
      console.error('❌ ThemeContext: 모든 테마 로드 중 오류:', error);
    }
  };

  const applyTheme = async (themeId: string) => {
    try {
      console.log('🎨 ThemeContext: 테마 적용 시작 - 테마 ID:', themeId);
      await applyThemeUtil(themeId);
      console.log('🎨 ThemeContext: 테마 적용 완료, 테마 다시 로드 중...');
      await loadCurrentTheme();
      await loadAllThemes();
      console.log('🎨 ThemeContext: 테마 적용 및 로드 완료');
    } catch (error) {
      console.error('❌ ThemeContext: 테마 적용 중 오류:', error);
      throw error;
    }
  };

  const purchaseTheme = async (themeId: string) => {
    try {
      await purchaseThemeUtil(themeId);
      await loadAllThemes();
    } catch (error) {
      console.error('테마 구매 중 오류:', error);
      throw error;
    }
  };

  const refreshThemes = async () => {
    await loadCurrentTheme();
    await loadAllThemes();
  };

  useEffect(() => {
    loadCurrentTheme();
    loadAllThemes();
  }, []);

  if (!currentTheme) {
    // 로딩 중일 때는 기본 테마를 사용
    return (
      <ThemeContext.Provider
        value={{
          currentTheme: {
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
          },
          allThemes: [],
          applyTheme,
          purchaseTheme,
          refreshThemes,
        }}
      >
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        allThemes,
        applyTheme,
        purchaseTheme,
        refreshThemes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
