# 🚀 Firebase에서 Supabase로 마이그레이션 가이드

Future Diary 앱을 Firebase에서 Supabase로 성공적으로 전환하기 위한 단계별 가이드입니다.

## 📋 목차

1. [사전 준비](#사전-준비)
2. [Supabase 프로젝트 설정](#supabase-프로젝트-설정)
3. [데이터베이스 스키마 생성](#데이터베이스-스키마-생성)
4. [앱 설정 업데이트](#앱-설정-업데이트)
5. [데이터 마이그레이션](#데이터-마이그레이션)
6. [테스트 및 검증](#테스트-및-검증)
7. [배포 및 모니터링](#배포-및-모니터링)

## 🛠 사전 준비

### 1. 필요한 정보 수집

- Firebase 프로젝트의 기존 데이터 구조 확인
- 사용자 인증 방식 (이메일/비밀번호, Google, 익명)
- 기존 데이터 양과 구조 파악

### 2. 백업 생성

```bash
# Firebase 데이터 내보내기 (Firebase Console에서 수행)
# Firestore → 데이터 → 내보내기/가져오기
```

## 🌐 Supabase 프로젝트 설정

### 1. Supabase 계정 생성 및 프로젝트 생성

1. [supabase.com](https://supabase.com)에서 계정 생성
2. 새 프로젝트 생성
3. 프로젝트 URL과 API 키 확인

### 2. 환경 설정

```typescript
// src/services/SupabaseConfig.ts 파일 업데이트
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

## 🗄 데이터베이스 스키마 생성

### 1. SQL 스크립트 실행

Supabase Dashboard → SQL Editor에서 `supabase_setup.sql` 파일의 내용을 실행합니다.

### 2. 테이블 구조 확인

- `user_profiles`: 사용자 프로필 정보
- `diary_entries`: 일기 엔트리 데이터

### 3. Row Level Security (RLS) 확인

- 각 사용자는 자신의 데이터만 접근 가능
- 보안 정책이 올바르게 적용되었는지 확인

## 📱 앱 설정 업데이트

### 1. 패키지 설치 확인

```bash
npm install @supabase/supabase-js
```

### 2. Firebase 설정 제거 (선택사항)

```bash
# Firebase 패키지 제거 (완전 전환 후)
npm uninstall @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
```

### 3. 인증 프로바이더 설정

Supabase Dashboard → Authentication → Providers에서:

- Google OAuth 설정 (기존 Firebase Google 설정 복사)
- 이메일/비밀번호 인증 활성화

## 📊 데이터 마이그레이션

### 1. 자동 마이그레이션 (앱 내)

앱에서 기존 사용자가 로그인할 때 자동으로 로컬 데이터를 Supabase로 마이그레이션합니다:

```typescript
// LoginScreen에서 자동 실행
await migrateLocalData();
```

### 2. 수동 마이그레이션 (필요시)

```typescript
import { syncToSupabase } from '../utils/storage';

// 로컬 데이터를 Supabase로 동기화
await syncToSupabase();
```

### 3. Firebase에서 Supabase로 직접 마이그레이션

대량의 데이터가 있는 경우:

1. Firebase에서 JSON 형태로 데이터 내보내기
2. 데이터 형식 변환 스크립트 작성
3. Supabase API를 통해 데이터 가져오기

## 🧪 테스트 및 검증

### 1. 기능 테스트

- [x] 이메일/비밀번호 회원가입
- [x] 이메일/비밀번호 로그인
- [x] Google 로그인
- [x] 익명 로그인
- [x] 일기 작성/수정/삭제
- [x] 일기 검색
- [x] 테마 구매/적용
- [x] 로그아웃

### 2. 데이터 무결성 확인

- 기존 데이터가 정확히 마이그레이션되었는지 확인
- 사용자별 데이터 분리가 올바른지 확인
- 이미지 및 첨부파일이 정상적으로 표시되는지 확인

### 3. 성능 테스트

- 로딩 속도 비교 (Firebase vs Supabase)
- 실시간 동기화 테스트
- 대량 데이터 처리 테스트

## 🚀 배포 및 모니터링

### 1. 단계적 배포

1. **베타 테스트**: 소수 사용자에게 Supabase 버전 제공
2. **A/B 테스트**: Firebase와 Supabase 버전 동시 운영
3. **전체 마이그레이션**: 모든 사용자를 Supabase로 전환

### 2. 모니터링 설정

- Supabase Dashboard에서 성능 모니터링
- 오류 로그 모니터링
- 사용자 피드백 수집

### 3. 백업 및 복구 계획

- 정기적인 데이터 백업 설정
- 장애 상황 시 복구 계획 수립

## 🔧 문제 해결

### 자주 발생하는 문제들

#### 1. 인증 문제

```typescript
// Google 로그인이 안되는 경우
// Supabase에서 Google OAuth 설정 확인
// 리다이렉트 URL 설정: com.futurediary://auth
```

#### 2. 데이터 접근 권한 오류

```sql
-- RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'diary_entries';
```

#### 3. 실시간 동기화 문제

```typescript
// 실시간 구독 재시작
const subscription = supabase
  .channel('diary_entries')
  .on('postgres_changes', ...)
  .subscribe();
```

## 📈 마이그레이션 후 최적화

### 1. 성능 최적화

- 자주 사용하는 쿼리에 인덱스 추가
- 이미지 최적화 및 CDN 사용
- 캐싱 전략 구현

### 2. 보안 강화

- API 키 로테이션
- RLS 정책 세밀화
- 감사 로그 설정

### 3. 비용 최적화

- 사용량 모니터링
- 불필요한 요청 최소화
- 데이터 아카이빙 전략

## ✅ 마이그레이션 체크리스트

- [ ] Supabase 프로젝트 생성 완료
- [ ] 데이터베이스 스키마 생성 완료
- [ ] 앱 설정 업데이트 완료
- [ ] 인증 프로바이더 설정 완료
- [ ] 데이터 마이그레이션 테스트 완료
- [ ] 모든 기능 테스트 통과
- [ ] 성능 테스트 완료
- [ ] 보안 검토 완료
- [ ] 백업 및 모니터링 설정 완료
- [ ] 배포 계획 수립 완료

## 📞 지원 및 도움

### Supabase 커뮤니티

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

### 추가 리소스

- [React Native Supabase 튜토리얼](https://supabase.com/docs/guides/getting-started/tutorials/with-react-native)
- [Supabase Auth 가이드](https://supabase.com/docs/guides/auth)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)

---

**성공적인 마이그레이션을 위해 각 단계를 차근차근 진행해 주세요! 🎉**
