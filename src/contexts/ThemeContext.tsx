import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {Theme} from '../types';
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

export const ThemeProvider: React.FC<ThemeProviderProps> = ({children}) => {
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [allThemes, setAllThemes] = useState<Theme[]>([]);

  const loadCurrentTheme = async () => {
    try {
      const theme = await getCurrentTheme();
      setCurrentTheme(theme);
    } catch (error) {
      console.error('현재 테마 로드 중 오류:', error);
    }
  };

  const loadAllThemes = async () => {
    try {
      const themes = await loadThemes();
      setAllThemes(themes);
    } catch (error) {
      console.error('모든 테마 로드 중 오류:', error);
    }
  };

  const applyTheme = async (themeId: string) => {
    try {
      await applyThemeUtil(themeId);
      await loadCurrentTheme();
      await loadAllThemes();
    } catch (error) {
      console.error('테마 적용 중 오류:', error);
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
    return null; // 로딩 중
  }

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        allThemes,
        applyTheme,
        purchaseTheme,
        refreshThemes,
      }}>
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
