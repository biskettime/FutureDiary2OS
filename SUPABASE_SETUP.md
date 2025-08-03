# Supabase 설정 가이드

## 1. Supabase 대시보드 설정

### 이메일 인증 비활성화 (개발 중)
1. [Supabase Dashboard](https://app.supabase.com) 로그인
2. 프로젝트 선택
3. Authentication > Providers > Email 클릭
4. **"Confirm email" 옵션을 OFF로 설정** (개발 중에만)
5. Save 클릭

### 테이블 생성 (필수)
SQL Editor에서 다음 쿼리 실행:

```sql
-- users_profiles 테이블 생성
CREATE TABLE IF NOT EXISTS public.users_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id)
);

-- diary_entries 테이블 생성
CREATE TABLE IF NOT EXISTS public.diary_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT,
  date DATE NOT NULL,
  mood TEXT,
  weather TEXT,
  images TEXT[],
  is_achieved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE public.users_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

-- users_profiles 정책
CREATE POLICY "Users can view own profile" ON public.users_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.users_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.users_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- diary_entries 정책
CREATE POLICY "Users can view own diary entries" ON public.diary_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own diary entries" ON public.diary_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diary entries" ON public.diary_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diary entries" ON public.diary_entries
  FOR DELETE USING (auth.uid() = user_id);
```

## 2. 테스트 계정 생성

### Supabase 대시보드에서 직접 생성
1. Authentication > Users 메뉴
2. "Add user" > "Create new user" 클릭
3. 다음 정보 입력:
   - Email: `test.user.2024@example.com`
   - Password: `TestPassword123!`
   - Email confirmed: ON (체크)
4. Create user 클릭

## 3. 환경 설정 확인

### Supabase URL과 Anon Key 확인
1. Settings > API 메뉴
2. Project URL 확인 (예: https://yzxktziagsqfoljzsock.supabase.co)
3. Anon/Public Key 확인

## 4. 문제 해결

### 로그인이 안 될 때
1. 이메일 확인 설정이 꺼져 있는지 확인
2. 테이블과 RLS 정책이 올바르게 설정되어 있는지 확인
3. AsyncStorage가 제대로 작동하는지 확인 (앱 재시작 필요할 수 있음)

### 에러 메시지별 해결 방법
- "Email not confirmed": 이메일 확인 설정 비활성화 또는 대시보드에서 직접 계정 생성
- "Invalid login credentials": 이메일/비밀번호 확인
- "Network error": 인터넷 연결 및 Supabase URL 확인

## 5. Google OAuth 설정 (선택사항 - 웹뷰 필요)
React Native에서 Google OAuth를 사용하려면 추가 설정이 필요합니다:
1. react-native-inappbrowser-reborn 설치 필요
2. Deep linking 설정 필요
3. Supabase Dashboard에서 Google OAuth 설정

현재는 이메일/비밀번호 로그인만 지원합니다.