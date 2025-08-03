import AsyncStorage from '@react-native-async-storage/async-storage';
import { DiaryEntry } from '../types';
import supabaseAuthService from '../services/SupabaseAuthService';
import supabaseService from '../services/SupabaseService';

const ENTRIES_KEY = 'diary_entries';
const SYNC_STATUS_KEY = 'supabase_sync_status';

// ID 생성 함수
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Supabase 사용 가능 여부 확인
const isSupabaseAvailable = (): boolean => {
  try {
    const user = supabaseAuthService.getCurrentUser();
    return user !== null;
  } catch (error) {
    console.log('Supabase 사용 불가:', error);
    return false;
  }
};

// 일기 목록 저장 (Supabase + 로컬)
export const saveDiaryEntries = async (
  entries: DiaryEntry[],
): Promise<void> => {
  try {
    // 로컬 스토리지에 저장 (백업 목적)
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
    console.log('✅ 로컬 스토리지 저장 완료:', entries.length, '개');

    // Supabase 사용 가능한 경우 Supabase에도 저장
    if (isSupabaseAvailable()) {
      try {
        await supabaseService.saveDiaryEntries(entries);
        await AsyncStorage.setItem(SYNC_STATUS_KEY, 'synced');
        console.log('✅ Supabase 동기화 완료');
      } catch (supabaseError) {
        console.warn('⚠️ Supabase 저장 실패, 로컬만 저장됨:', supabaseError);
        await AsyncStorage.setItem(SYNC_STATUS_KEY, 'pending');
      }
    } else {
      await AsyncStorage.setItem(SYNC_STATUS_KEY, 'local_only');
      console.log('📱 로컬 전용 모드 - Supabase 비활성화');
    }
  } catch (error) {
    console.error('❌ 일기 저장 실패:', error);
    throw error;
  }
};

// 개별 일기 저장
export const saveDiaryEntry = async (entry: DiaryEntry): Promise<void> => {
  try {
    // 기존 목록 로드
    const entries = await loadDiaryEntries();

    // 기존 항목 업데이트 또는 새 항목 추가
    const existingIndex = entries.findIndex(e => e.id === entry.id);
    if (existingIndex >= 0) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }

    // 날짜순 정렬
    entries.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // 저장
    await saveDiaryEntries(entries);

    // Supabase 개별 저장 시도
    if (isSupabaseAvailable()) {
      try {
        await supabaseService.saveDiaryEntry(entry);
        console.log('✅ Supabase 개별 저장 완료:', entry.title);
      } catch (supabaseError) {
        console.warn('⚠️ Supabase 개별 저장 실패:', supabaseError);
      }
    }
  } catch (error) {
    console.error('❌ 개별 일기 저장 실패:', error);
    throw error;
  }
};

// 일기 목록 로드 (Supabase 우선, 로컬 백업)
export const loadDiaryEntries = async (): Promise<DiaryEntry[]> => {
  try {
    let entries: DiaryEntry[] = [];

    // Supabase 먼저 시도
    if (isSupabaseAvailable()) {
      try {
        console.log('📊 Supabase에서 일기 로딩 시도...');
        entries = await supabaseService.loadDiaryEntries();

        if (entries.length > 0) {
          console.log('✅ Supabase에서 로딩 완료:', entries.length, '개');
          // Supabase 데이터를 로컬에 백업
          await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
          await AsyncStorage.setItem(SYNC_STATUS_KEY, 'synced');
          return entries;
        }
      } catch (supabaseError) {
        console.warn('⚠️ Supabase 로딩 실패, 로컬에서 시도:', supabaseError);
      }
    }

    // Firebase 실패하거나 사용 불가능한 경우 로컬에서 로드
    console.log('📱 로컬 스토리지에서 일기 로딩...');
    const jsonValue = await AsyncStorage.getItem(ENTRIES_KEY);

    if (jsonValue) {
      entries = JSON.parse(jsonValue);
      console.log('✅ 로컬에서 로딩 완료:', entries.length, '개');
      await AsyncStorage.setItem(SYNC_STATUS_KEY, 'local_only');
    } else {
      console.log('📝 저장된 일기가 없습니다');
      entries = [];
    }

    return entries;
  } catch (error) {
    console.error('❌ 일기 로딩 실패:', error);
    return [];
  }
};

// 일기 삭제
export const deleteDiaryEntry = async (entryId: string): Promise<void> => {
  try {
    // 로컬에서 삭제
    const entries = await loadDiaryEntries();
    const filteredEntries = entries.filter(entry => entry.id !== entryId);
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(filteredEntries));
    console.log('✅ 로컬에서 일기 삭제 완료');

    // Supabase에서도 삭제
    if (isSupabaseAvailable()) {
      try {
        await supabaseService.deleteDiaryEntry(entryId);
        console.log('✅ Supabase에서 일기 삭제 완료');
      } catch (supabaseError) {
        console.warn('⚠️ Supabase 삭제 실패:', supabaseError);
      }
    }
  } catch (error) {
    console.error('❌ 일기 삭제 실패:', error);
    throw error;
  }
};

