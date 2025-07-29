import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

class AuthService {
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];

  constructor() {
    // Google Sign-In 설정 (실제 프로젝트에서는 실제 웹 클라이언트 ID 사용)
    GoogleSignin.configure({
      webClientId: 'YOUR_WEB_CLIENT_ID', // Firebase 콘솔에서 얻을 수 있음
    });

    // 인증 상태 변경 리스너
    auth().onAuthStateChanged(this.handleAuthStateChanged);
  }

  private handleAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    console.log('🔐 인증 상태 변경:', user ? '로그인됨' : '로그아웃됨');

    if (user) {
      this.currentUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isAnonymous: user.isAnonymous,
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
      console.log('📧 이메일 회원가입 시도:', email);

      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );

      // 사용자 프로필 업데이트
      if (displayName && userCredential.user) {
        await userCredential.user.updateProfile({
          displayName,
        });
      }

      const user: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: displayName || userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        isAnonymous: false,
      };

      console.log('✅ 이메일 회원가입 성공');
      return user;
    } catch (error: any) {
      console.error('❌ 이메일 회원가입 실패:', error);
      throw this.getFirebaseErrorMessage(error);
    }
  }

  // 이메일/비밀번호 로그인
  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      console.log('📧 이메일 로그인 시도:', email);

      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password,
      );

      const user: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        isAnonymous: false,
      };

      console.log('✅ 이메일 로그인 성공');
      return user;
    } catch (error: any) {
      console.error('❌ 이메일 로그인 실패:', error);
      throw this.getFirebaseErrorMessage(error);
    }
  }

  // 구글 로그인
  async signInWithGoogle(): Promise<User> {
    try {
      console.log('🔍 Google 로그인 시도');

      // Google Sign-In 체크
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Google 로그인 수행
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        throw new Error('Google 로그인에서 토큰을 받지 못했습니다.');
      }

      // Firebase 인증 자격 증명 생성
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Firebase로 로그인
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );

      const user: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        isAnonymous: false,
      };

      console.log('✅ Google 로그인 성공');
      return user;
    } catch (error: any) {
      console.error('❌ Google 로그인 실패:', error);
      throw this.getFirebaseErrorMessage(error);
    }
  }

  // 익명 로그인
  async signInAnonymously(): Promise<User> {
    try {
      console.log('👤 익명 로그인 시도');

      const userCredential = await auth().signInAnonymously();

      const user: User = {
        uid: userCredential.user.uid,
        email: null,
        displayName: '익명 사용자',
        photoURL: null,
        isAnonymous: true,
      };

      console.log('✅ 익명 로그인 성공');
      return user;
    } catch (error: any) {
      console.error('❌ 익명 로그인 실패:', error);
      throw this.getFirebaseErrorMessage(error);
    }
  }

  // 로그아웃
  async signOut(): Promise<void> {
    try {
      console.log('🚪 로그아웃 시도');

      // Google Sign-In 로그아웃
      try {
        await GoogleSignin.signOut();
      } catch (error) {
        // Google Sign-In이 없는 경우 무시
        console.log('Google Sign-In 로그아웃 스킵');
      }

      // Firebase 로그아웃
      await auth().signOut();

      console.log('✅ 로그아웃 성공');
    } catch (error: any) {
      console.error('❌ 로그아웃 실패:', error);
      throw error;
    }
  }

  // 비밀번호 재설정 이메일 전송
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      console.log('📧 비밀번호 재설정 이메일 전송:', email);

      await auth().sendPasswordResetEmail(email);

      console.log('✅ 비밀번호 재설정 이메일 전송 성공');
    } catch (error: any) {
      console.error('❌ 비밀번호 재설정 이메일 전송 실패:', error);
      throw this.getFirebaseErrorMessage(error);
    }
  }

  // 사용자 계정 삭제
  async deleteAccount(): Promise<void> {
    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error('로그인된 사용자가 없습니다.');
      }

      console.log('🗑️ 계정 삭제 시도');

      await user.delete();

      console.log('✅ 계정 삭제 성공');
    } catch (error: any) {
      console.error('❌ 계정 삭제 실패:', error);
      throw this.getFirebaseErrorMessage(error);
    }
  }

  // Firebase 에러 메시지 변환
  private getFirebaseErrorMessage(error: any): string {
    const errorCode = error.code;

    switch (errorCode) {
      case 'auth/user-not-found':
        return '등록되지 않은 이메일입니다.';
      case 'auth/wrong-password':
        return '비밀번호가 잘못되었습니다.';
      case 'auth/email-already-in-use':
        return '이미 사용 중인 이메일입니다.';
      case 'auth/weak-password':
        return '비밀번호가 너무 약합니다. 6자 이상 입력해주세요.';
      case 'auth/invalid-email':
        return '잘못된 이메일 형식입니다.';
      case 'auth/user-disabled':
        return '비활성화된 계정입니다.';
      case 'auth/too-many-requests':
        return '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.';
      case 'auth/network-request-failed':
        return '네트워크 연결을 확인해주세요.';
      default:
        return error.message || '인증 과정에서 오류가 발생했습니다.';
    }
  }
}

// 싱글톤 인스턴스 생성
const authService = new AuthService();
export default authService;
