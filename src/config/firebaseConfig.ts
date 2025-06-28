import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

// ✅ Firebase 설정은 android/ios 설정 파일을 통해 초기화됨
// ✅ Google Sign-In 웹 클라이언트 ID 설정 완료

// Google Sign-In 구성
GoogleSignin.configure({
  // ✅ 실제 웹 클라이언트 ID 설정됨 (Firebase Console에서 가져옴)
  webClientId:
    '179993011809-gkqofk3jmifoub8vte855e6d7be55vk6.apps.googleusercontent.com',
});

// ✅ 구글 로그인 설정 완료!
// 📱 Android SHA-1 키 등록됨
// 🔑 웹 클라이언트 ID 설정됨
// 🔥 Firebase 구글 로그인 활성화됨

export default auth;