// 일기 검색
export const searchDiaryEntries = async (
  searchTerm: string,
): Promise<DiaryEntry[]> => {
  try {
    // Supabase 검색 우선 시도
    if (isSupabaseAvailable()) {
      try {
        const results = await supabaseService.searchDiaryEntries(searchTerm);
        console.log('✅ Supabase 검색 완료:', results.length, '개 발견');
        return results;
      } catch (supabaseError) {
        console.warn('⚠️ Supabase 검색 실패, 로컬 검색 시도:', supabaseError);
      }
    }

    // 로컬 검색
    console.log('📱 로컬 검색 수행...');
    const entries = await loadDiaryEntries();
    const searchLower = searchTerm.toLowerCase();

    const results = entries.filter(entry => {
      const titleMatch = entry.title.toLowerCase().includes(searchLower);
      const contentMatch = entry.content.toLowerCase().includes(searchLower);
      const tagsMatch = entry.tags?.some(tag => {
        const tagName = typeof tag === 'string' ? tag : tag.name;
        return tagName.toLowerCase().includes(searchLower);
      });

      return titleMatch || contentMatch || tagsMatch;
    });

    console.log('✅ 로컬 검색 완료:', results.length, '개 발견');
    return results;
  } catch (error) {
    console.error('❌ 일기 검색 실패:', error);
    return [];
  }
};

// 동기화 상태 확인
export const getSyncStatus = async (): Promise<
  'synced' | 'pending' | 'local_only' | 'unknown'
> => {
  try {
    const status = await AsyncStorage.getItem(SYNC_STATUS_KEY);
    return (status as any) || 'unknown';
  } catch (error) {
    console.error('❌ 동기화 상태 확인 실패:', error);
    return 'unknown';
  }
};

// 수동 동기화 (로컬 → Supabase)
export const syncToSupabase = async (): Promise<void> => {
  try {
    if (!isSupabaseAvailable()) {
      throw new Error('Supabase에 로그인되어 있지 않습니다.');
    }

    console.log('🔄 Supabase 동기화 시작...');

    // 로컬 데이터 로드
    const localEntries = await loadDiaryEntries();

    if (localEntries.length === 0) {
      console.log('📝 동기화할 로컬 데이터가 없습니다');
      return;
    }

    // Supabase에 마이그레이션
    await supabaseService.migrateLocalDataToSupabase(localEntries);
    await AsyncStorage.setItem(SYNC_STATUS_KEY, 'synced');

    console.log('✅ Supabase 동기화 완료');
  } catch (error) {
    console.error('❌ Supabase 동기화 실패:', error);
    await AsyncStorage.setItem(SYNC_STATUS_KEY, 'pending');
    throw error;
  }
};

// Supabase에서 로컬로 동기화 (수동)
export const syncFromSupabase = async (): Promise<void> => {
  try {
    if (!isSupabaseAvailable()) {
      throw new Error('Supabase에 로그인되어 있지 않습니다.');
    }

    console.log('⬇️ Supabase에서 로컬로 동기화 시작...');

    // Supabase에서 데이터 로드
    const supabaseEntries = await supabaseService.loadDiaryEntries();

    // 로컬에 저장
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(supabaseEntries));
    await AsyncStorage.setItem(SYNC_STATUS_KEY, 'synced');

    console.log(
      '✅ Supabase → 로컬 동기화 완료:',
      supabaseEntries.length,
      '개',
    );
  } catch (error) {
    console.error('❌ Supabase → 로컬 동기화 실패:', error);
    throw error;
  }
};

// 앱 시작 시 자동 동기화 설정
export const setupAutoSync = (): (() => void) | null => {
  try {
    if (!isSupabaseAvailable()) {
      console.log('📱 로컬 전용 모드로 실행');
      return null;
    }

    console.log('🔄 실시간 동기화 설정 중...');

    // Supabase 실시간 리스너 등록
    const unsubscribe = supabaseService.onDiaryEntriesChanged(async entries => {
      try {
        // Supabase 데이터를 로컬에 백업
        await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
        await AsyncStorage.setItem(SYNC_STATUS_KEY, 'synced');
        console.log('📡 실시간 동기화 완료:', entries.length, '개');
      } catch (error) {
        console.error('❌ 실시간 동기화 실패:', error);
      }
    });

    console.log('✅ 실시간 동기화 설정 완료');
    return unsubscribe;
  } catch (error) {
    console.error('❌ 실시간 동기화 설정 실패:', error);
    return null;
  }
};

// 로컬 스토리지 클리어 (디버그용)
export const clearLocalStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ENTRIES_KEY);
    await AsyncStorage.removeItem(SYNC_STATUS_KEY);
    console.log('🗑️ 로컬 스토리지 클리어 완료');
  } catch (error) {
    console.error('❌ 로컬 스토리지 클리어 실패:', error);
    throw error;
  }
};
