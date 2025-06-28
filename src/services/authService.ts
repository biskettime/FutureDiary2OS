// 🔧 Firebase 모듈을 안전하게 import 하기 위한 조건부 로딩
let auth: any = null;
let GoogleSignin: any = null;
let statusCodes: any = null;

try {
  auth = require('@react-native-firebase/auth').default;
  const googleSigninModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleSigninModule.GoogleSignin;
  statusCodes = googleSigninModule.statusCodes;
  console.log('✅ Firebase 모듈 로딩 성공');
} catch (error) {
  console.log('⚠️ Firebase 모듈 로딩 실패 - 오프라인 모드로 실행:', error);
}

import {Alert} from 'react-native';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

class AuthService {
  private isFirebaseAvailable = false;

  constructor() {
    this.isFirebaseAvailable = auth !== null && GoogleSignin !== null;
    if (this.isFirebaseAvailable) {
      // 🔧 Google Sign-In 초기화 수정
      this.initializeGoogleSignIn();
    } else {
      console.log('🚫 Firebase 사용 불가 - 기본 모드로 실행');
    }
  }

  // Firebase 사용 가능 여부 확인
  isAvailable(): boolean {
    return this.isFirebaseAvailable;
  }

  // 🔧 Google Sign-In 초기화 메서드 추가
  private async initializeGoogleSignIn() {
    try {
      await GoogleSignin.configure({
        webClientId:
          '179993011809-gkqofk3jmifoub8vte855e6d7be55vk6.apps.googleusercontent.com',
        offlineAccess: true, // 🔧 오프라인 접근 활성화
        hostedDomain: '', // 🔧 호스팅 도메인 설정
        forceCodeForRefreshToken: true, // 🔧 리프레시 토큰 강제 요청
      });
      console.log('✅ Google Sign-In 초기화 성공');
    } catch (error) {
      console.error('❌ Google Sign-In 초기화 실패:', error);
    }
  }

  // 현재 사용자 가져오기
  getCurrentUser(): User | null {
    if (!this.isFirebaseAvailable || !auth) {
      return null;
    }

    try {
      const firebaseUser = auth().currentUser;
      if (!firebaseUser) return null;

      return this.convertFirebaseUser(firebaseUser);
    } catch (error) {
      console.log('getCurrentUser 에러:', error);
      return null;
    }
  }

  // Firebase User를 앱 User 형식으로 변환
  private convertFirebaseUser(firebaseUser: any): User {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
    };
  }

  // 이메일로 회원가입
  async signUpWithEmail(email: string, password: string): Promise<User | null> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      const user = userCredential.user;

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      };
    } catch (error: any) {
      console.error('Email signup error:', error);
      this.handleAuthError(error);
      return null;
    }
  }

  // 이메일로 로그인
  async signInWithEmail(email: string, password: string): Promise<User | null> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password,
      );
      const user = userCredential.user;

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      };
    } catch (error: any) {
      console.error('Email signin error:', error);
      this.handleAuthError(error);
      return null;
    }
  }

  // 구글로 로그인
  async signInWithGoogle(): Promise<User | null> {
    try {
      console.log('🔍 Google 로그인 시작...');

      // 🔧 Google Play Services 확인
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      console.log('✅ Google Play Services 확인 완료');

      // 🔧 기존 로그인 상태 확인 및 로그아웃
      try {
        const currentUser = await GoogleSignin.getCurrentUser();
        if (currentUser) {
          console.log('🔄 기존 Google 계정 로그아웃...');
          await GoogleSignin.signOut();
        }
      } catch (error) {
        console.log('🔄 이전 로그인 상태 없음');
      }

      // 🔧 Google 계정 선택
      console.log('👤 Google 계정 선택 화면 표시...');
      const userInfo = await GoogleSignin.signIn();
      console.log('✅ Google 계정 선택 완료:', userInfo);

      // 🔧 ID 토큰 확인
      if (!userInfo.data?.idToken) {
        throw new Error(
          'ID 토큰을 받지 못했습니다. userInfo 구조를 확인하세요.',
        );
      }

      console.log('🔑 ID 토큰 획득 성공');

      // Firebase 인증
      const googleCredential = auth.GoogleAuthProvider.credential(
        userInfo.data.idToken,
      );
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );

      console.log('🎉 Firebase Google 로그인 성공:', userCredential.user.email);
      return userCredential.user;
    } catch (error: any) {
      console.error('❌ Google 로그인 상세 에러:', error);

      // 🔧 더 상세한 에러 처리
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('로그인이 취소되었습니다.');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('로그인이 이미 진행 중입니다.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services를 사용할 수 없습니다.');
      } else {
        console.error('🔍 에러 코드:', error.code);
        console.error('🔍 에러 메시지:', error.message);
        console.error('🔍 전체 에러 객체:', JSON.stringify(error, null, 2));
        throw new Error(`Google 로그인 실패: ${error.message}`);
      }
    }
  }

  // 로그아웃
  async signOut(): Promise<void> {
    try {
      // Google 로그아웃
      try {
        await GoogleSignin.signOut();
      } catch (googleError) {
        // Google 로그아웃 실패는 무시 (이미 로그아웃된 상태일 수 있음)
        console.log('Google signout error (ignored):', googleError);
      }

      // Firebase 로그아웃
      await auth().signOut();
    } catch (error: any) {
      console.error('Signout error:', error);
      Alert.alert('로그아웃 오류', '로그아웃 중 문제가 발생했습니다.');
    }
  }

  // 비밀번호 재설정
  async resetPassword(email: string): Promise<boolean> {
    try {
      await auth().sendPasswordResetEmail(email);
      return true;
    } catch (error: any) {
      console.error('Password reset error:', error);
      this.handleAuthError(error);
      return false;
    }
  }

  // 인증 상태 변화 리스너
  onAuthStateChanged(callback: (user: User | null) => void) {
    if (!this.isFirebaseAvailable || !auth) {
      // Firebase 사용 불가 시 즉시 null 콜백 호출
      callback(null);
      return () => {}; // 빈 unsubscribe 함수 반환
    }

    try {
      return auth().onAuthStateChanged((firebaseUser: any) => {
        if (firebaseUser) {
          const user: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          };
          callback(user);
        } else {
          callback(null);
        }
      });
    } catch (error) {
      console.log('onAuthStateChanged 에러:', error);
      callback(null);
      return () => {};
    }
  }

  // 에러 처리
  private handleAuthError(error: any) {
    let message = '알 수 없는 오류가 발생했습니다.';

    switch (error.code) {
      case 'auth/email-already-in-use':
        message = '이미 사용 중인 이메일입니다.';
        break;
      case 'auth/weak-password':
        message = '비밀번호가 너무 약합니다.';
        break;
      case 'auth/invalid-email':
        message = '유효하지 않은 이메일 형식입니다.';
        break;
      case 'auth/user-not-found':
        message = '해당 이메일로 등록된 계정이 없습니다.';
        break;
      case 'auth/wrong-password':
        message = '비밀번호가 올바르지 않습니다.';
        break;
      case 'auth/user-disabled':
        message = '비활성화된 계정입니다.';
        break;
      case 'auth/too-many-requests':
        message = '너무 많은 시도로 일시적으로 차단되었습니다.';
        break;
      case 'auth/network-request-failed':
        message = '네트워크 연결을 확인해주세요.';
        break;
    }

    Alert.alert('인증 오류', message);
  }
}

export default new AuthService();
