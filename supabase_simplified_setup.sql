-- 🔧 FutureDiary Supabase 테이블 생성 스크립트
-- 이 스크립트를 Supabase Dashboard의 SQL Editor에서 실행하세요

-- 1️⃣ 기존 테이블 삭제 (만약 있다면)
DROP TABLE IF EXISTS diary_entries CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- 2️⃣ 사용자 프로필 테이블 생성
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

-- 3️⃣ 일기 테이블 생성
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

-- 4️⃣ RLS (보안) 활성화
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

-- 5️⃣ 보안 정책 생성 (사용자는 자신의 데이터만 접근)
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own entries" ON diary_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries" ON diary_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries" ON diary_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries" ON diary_entries
  FOR DELETE USING (auth.uid() = user_id);

-- 6️⃣ 인덱스 생성 (성능 향상)
CREATE INDEX idx_diary_entries_user_id ON diary_entries(user_id);
CREATE INDEX idx_diary_entries_date ON diary_entries(date);

-- 7️⃣ 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diary_entries_updated_at 
  BEFORE UPDATE ON diary_entries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ✅ 완료 메시지
SELECT '🎉 FutureDiary 데이터베이스 테이블 생성 완료!' as message;
SELECT '📱 이제 앱에서 일기 저장/로딩이 정상 작동합니다!' as next_step; 