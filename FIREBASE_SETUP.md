# 🔥 Firebase 설정 가이드

미래일기 앱에서 Firebase Authentication과 Firestore Database를 사용하기 위한 설정 가이드입니다.

## 📋 목차

1. [Firebase 프로젝트 생성](#firebase-프로젝트-생성)
2. [Android 설정](#android-설정)
3. [iOS 설정](#ios-설정)
4. [인증 설정](#인증-설정)
5. [Firestore Database 설정](#firestore-database-설정)
6. [테스트](#테스트)

## 🚀 Firebase 프로젝트 생성

### 1. Firebase 콘솔 접속

- [Firebase Console](https://console.firebase.google.com/) 이동
- "프로젝트 추가" 클릭

### 2. 프로젝트 설정

- **프로젝트 이름**: `futurediary-app` (또는 원하는 이름)
- **Google 애널리틱스**: 선택사항 (권장: 사용)
- 프로젝트 생성 완료

## 📱 Android 설정

### 1. Android 앱 추가

1. Firebase 콘솔에서 "Android 아이콘" 클릭
2. **Android 패키지 이름**: `com.futurediary`
   (또는 `android/app/src/main/AndroidManifest.xml`에서 확인)
3. **앱 닉네임**: `Future Diary` (선택사항)
4. **SHA-1 인증서**: 나중에 추가 가능

### 2. google-services.json 다운로드

1. `google-services.json` 파일 다운로드
2. **중요**: 파일을 `android/app/` 폴더에 복사

```bash
# 예시 경로
FutureDiary/
├── android/
│   ├── app/
│   │   ├── google-services.json  ← 여기에 복사
│   │   └── ...
```

### 3. Android 설정 확인

- `android/app/build.gradle`: Firebase 플러그인이 이미 적용됨
- `android/build.gradle`: Firebase 플러그인이 이미 적용됨

## 🍎 iOS 설정

### 1. iOS 앱 추가

1. Firebase 콘솔에서 "iOS 아이콘" 클릭
2. **iOS 번들 ID**: `org.reactjs.native.example.FutureDiary`
   (또는 `ios/FutureDiary/Info.plist`에서 확인)
3. **앱 닉네임**: `Future Diary` (선택사항)

### 2. GoogleService-Info.plist 다운로드

1. `GoogleService-Info.plist` 파일 다운로드
2. **중요**: 파일을 `ios/FutureDiary/` 폴더에 복사
3. Xcode에서 파일을 프로젝트에 추가

```bash
# 예시 경로
FutureDiary/
├── ios/
│   ├── FutureDiary/
│   │   ├── GoogleService-Info.plist  ← 여기에 복사
│   │   └── ...
```

### 3. iOS 설정 (현재 CocoaPods 문제로 보류)

현재 Xcode 16.4와 CocoaPods 호환성 문제로 iOS 설정이 지연되었습니다.
Android에서 먼저 테스트하시길 권장합니다.

## 🔐 인증 설정

### 1. Authentication 활성화

1. Firebase 콘솔 → "Authentication" 메뉴
2. "시작하기" 클릭
3. "Sign-in method" 탭 이동

### 2. 로그인 제공업체 설정

#### 이메일/비밀번호

1. "이메일/비밀번호" 클릭
2. "사용 설정" 토글 ON
3. "저장" 클릭

#### Google 로그인

1. "Google" 클릭
2. "사용 설정" 토글 ON
3. **프로젝트 지원 이메일** 설정
4. "저장" 클릭

#### 익명 인증

1. "익명" 클릭
2. "사용 설정" 토글 ON
3. "저장" 클릭

### 3. Google Sign-In 추가 설정

#### Android

- SHA-1 인증서를 Firebase 콘솔에 추가 (릴리스 빌드 시 필요)

#### iOS

- URL Scheme을 Info.plist에 추가 (현재 보류)

## 🗄️ Firestore Database 설정

### 1. Firestore 생성

1. Firebase 콘솔 → "Firestore Database" 메뉴
2. "데이터베이스 만들기" 클릭
3. **보안 규칙**: "테스트 모드에서 시작" 선택
4. **위치**: `asia-northeast3 (서울)` 또는 가까운 지역 선택

### 2. 보안 규칙 적용

1. "규칙" 탭 이동
2. 아래 규칙 복사하여 붙여넣기:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자는 자신의 일기만 읽고 쓸 수 있음
    match /users/{userId}/entries/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 사용자 프로필 정보
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. "게시" 클릭

### 3. 인덱스 생성

Firestore → "인덱스" 탭에서 다음 복합 인덱스 생성:

1. **첫 번째 인덱스**:

   - 컬렉션 ID: `entries`
   - 필드: `userId` (오름차순), `date` (내림차순)

2. **두 번째 인덱스**:
   - 컬렉션 ID: `entries`
   - 필드: `userId` (오름차순), `createdAt` (내림차순)

## 🧪 테스트

### 1. Android 테스트

```bash
# Metro 시작
npm start

# Android 빌드 및 실행
npm run android
```

### 2. Firebase 연결 확인

앱 실행 후 콘솔에서 다음 로그 확인:

```
🔥 Firebase 초기화 중...
✅ Firebase Firestore 연결 성공
```

### 3. 로그인 테스트

1. **익명 로그인** 먼저 테스트
2. **이메일 회원가입/로그인** 테스트
3. **Google 로그인** 테스트 (설정 완료 후)

### 4. 데이터 동기화 테스트

1. 일기 작성
2. Firebase 콘솔에서 데이터 확인
3. 다른 기기에서 로그인하여 동기화 확인

## 🚨 문제 해결

### Android 문제

1. **google-services.json 누락**

   - 파일이 `android/app/` 폴더에 있는지 확인
   - 파일명이 정확한지 확인

2. **네트워크 오류**
   - 인터넷 연결 확인
   - 에뮬레이터/기기 시간 설정 확인

### iOS 문제 (현재 보류)

- Xcode 16.4 호환성 문제로 인해 iOS 설정 보류
- Android에서 먼저 테스트 권장

## 📝 참고사항

### 현재 구현된 기능

✅ Firebase Authentication (이메일, Google, 익명)  
✅ Firestore Database  
✅ 실시간 동기화  
✅ 오프라인 지원  
✅ 로컬 백업  
✅ 자동 마이그레이션

### 보안 설정

- 사용자별 데이터 격리
- 인증된 사용자만 접근 가능
- 클라이언트 측 유효성 검사

### 성능 최적화

- 로컬 캐싱
- 배치 작업
- 실시간 리스너

## 🎉 완료!

Firebase 설정이 완료되면:

1. 로그인하여 Firebase 동기화 테스트
2. 일기 작성/수정/삭제 테스트
3. 여러 기기 간 동기화 확인

문제가 발생하면 콘솔 로그를 확인하고 Firebase 설정을 다시 점검해주세요!
