import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import authService, { User } from '../services/AuthService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 AuthProvider 초기화 중...');

    // Firebase Auth 상태 변화 감지
    const unsubscribe = authService.onAuthStateChanged(currentUser => {
      console.log(
        '🔄 인증 상태 변화:',
        currentUser
          ? `로그인됨 (${currentUser.email || currentUser.uid})`
          : '로그아웃됨',
      );
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
  };

  // 로딩 중일 때는 로딩 화면을 보여줄 수 있음 (선택사항)
  if (loading) {
    console.log('⏳ 인증 상태 확인 중...');
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내부에서 사용되어야 합니다');
  }
  return context;
};

export default AuthContext;
