-- Supabase 데이터베이스 스키마 설정
-- Future Diary 앱을 위한 테이블 생성

-- 1. 사용자 프로필 테이블
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  photo_url TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  current_theme TEXT DEFAULT 'default',
  purchased_themes TEXT[] DEFAULT ARRAY['default'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 일기 엔트리 테이블
CREATE TABLE diary_entries (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date TEXT NOT NULL,
  mood TEXT,
  emoji TEXT,
  images TEXT[],
  tags JSONB,
  selected_weather TEXT[],
  selected_people TEXT[],
  selected_school TEXT[],
  selected_company TEXT[],
  selected_travel TEXT[],
  selected_food TEXT[],
  selected_dessert TEXT[],
  selected_drink TEXT[],
  actual_result TEXT,
  result_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Row Level Security (RLS) 활성화
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

-- 4. 사용자 프로필 정책
-- 사용자는 자신의 프로필만 읽기/수정 가능
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. 일기 엔트리 정책
-- 사용자는 자신의 일기만 읽기/쓰기/수정/삭제 가능
CREATE POLICY "Users can view own entries" ON diary_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries" ON diary_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries" ON diary_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries" ON diary_entries
  FOR DELETE USING (auth.uid() = user_id);

-- 6. 인덱스 생성 (성능 최적화)
CREATE INDEX idx_diary_entries_user_id ON diary_entries(user_id);
CREATE INDEX idx_diary_entries_date ON diary_entries(date);
CREATE INDEX idx_diary_entries_user_date ON diary_entries(user_id, date);

-- 7. 사용자 삭제 함수 (계정 삭제용)
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 현재 사용자의 모든 데이터 삭제
  DELETE FROM diary_entries WHERE user_id = auth.uid();
  DELETE FROM user_profiles WHERE id = auth.uid();
  
  -- 인증 사용자 삭제 (관리자 권한 필요)
  -- DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- 8. 실시간 구독 활성화
-- Supabase 실시간 기능을 위해 publication 생성
CREATE PUBLICATION supabase_realtime FOR TABLE diary_entries;

-- 9. 트리거 함수 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. 트리거 적용
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diary_entries_updated_at 
  BEFORE UPDATE ON diary_entries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 설정 완료
SELECT 'Supabase 데이터베이스 설정이 완료되었습니다!' as message;