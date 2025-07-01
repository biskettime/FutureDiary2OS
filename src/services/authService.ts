export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

class AuthService {
  // 현재 사용자 가져오기
  getCurrentUser(): User | null {
    return null;
  }

  // 이메일로 회원가입
  async signUpWithEmail(
    _email: string,
    _password: string,
  ): Promise<User | null> {
    console.log('Firebase가 제거되어 인증 기능을 사용할 수 없습니다.');
    return null;
  }

  // 이메일로 로그인
  async signInWithEmail(
    _email: string,
    _password: string,
  ): Promise<User | null> {
    console.log('Firebase가 제거되어 인증 기능을 사용할 수 없습니다.');
    return null;
  }

  // 구글로 로그인
  async signInWithGoogle(): Promise<User | null> {
    console.log('Firebase가 제거되어 인증 기능을 사용할 수 없습니다.');
    return null;
  }

  // 로그아웃
  async signOut(): Promise<void> {
    console.log('Firebase가 제거되어 인증 기능을 사용할 수 없습니다.');
  }

  // 비밀번호 재설정
  async resetPassword(_email: string): Promise<boolean> {
    console.log('Firebase가 제거되어 인증 기능을 사용할 수 없습니다.');
    return false;
  }

  // 인증 상태 변화 리스너
  onAuthStateChanged(callback: (user: User | null) => void) {
    // 항상 null을 반환하는 함수
    callback(null);
    // unsubscribe 함수 반환
    return () => {};
  }
}

const authService = new AuthService();
export default authService;
