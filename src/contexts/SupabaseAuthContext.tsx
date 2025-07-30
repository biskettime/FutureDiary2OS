import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import supabaseAuthService, { User } from '../services/SupabaseAuthService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const SupabaseAuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export const SupabaseAuthProvider: React.FC<AuthProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 SupabaseAuthProvider 초기화 중...');

    // Supabase Auth 상태 변화 감지
    const unsubscribe = supabaseAuthService.onAuthStateChanged(currentUser => {
      console.log(
        '🔄 Supabase 인증 상태 변화:',
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
    console.log('⏳ Supabase 인증 상태 확인 중...');
  }

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export const useSupabaseAuth = (): AuthContextType => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error(
      'useSupabaseAuth는 SupabaseAuthProvider 내부에서 사용되어야 합니다',
    );
  }
  return context;
};

export default SupabaseAuthContext;
