import { supabase } from './SupabaseConfig';
import {
  User as SupabaseUser,
  Session,
  AuthError,
} from '@supabase/supabase-js';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

class SupabaseAuthService {
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];

  constructor() {
    // 인증 상태 변경 리스너 설정
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Supabase 인증 상태 변경:', event);
      this.handleAuthStateChanged(session);
    });

    // 초기 세션 확인
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      this.handleAuthStateChanged(session);
    } catch (error) {
      console.error('❌ Supabase 인증 초기화 실패:', error);
    }
  }

  private handleAuthStateChanged = (session: Session | null) => {
    console.log(
      '🔐 Supabase 세션 상태 변경:',
      session ? '로그인됨' : '로그아웃됨',
    );

    if (session?.user) {
      const user = session.user;
      this.currentUser = {
        uid: user.id,
        email: user.email || null,
        displayName:
          user.user_metadata?.display_name ||
          user.user_metadata?.full_name ||
          null,
        photoURL: user.user_metadata?.avatar_url || null,
        isAnonymous: user.is_anonymous || false,
      };
    } else {
      this.currentUser = null;
    }

    // 모든 리스너에게 알림
    this.authStateListeners.forEach(listener => listener(this.currentUser));
  };

  // 인증 상태 리스너 등록
  onAuthStateChanged(listener: (user: User | null) => void): () => void {
    this.authStateListeners.push(listener);

    // 현재 상태를 즉시 전달
    listener(this.currentUser);

    // 리스너 해제 함수 반환
    return () => {
      const index = this.authStateListeners.indexOf(listener);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // 현재 사용자 가져오기
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // 이메일/비밀번호 회원가입
  async signUpWithEmail(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<User> {
    try {
      console.log('📧 Supabase 이메일 회원가입 시도:', email);
      console.log('🔍 Display Name:', displayName);
      console.log('🔍 Password length:', password.length);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            full_name: displayName,
          },
        },
      });

      console.log('🔍 Supabase 응답 데이터:', data);
      console.log('🔍 Supabase 에러:', error);

      if (error) {
        console.error('❌ Supabase 에러 상세:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
        });
        throw error;
      }

      if (!data.user) {
        console.error('❌ 응답에 사용자 정보 없음:', data);
        throw new Error('회원가입에 실패했습니다.');
      }

      const user: User = {
        uid: data.user.id,
        email: data.user.email || null,
        displayName: displayName || null,
        photoURL: null,
        isAnonymous: false,
      };

      console.log('✅ Supabase 이메일 회원가입 성공');
      return user;
    } catch (error: any) {
      console.error('❌ Supabase 이메일 회원가입 실패:', error);
      throw this.getSupabaseErrorMessage(error);
    }
  }

  // 이메일/비밀번호 로그인
  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      console.log('📧 Supabase 이메일 로그인 시도:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('로그인에 실패했습니다.');
      }

      const user: User = {
        uid: data.user.id,
        email: data.user.email || null,
        displayName:
          data.user.user_metadata?.display_name ||
          data.user.user_metadata?.full_name ||
          null,
        photoURL: data.user.user_metadata?.avatar_url || null,
        isAnonymous: false,
      };

      console.log('✅ Supabase 이메일 로그인 성공');
      return user;
    } catch (error: any) {
      console.error('❌ Supabase 이메일 로그인 실패:', error);
      throw this.getSupabaseErrorMessage(error);
    }
  }

  // 구글 로그인
  async signInWithGoogle(): Promise<User> {
    try {
      console.log('🔍 Supabase Google 로그인 시도');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'com.futurediary://auth',
        },
      });

      if (error) {
        throw error;
      }

      // OAuth 로그인은 리다이렉트 기반이므로 여기서는 성공 응답만 반환
      console.log('✅ Supabase Google 로그인 요청 성공');

      // 임시 응답 (실제 사용자 정보는 세션 콜백에서 처리됨)
      return {
        uid: '',
        email: '',
        displayName: '',
        photoURL: '',
        isAnonymous: false,
      };
    } catch (error: any) {
      console.error('❌ Supabase Google 로그인 실패:', error);
      throw this.getSupabaseErrorMessage(error);
    }
  }

  // 로그아웃
  async signOut(): Promise<void> {
    try {
      console.log('🚪 Supabase 로그아웃 시도');

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      console.log('✅ Supabase 로그아웃 성공');
    } catch (error: any) {
      console.error('❌ Supabase 로그아웃 실패:', error);
      throw error;
    }
  }

  // 비밀번호 재설정 이메일 전송
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      console.log('📧 Supabase 비밀번호 재설정 이메일 전송:', email);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'com.futurediary://reset-password',
      });

      if (error) {
        throw error;
      }

      console.log('✅ Supabase 비밀번호 재설정 이메일 전송 성공');
    } catch (error: any) {
      console.error('❌ Supabase 비밀번호 재설정 이메일 전송 실패:', error);
      throw this.getSupabaseErrorMessage(error);
    }
  }

  // 사용자 계정 삭제
  async deleteAccount(): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('로그인된 사용자가 없습니다.');
      }

      console.log('🗑️ Supabase 계정 삭제 시도');

      // Supabase에서는 사용자 삭제를 위해 RPC 함수를 호출해야 합니다
      // 이는 데이터베이스에 함수를 생성해야 합니다
      const { error } = await supabase.rpc('delete_user_account');

      if (error) {
        throw error;
      }

      console.log('✅ Supabase 계정 삭제 성공');
    } catch (error: any) {
      console.error('❌ Supabase 계정 삭제 실패:', error);
      throw this.getSupabaseErrorMessage(error);
    }
  }

  // Supabase 에러 메시지 변환
  private getSupabaseErrorMessage(error: AuthError | Error): string {
    if ('message' in error) {
      const message = error.message.toLowerCase();

      if (
        message.includes('user not found') ||
        message.includes('invalid login credentials')
      ) {
        return '등록되지 않은 이메일이거나 비밀번호가 잘못되었습니다.';
      } else if (message.includes('email already registered')) {
        return '이미 사용 중인 이메일입니다.';
      } else if (message.includes('password should be at least')) {
        return '비밀번호가 너무 약합니다. 6자 이상 입력해주세요.';
      } else if (message.includes('invalid email')) {
        return '잘못된 이메일 형식입니다.';
      } else if (message.includes('email not confirmed')) {
        return '이메일 인증이 필요합니다. 이메일을 확인해주세요.';
      } else if (message.includes('too many requests')) {
        return '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.';
      } else if (message.includes('network')) {
        return '네트워크 연결을 확인해주세요.';
      }
    }

    return error.message || '인증 과정에서 오류가 발생했습니다.';
  }
}

// 싱글톤 인스턴스 생성
const supabaseAuthService = new SupabaseAuthService();
export default supabaseAuthService;
