import { getApps } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Firebase 앱이 이미 초기화되었는지 확인
const initializeFirebase = () => {
  try {
    const apps = getApps();
    if (apps.length === 0) {
      console.log('🔥 Firebase 초기화 시작...');
      // Firebase가 자동으로 google-services.json에서 설정을 읽어옵니다
      // React Native Firebase는 자동 초기화를 지원합니다
      console.log('🔥 Firebase 자동 초기화 완료');
    } else {
      console.log('🔥 Firebase가 이미 초기화되어 있습니다.');
      console.log(`🔥 등록된 앱 수: ${apps.length}`);
    }
  } catch (error) {
    console.error('❌ Firebase 초기화 실패:', error);
    console.error(
      '💡 google-services.json 파일이 올바른 위치(android/app/)에 있는지 확인하세요',
    );
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
