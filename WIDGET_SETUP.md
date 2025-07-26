# 🌟 미래일기 위젯 설정 가이드

## 📱 기능 소개

미래일기 앱에 홈화면 위젯이 추가되었습니다!

### ✨ 위젯 기능

- **오늘 일어날 일**: 오늘 예정된 일정 최대 2개 표시
- **미래 일기 개수**: 앞으로 계획된 일기 개수
- **실행 상태**: 완료된 일정 체크 표시 (✅/⏳)
- **테마 연동**: 앱과 동일한 테마 색상 적용
- **빠른 접근**: 위젯 터치로 앱 바로 실행

---

## 🍎 iOS 위젯 설정

### 1. Xcode에서 Widget Extension 추가

1. **Xcode 프로젝트 열기**

   ```bash
   open ios/FutureDiary.xcworkspace
   ```

2. **Widget Extension Target 추가**

   - File → New → Target... 선택
   - "Widget Extension" 선택
   - Product Name: `FutureDiaryWidget`
   - Bundle Identifier: `com.futurediary.FutureDiaryWidget`
   - "Include Configuration Intent" 체크 해제

3. **App Groups 설정**

   - 메인 앱 Target 선택 → Signing & Capabilities
   - "+ Capability" → "App Groups" 추가
   - Group ID: `group.com.futurediary.shared`
   - Widget Extension Target에도 동일하게 추가

4. **생성된 파일 교체**
   - 생성된 `FutureDiaryWidget.swift` 파일 내용을 다음으로 교체:
   ```
   ios/FutureDiaryWidget/FutureDiaryWidgetExtension.swift
   ```

### 2. 홈화면에 위젯 추가

1. iOS 홈화면에서 빈 공간 길게 누르기
2. 좌측 상단 "+" 버튼 터치
3. "미래일기" 검색 후 선택
4. 원하는 크기 선택 (Small/Medium)
5. "위젯 추가" 터치

---

## 🤖 Android 위젯 설정

### 1. 코드가 이미 포함됨

Android 위젯 관련 코드는 이미 모두 포함되어 있습니다:

- ✅ `WidgetModule.kt` - React Native 브리지
- ✅ `FutureDiaryAppWidget.kt` - 위젯 구현
- ✅ `widget_future_diary.xml` - 위젯 레이아웃
- ✅ `AndroidManifest.xml` - 위젯 등록

### 2. 홈화면에 위젯 추가

1. Android 홈화면에서 빈 공간 길게 누르기
2. "위젯" 선택
3. "위시어리" 앱 찾기
4. "미래일기" 위젯을 홈화면으로 드래그

---

## 🔄 위젯 업데이트 시점

위젯은 다음 상황에서 자동으로 업데이트됩니다:

- ✏️ 새 일기 작성 시
- 🗑️ 일기 삭제 시
- ✅ 오늘 일정 완료 표시 시
- 🎨 테마 변경 시
- 📱 앱 실행 시

### 수동 새로고침

- **iOS**: 위젯을 길게 누르고 "위젯 새로고침"
- **Android**: 위젯이 15분마다 자동 새로고침

---

## 🎨 위젯 디자인

### 표시 정보

```
┌─────────────────────────────┐
│ 🌟 미래일기           [3]   │ ← 제목 / 미래 일기 개수
│                     Future  │
├─────────────────────────────┤
│ ☀️ 오늘 일어날 일           │ ← 오늘 섹션
│                             │
│ 😊 특별한 하루           ✅  │ ← 일정 1
│ 📝 프레젠테이션          ⏳  │ ← 일정 2
├─────────────────────────────┤
│ 전체 15개              14:30│ ← 총 개수 / 업데이트 시간
└─────────────────────────────┘
```

### 테마 연동

- 위젯 색상이 앱 테마에 따라 자동 변경
- 천사, 은하수, 로즈골드, 달빛 테마 등 모두 지원

---

## 🛠️ 빌드 명령어

### iOS 빌드

```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

### Android 빌드

```bash
npx react-native run-android
```

---

## 🐛 문제 해결

### iOS Widget이 나타나지 않을 때

1. App Groups 설정 확인
2. Bundle Identifier 일치 확인
3. 디바이스 재부팅

### Android Widget이 업데이트되지 않을 때

1. 앱 완전 종료 후 재시작
2. 위젯 제거 후 다시 추가
3. 기기 재부팅

### 공통 문제

- 위젯 데이터가 비어있으면 "앱을 열어 일기를 작성해보세요" 메시지 표시
- 앱을 한 번 실행하면 위젯 데이터가 동기화됨

---

## 💡 사용 팁

1. **위젯 크기**: Medium 크기에서 더 많은 정보 확인 가능
2. **실시간 동기화**: 앱에서 일기 수정 시 위젯도 즉시 업데이트
3. **빠른 접근**: 위젯 터치로 앱 바로 실행
4. **테마 활용**: 다양한 테마로 위젯 스타일 변경 가능

---

## 📞 지원

위젯 관련 문제가 있으시면:

1. 앱 설정 → 고객센터
2. 개발자 이메일 문의
3. 앱 리뷰에 문제 상황 작성

**즐거운 미래일기 위젯 사용되세요! 🌟**
