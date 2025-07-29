import { getApps } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Firebase 앱이 이미 초기화되었는지 확인
const initializeFirebase = () => {
  if (getApps().length === 0) {
    // Firebase 앱이 초기화되지 않은 경우에만 초기화
    console.log('🔥 Firebase 초기화 중...');
  } else {
    console.log('🔥 Firebase가 이미 초기화되어 있습니다.');
  }
};

// Firebase 초기화 실행
initializeFirebase();

// Firebase 서비스들 export
export { auth, firestore };

// Firebase 연결 상태 확인
export const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    await firestore().settings({
      persistence: true, // 오프라인 지원
    });
    console.log('✅ Firebase Firestore 연결 성공');
    return true;
  } catch (error) {
    console.error('❌ Firebase Firestore 연결 실패:', error);
    return false;
  }
};

export default { auth, firestore, checkFirebaseConnection };
