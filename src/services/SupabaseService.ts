import { supabase } from './SupabaseConfig';
import { DiaryEntry } from '../types';
import supabaseAuthService, { User } from './SupabaseAuthService';

class SupabaseService {
  constructor() {
    console.log('📊 SupabaseService 초기화됨');
  }

  // 현재 사용자 확인 (Supabase 세션에서 직접 가져오기)
  private async getCurrentUserId(): Promise<string> {
    try {
      // Supabase 세션에서 직접 사용자 ID 가져오기
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error('❌ Supabase 사용자 조회 에러:', error);
        throw new Error('인증 정보를 확인할 수 없습니다.');
      }

      if (!user) {
        // AuthService에서도 확인
        const authUser = supabaseAuthService.getCurrentUser();
        if (!authUser) {
          console.error('❌ 사용자가 로그인되지 않음');
          throw new Error('로그인이 필요합니다.');
        }
        console.log('✅ AuthService 사용자 ID:', authUser.uid);
        return authUser.uid;
      }

      console.log('✅ Supabase 사용자 ID:', user.id);
      return user.id;
    } catch (error) {
      console.error('❌ 사용자 ID 가져오기 실패:', error);
      throw error;
    }
  }

  // DiaryEntry를 Supabase용 데이터로 변환
  private convertToSupabaseEntry(entry: DiaryEntry): any {
    const {
      createdAt,
      updatedAt,
      selectedWeather,
      selectedPeople,
      selectedSchool,
      selectedCompany,
      selectedTravel,
      selectedFood,
      selectedDessert,
      selectedDrink,
      actualResult,
      resultStatus,
      ...otherFields
    } = entry;

    return {
      ...otherFields,
      // 카멜케이스 → 스네이크케이스 변환
      created_at: createdAt,
      updated_at: updatedAt || new Date().toISOString(),
      // 배열 필드들을 Supabase 스네이크케이스로 변환
      selected_weather: selectedWeather || [],
      selected_people: selectedPeople || [],
      selected_school: selectedSchool || [],
      selected_company: selectedCompany || [],
      selected_travel: selectedTravel || [],
      selected_food: selectedFood || [],
      selected_dessert: selectedDessert || [],
      selected_drink: selectedDrink || [],
      actual_result: actualResult,
      result_status: resultStatus,
    };
  }

  // Supabase 데이터를 DiaryEntry로 변환
  private convertFromSupabaseEntry(item: any): DiaryEntry {
    const {
      user_id,
      created_at,
      updated_at,
      selected_weather,
      selected_people,
      selected_school,
      selected_company,
      selected_travel,
      selected_food,
      selected_dessert,
      selected_drink,
      actual_result,
      result_status,
      ...otherFields
    } = item;

    return {
      ...otherFields,
      // 스네이크케이스 → 카멜케이스 변환
      createdAt: created_at,
      updatedAt: updated_at,
      // 배열 필드들을 camelCase로 변환
      selectedWeather: selected_weather || [],
      selectedPeople: selected_people || [],
      selectedSchool: selected_school || [],
      selectedCompany: selected_company || [],
      selectedTravel: selected_travel || [],
      selectedFood: selected_food || [],
      selectedDessert: selected_dessert || [],
      selectedDrink: selected_drink || [],
      actualResult: actual_result,
      resultStatus: result_status,
    } as DiaryEntry;
  }

  // 일기 저장
  async saveDiaryEntry(entry: DiaryEntry): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      console.log('🔍 저장할 사용자 ID:', userId);

      // DiaryEntry를 Supabase 형식으로 변환
      const supabaseEntry = this.convertToSupabaseEntry(entry);

      // 일기에 사용자 ID 추가
      const entryWithUserId = {
        ...supabaseEntry,
        user_id: userId,
        updated_at: new Date().toISOString(),
      };

      console.log('💾 Supabase 일기 저장 중:', entry.title);
      console.log('📊 저장할 데이터:', entryWithUserId);

      const { error } = await supabase
        .from('diary_entries')
        .upsert([entryWithUserId], {
          onConflict: 'id',
          ignoreDuplicates: false,
        });

      if (error) {
        throw error;
      }

      console.log('✅ Supabase 일기 저장 성공');
    } catch (error) {
      console.error('❌ Supabase 일기 저장 실패:', error);
      throw error;
    }
  }

  // 여러 일기 일괄 저장
  async saveDiaryEntries(entries: DiaryEntry[]): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();

      console.log('💾 Supabase 일괄 일기 저장 중:', entries.length, '개');

      const entriesWithUserId = entries.map(entry => {
        const supabaseEntry = this.convertToSupabaseEntry(entry);
        return {
          ...supabaseEntry,
          user_id: userId,
          updated_at: new Date().toISOString(),
        };
      });

      const { error } = await supabase
        .from('diary_entries')
        .upsert(entriesWithUserId, {
          onConflict: 'id',
          ignoreDuplicates: false,
        });

      if (error) {
        throw error;
      }

      console.log('✅ Supabase 일괄 일기 저장 성공');
    } catch (error) {
      console.error('❌ Supabase 일괄 일기 저장 실패:', error);
      throw error;
    }
  }

  // 모든 일기 가져오기
  async loadDiaryEntries(): Promise<DiaryEntry[]> {
    try {
      const userId = await this.getCurrentUserId();
      console.log('🔍 조회할 사용자 ID:', userId);

      console.log('📖 Supabase 일기 목록 로딩 중...');

      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      // Supabase 데이터를 DiaryEntry로 변환
      const entries: DiaryEntry[] = (data || []).map(item =>
        this.convertFromSupabaseEntry(item),
      );

      console.log('✅ Supabase 일기 목록 로딩 성공:', entries.length, '개');
      return entries;
    } catch (error) {
      console.error('❌ Supabase 일기 목록 로딩 실패:', error);
      throw error;
    }
  }

  // 특정 일기 가져오기
  async getDiaryEntry(entryId: string): Promise<DiaryEntry | null> {
    try {
      const userId = await this.getCurrentUserId();

      console.log('📖 Supabase 일기 로딩 중:', entryId);

      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('id', entryId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('📖 일기를 찾을 수 없음:', entryId);
          return null;
        }
        throw error;
      }

      if (!data) {
        return null;
      }

      // user_id 필드 제거 후 DiaryEntry로 변환
      const { user_id, ...entryData } = data;

      console.log('✅ Supabase 일기 로딩 성공');
      return entryData as DiaryEntry;
    } catch (error) {
      console.error('❌ Supabase 일기 로딩 실패:', error);
      throw error;
    }
  }

  // 일기 삭제
  async deleteDiaryEntry(entryId: string): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();

      console.log('🗑️ Supabase 일기 삭제 중:', entryId);

      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      console.log('✅ Supabase 일기 삭제 성공');
    } catch (error) {
      console.error('❌ Supabase 일기 삭제 실패:', error);
      throw error;
    }
  }

  // 일기 검색
  async searchDiaryEntries(searchTerm: string): Promise<DiaryEntry[]> {
    try {
      const userId = await this.getCurrentUserId();

      console.log('🔍 Supabase 일기 검색 중:', searchTerm);

      // PostgreSQL의 ILIKE를 사용한 대소문자 무시 검색
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', userId)
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      // user_id 필드 제거 후 DiaryEntry로 변환
      const entries: DiaryEntry[] = (data || []).map(item => {
        const { user_id, ...entryData } = item;
        return entryData as DiaryEntry;
      });

      console.log('✅ Supabase 일기 검색 완료:', entries.length, '개 발견');
      return entries;
    } catch (error) {
      console.error('❌ Supabase 일기 검색 실패:', error);
      throw error;
    }
  }

  // 날짜 범위로 일기 가져오기
  async getDiaryEntriesByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<DiaryEntry[]> {
    try {
      const userId = await this.getCurrentUserId();

      console.log('📅 Supabase 날짜 범위 일기 검색:', startDate, '~', endDate);

      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      // user_id 필드 제거 후 DiaryEntry로 변환
      const entries: DiaryEntry[] = (data || []).map(item => {
        const { user_id, ...entryData } = item;
        return entryData as DiaryEntry;
      });

      console.log('✅ Supabase 날짜 범위 검색 완료:', entries.length, '개');
      return entries;
    } catch (error) {
      console.error('❌ Supabase 날짜 범위 검색 실패:', error);
      throw error;
    }
  }

  // 사용자 프로필 저장
  async saveUserProfile(user: User): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();

      console.log('👤 Supabase 사용자 프로필 저장 중');

      // 사용자 문서가 존재하는지 확인 (신규 사용자 판별)
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const isNewUser = !existingUser;

      const profileData: any = {
        id: user.uid,
        email: user.email,
        display_name: user.displayName,
        photo_url: user.photoURL,
        is_anonymous: user.isAnonymous,
        updated_at: new Date().toISOString(),
      };

      // 신규 사용자인 경우 기본 테마 설정 추가
      if (isNewUser) {
        profileData.created_at = new Date().toISOString();
        profileData.current_theme = 'default'; // 기본 테마 적용

        if (user.isAnonymous) {
          // 익명 사용자: 기본 테마만 제공 (구매 불가)
          profileData.purchased_themes = ['default'];
          console.log('🎨 익명 사용자에게 기본 테마만 제공');
        } else {
          // 실제 가입 사용자: 기본 테마 제공 (구매 가능)
          profileData.purchased_themes = ['default'];
          console.log('🎨 신규 가입 사용자에게 기본 테마 적용');
        }
      }

      const { error } = await supabase
        .from('user_profiles')
        .upsert([profileData], {
          onConflict: 'id',
          ignoreDuplicates: false,
        });

      if (error) {
        throw error;
      }

      console.log('✅ Supabase 사용자 프로필 저장 성공');
    } catch (error) {
      console.error('❌ Supabase 사용자 프로필 저장 실패:', error);
      throw error;
    }
  }

  // 로컬 데이터를 Supabase로 마이그레이션
  async migrateLocalDataToSupabase(localEntries: DiaryEntry[]): Promise<void> {
    try {
      if (localEntries.length === 0) {
        console.log('💾 마이그레이션할 로컬 데이터가 없습니다');
        return;
      }

      console.log(
        '🔄 로컬 데이터 Supabase 마이그레이션 시작:',
        localEntries.length,
        '개',
      );

      // 기존 Supabase 데이터 확인
      const existingEntries = await this.loadDiaryEntries();
      const existingIds = new Set(existingEntries.map(entry => entry.id));

      // 중복되지 않는 로컬 데이터만 마이그레이션
      const newEntries = localEntries.filter(
        entry => !existingIds.has(entry.id),
      );

      if (newEntries.length === 0) {
        console.log('💾 마이그레이션할 새로운 데이터가 없습니다');
        return;
      }

      await this.saveDiaryEntries(newEntries);

      console.log(
        '✅ 로컬 데이터 Supabase 마이그레이션 완료:',
        newEntries.length,
        '개',
      );
    } catch (error) {
      console.error('❌ 로컬 데이터 Supabase 마이그레이션 실패:', error);
      throw error;
    }
  }

  // 실시간 일기 목록 리스너 등록
  async onDiaryEntriesChanged(
    callback: (entries: DiaryEntry[]) => void,
  ): Promise<() => void> {
    try {
      const userId = await this.getCurrentUserId();

      console.log('👂 Supabase 실시간 일기 리스너 등록');

      const subscription = supabase
        .channel('diary_entries')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'diary_entries',
            filter: `user_id=eq.${userId}`,
          },
          () => {
            // 변경 사항이 있을 때 전체 목록을 다시 로드
            this.loadDiaryEntries()
              .then(entries => {
                console.log(
                  '📡 Supabase 실시간 일기 업데이트:',
                  entries.length,
                  '개',
                );
                callback(entries);
              })
              .catch(error => {
                console.error('❌ Supabase 실시간 일기 로드 오류:', error);
              });
          },
        )
        .subscribe();

      // 초기 데이터 로드
      this.loadDiaryEntries()
        .then(entries => callback(entries))
        .catch(error => console.error('❌ 초기 일기 로드 실패:', error));

      return () => {
        console.log('👂 Supabase 실시간 일기 리스너 해제');
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('❌ Supabase 실시간 일기 리스너 등록 실패:', error);
      return () => {}; // 빈 함수 반환
    }
  }

  // 연결 상태 확인
  async checkConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('count')
        .limit(1);

      if (error) {
        throw error;
      }

      console.log('✅ Supabase 연결 확인됨');
      return true;
    } catch (error) {
      console.error('❌ Supabase 연결 실패:', error);
      return false;
    }
  }

  // 사용자의 현재 테마 가져오기
  async getUserCurrentTheme(): Promise<string> {
    try {
      const userId = await this.getCurrentUserId();

      const { data, error } = await supabase
        .from('user_profiles')
        .select('current_theme')
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.log('⚠️ 사용자 프로필이 없습니다. 기본 프로필을 생성합니다.');
        // 사용자 프로필이 없으면 기본 프로필 생성
        await this.createDefaultUserProfile(userId);
        return 'default';
      }

      return data.current_theme || 'default';
    } catch (error) {
      console.error('❌ Supabase 사용자 현재 테마 조회 실패:', error);
      return 'default';
    }
  }

  // 사용자의 구매한 테마 목록 가져오기
  async getUserPurchasedThemes(): Promise<string[]> {
    try {
      const userId = await this.getCurrentUserId();

      const { data, error } = await supabase
        .from('user_profiles')
        .select('purchased_themes')
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.log('⚠️ 사용자 프로필이 없습니다. 기본 프로필을 생성합니다.');
        // 사용자 프로필이 없으면 기본 프로필 생성
        await this.createDefaultUserProfile(userId);
        return ['default'];
      }

      return data.purchased_themes || ['default'];
    } catch (error) {
      console.error('❌ Supabase 사용자 구매 테마 조회 실패:', error);
      return ['default'];
    }
  }

  // 테마 구매 처리
  async purchaseTheme(themeId: string): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();

      // 현재 구매한 테마 목록 가져오기
      const purchasedThemes = await this.getUserPurchasedThemes();

      // 이미 구매한 테마인지 확인
      if (purchasedThemes.includes(themeId)) {
        console.log('⚠️ 이미 구매한 테마입니다:', themeId);
        return;
      }

      // 새로운 테마를 구매 목록에 추가
      const updatedPurchasedThemes = [...purchasedThemes, themeId];

      const { error } = await supabase
        .from('user_profiles')
        .update({
          purchased_themes: updatedPurchasedThemes,
          current_theme: themeId, // 구매 후 바로 적용
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      console.log('✅ Supabase 테마 구매 및 적용 완료:', themeId);
    } catch (error) {
      console.error('❌ Supabase 테마 구매 실패:', error);
      throw error;
    }
  }

  // 기본 사용자 프로필 생성
  private async createDefaultUserProfile(userId: string): Promise<void> {
    try {
      const currentUser = supabaseAuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      }

      const { error } = await supabase.from('user_profiles').insert({
        id: userId,
        email: currentUser.email,
        display_name: currentUser.displayName,
        current_theme: 'default',
        purchased_themes: ['default'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('❌ 기본 사용자 프로필 생성 실패:', error);
        throw error;
      }

      console.log('✅ 기본 사용자 프로필 생성 완료:', userId);
    } catch (error) {
      console.error('❌ 기본 사용자 프로필 생성 실패:', error);
      throw error;
    }
  }

  // 테마 적용 (구매한 테마만 적용 가능)
  async applyTheme(themeId: string): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();

      // 테스트 계정 확인
      const isTestAccount = supabaseAuthService.isTestAccount();
      console.log('🧪 SupabaseService: 테스트 계정 여부:', isTestAccount);

      // 테스트 계정이 아닌 경우에만 구매 확인
      if (!isTestAccount) {
        // 구매한 테마인지 확인
        const purchasedThemes = await this.getUserPurchasedThemes();

        if (!purchasedThemes.includes(themeId)) {
          throw new Error('구매하지 않은 테마는 적용할 수 없습니다.');
        }
      } else {
        console.log('🧪 테스트 계정 - 구매 확인 건너뛰기');
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          current_theme: themeId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      console.log('✅ Supabase 테마 적용 완료:', themeId);
    } catch (error) {
      console.error('❌ Supabase 테마 적용 실패:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성
const supabaseService = new SupabaseService();
export default supabaseService;
