import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase 프로젝트 URL과 anon key
// 실제 프로덕션 환경에서는 환경변수를 사용하는 것이 좋습니다
const SUPABASE_URL = 'https://yzxktziagsqfoljzsock.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6eGt0emlhZ3NxZm9sanpzb2NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4Mzg4NTIsImV4cCI6MjA2OTQxNDg1Mn0.a15fmXNtqmAIi1jmFftB_ARaFOH7cyWBMwpXMbuqxJI';

// Supabase 클라이언트 생성 (React Native용 설정)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Supabase 연결 상태 확인
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Supabase 연결 실패:', error);
      return false;
    }

    console.log('✅ Supabase 연결 성공');
    return true;
  } catch (error) {
    console.error('❌ Supabase 연결 확인 실패:', error);
    return false;
  }
};

export default supabase;
