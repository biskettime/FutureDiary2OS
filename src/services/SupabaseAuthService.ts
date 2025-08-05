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
      console.log('🔄 Supabase 세션 확인 중...');
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('❌ Supabase 세션 가져오기 실패:', error);
        return;
      }

      console.log(
        '📝 Supabase 세션 상태:',
        session ? '세션 있음' : '세션 없음',
      );
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

  // 테스트 계정인지 확인
  isTestAccount(): boolean {
    if (!this.currentUser || !this.currentUser.email) {
      return false;
    }
    return this.currentUser.email === 'test@example.com';
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
          emailRedirectTo: undefined, // React Native에서는 이메일 확인 비활성화
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

      // 회원가입 후 자동 로그인 시도
      if (data.session) {
        console.log('✅ 세션 생성됨, 자동 로그인 성공');
      } else {
        console.log('⚠️ 세션 없음, 수동 로그인 시도');
        // 이메일 확인이 필요 없는 경우 자동으로 로그인 시도
        try {
          const { data: loginData, error: loginError } =
            await supabase.auth.signInWithPassword({
              email,
              password,
            });

          if (loginError) {
            console.warn('⚠️ 자동 로그인 실패:', loginError);
            // 이메일 확인이 필요한 경우 사용자에게 알림
            if (loginError.message?.includes('Email not confirmed')) {
              throw new Error(
                '이메일 인증이 필요합니다. 이메일을 확인해주세요.',
              );
            }
          } else if (loginData.session) {
            console.log('✅ 자동 로그인 성공');
          }
        } catch (loginError) {
          console.warn('⚠️ 자동 로그인 실패:', loginError);
          throw loginError;
        }
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
        console.error('❌ Supabase 로그인 에러:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
        });

        // 이메일 확인이 필요한 경우 특별 처리
        if (error.message?.includes('Email not confirmed')) {
          throw new Error('이메일 인증이 필요합니다. 이메일을 확인해주세요.');
        }

        throw error;
      }

      if (!data.user) {
        throw new Error('로그인에 실패했습니다.');
      }

      // 세션이 있는지 확인
      if (!data.session) {
        console.warn('⚠️ 세션이 없습니다. 이메일 확인이 필요할 수 있습니다.');
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

      console.log('✅ Supabase 이메일 로그인 성공:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      });

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
      console.log(
        '🔍 Supabase URL:',
        'https://yzxktziagsqfoljzsock.supabase.co',
      );
      console.log('🔍 Redirect URL:', 'com.futurediary://auth');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'com.futurediary://auth',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('❌ Supabase OAuth 에러:', error);
        console.error('❌ 에러 코드:', error.status);
        console.error('❌ 에러 메시지:', error.message);
        console.error('❌ 에러 이름:', error.name);
        throw error;
      }

      if (!data.url) {
        throw new Error('OAuth URL을 생성할 수 없습니다.');
      }

      console.log('✅ Supabase OAuth URL 생성 성공:', data.url);

      // OAuth URL을 반환하여 In-App Browser에서 처리
      return {
        uid: 'temp',
        email: '',
        displayName: '',
        photoURL: null,
        isAnonymous: false,
        oauthUrl: data.url,
      } as User;
    } catch (error: any) {
      console.error('❌ Supabase Google 로그인 실패:', error);
      console.error('❌ 에러 타입:', typeof error);
      console.error('❌ 에러 객체:', JSON.stringify(error, null, 2));
      if (error.message?.includes('로그인이 필요합니다')) {
        throw new Error(
          'Google 로그인 설정이 필요합니다. Supabase 대시보드에서 Google OAuth를 설정해주세요.',
        );
      }
      throw this.getSupabaseErrorMessage(error);
    }
  }

  // 닉네임 중복 확인

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
    // NICKNAME_NOT_FOUND는 그대로 유지
    if ('message' in error && error.message === 'NICKNAME_NOT_FOUND') {
      return 'NICKNAME_NOT_FOUND';
    }

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
