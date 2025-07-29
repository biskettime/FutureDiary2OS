import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import { DiaryEntry } from '../types';
import authService, { User } from './AuthService';

class FirestoreService {
  private db: FirebaseFirestoreTypes.Module;

  constructor() {
    this.db = firestore();

    // 오프라인 지원 활성화
    this.db.settings({
      persistence: true,
    });
  }

  // 사용자별 일기 컬렉션 참조 가져오기
  private getUserEntriesCollection(userId: string) {
    return this.db.collection('users').doc(userId).collection('entries');
  }

  // 현재 사용자 확인
  private getCurrentUserId(): string {
    const user = authService.getCurrentUser();
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }
    return user.uid;
  }

  // 일기 저장
  async saveDiaryEntry(entry: DiaryEntry): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      const entriesRef = this.getUserEntriesCollection(userId);

      // 일기에 사용자 ID 추가
      const entryWithUserId = {
        ...entry,
        userId,
        updatedAt: new Date().toISOString(),
      };

      console.log('💾 일기 저장 중:', entry.title);

      await entriesRef.doc(entry.id).set(entryWithUserId);

      console.log('✅ 일기 저장 성공');
    } catch (error) {
      console.error('❌ 일기 저장 실패:', error);
      throw error;
    }
  }

  // 여러 일기 일괄 저장
  async saveDiaryEntries(entries: DiaryEntry[]): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      const batch = this.db.batch();
      const entriesRef = this.getUserEntriesCollection(userId);

      console.log('💾 일괄 일기 저장 중:', entries.length, '개');

      entries.forEach(entry => {
        const entryWithUserId = {
          ...entry,
          userId,
          updatedAt: new Date().toISOString(),
        };

        const docRef = entriesRef.doc(entry.id);
        batch.set(docRef, entryWithUserId);
      });

      await batch.commit();

      console.log('✅ 일괄 일기 저장 성공');
    } catch (error) {
      console.error('❌ 일괄 일기 저장 실패:', error);
      throw error;
    }
  }

  // 모든 일기 가져오기
  async loadDiaryEntries(): Promise<DiaryEntry[]> {
    try {
      const userId = this.getCurrentUserId();
      const entriesRef = this.getUserEntriesCollection(userId);

      console.log('📖 일기 목록 로딩 중...');

      const snapshot = await entriesRef.orderBy('date', 'desc').get();

      const entries: DiaryEntry[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        // userId 필드는 제거하고 DiaryEntry로 변환
        delete data.userId;
        entries.push(data as DiaryEntry);
      });

      console.log('✅ 일기 목록 로딩 성공:', entries.length, '개');
      return entries;
    } catch (error) {
      console.error('❌ 일기 목록 로딩 실패:', error);
      throw error;
    }
  }

  // 특정 일기 가져오기
  async getDiaryEntry(entryId: string): Promise<DiaryEntry | null> {
    try {
      const userId = this.getCurrentUserId();
      const entriesRef = this.getUserEntriesCollection(userId);

      console.log('📖 일기 로딩 중:', entryId);

      const doc = await entriesRef.doc(entryId).get();

      if (!doc.exists) {
        console.log('📖 일기를 찾을 수 없음:', entryId);
        return null;
      }

      const data = doc.data();
      if (!data) {
        return null;
      }

      // userId 필드는 제거하고 DiaryEntry로 변환
      delete data.userId;
      const entryData = data;

      console.log('✅ 일기 로딩 성공');
      return entryData as DiaryEntry;
    } catch (error) {
      console.error('❌ 일기 로딩 실패:', error);
      throw error;
    }
  }

  // 일기 삭제
  async deleteDiaryEntry(entryId: string): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      const entriesRef = this.getUserEntriesCollection(userId);

      console.log('🗑️ 일기 삭제 중:', entryId);

      await entriesRef.doc(entryId).delete();

      console.log('✅ 일기 삭제 성공');
    } catch (error) {
      console.error('❌ 일기 삭제 실패:', error);
      throw error;
    }
  }

  // 일기 검색
  async searchDiaryEntries(searchTerm: string): Promise<DiaryEntry[]> {
    try {
      const userId = this.getCurrentUserId();
      const entriesRef = this.getUserEntriesCollection(userId);

      console.log('🔍 일기 검색 중:', searchTerm);

      // Firestore는 복잡한 텍스트 검색을 지원하지 않으므로
      // 모든 일기를 가져와서 클라이언트에서 필터링
      const snapshot = await entriesRef.orderBy('date', 'desc').get();

      const entries: DiaryEntry[] = [];
      const searchLower = searchTerm.toLowerCase();

      snapshot.forEach(doc => {
        const data = doc.data();
        // userId 필드는 제거하고 DiaryEntry로 변환
        delete data.userId;
        const entry = data as DiaryEntry;

        // 제목, 내용, 태그에서 검색
        const titleMatch = entry.title.toLowerCase().includes(searchLower);
        const contentMatch = entry.content.toLowerCase().includes(searchLower);
        const tagsMatch = entry.tags?.some(tag => {
          const tagName = typeof tag === 'string' ? tag : tag.name;
          return tagName.toLowerCase().includes(searchLower);
        });

        if (titleMatch || contentMatch || tagsMatch) {
          entries.push(entry);
        }
      });

      console.log('✅ 일기 검색 완료:', entries.length, '개 발견');
      return entries;
    } catch (error) {
      console.error('❌ 일기 검색 실패:', error);
      throw error;
    }
  }

  // 날짜 범위로 일기 가져오기
  async getDiaryEntriesByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<DiaryEntry[]> {
    try {
      const userId = this.getCurrentUserId();
      const entriesRef = this.getUserEntriesCollection(userId);

      console.log('📅 날짜 범위 일기 검색:', startDate, '~', endDate);

      const snapshot = await entriesRef
        .where('date', '>=', startDate)
        .where('date', '<=', endDate)
        .orderBy('date', 'desc')
        .get();

      const entries: DiaryEntry[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        // userId 필드는 제거하고 DiaryEntry로 변환
        delete data.userId;
        entries.push(data as DiaryEntry);
      });

      console.log('✅ 날짜 범위 검색 완료:', entries.length, '개');
      return entries;
    } catch (error) {
      console.error('❌ 날짜 범위 검색 실패:', error);
      throw error;
    }
  }

  // 사용자 프로필 저장
  async saveUserProfile(user: User): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      const userRef = this.db.collection('users').doc(userId);

      console.log('👤 사용자 프로필 저장 중');

      await userRef.set({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isAnonymous: user.isAnonymous,
        updatedAt: new Date().toISOString(),
      });

      console.log('✅ 사용자 프로필 저장 성공');
    } catch (error) {
      console.error('❌ 사용자 프로필 저장 실패:', error);
      throw error;
    }
  }

  // 로컬 데이터를 Firebase로 마이그레이션
  async migrateLocalDataToFirebase(localEntries: DiaryEntry[]): Promise<void> {
    try {
      if (localEntries.length === 0) {
        console.log('💾 마이그레이션할 로컬 데이터가 없습니다');
        return;
      }

      console.log(
        '🔄 로컬 데이터 마이그레이션 시작:',
        localEntries.length,
        '개',
      );

      // 기존 Firebase 데이터 확인
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

      console.log('✅ 로컬 데이터 마이그레이션 완료:', newEntries.length, '개');
    } catch (error) {
      console.error('❌ 로컬 데이터 마이그레이션 실패:', error);
      throw error;
    }
  }

  // 실시간 일기 목록 리스너 등록
  onDiaryEntriesChanged(callback: (entries: DiaryEntry[]) => void): () => void {
    try {
      const userId = this.getCurrentUserId();
      const entriesRef = this.getUserEntriesCollection(userId);

      console.log('👂 실시간 일기 리스너 등록');

      const unsubscribe = entriesRef.orderBy('date', 'desc').onSnapshot(
        snapshot => {
          const entries: DiaryEntry[] = [];

          snapshot.forEach(doc => {
            const data = doc.data();
            // userId 필드는 제거하고 DiaryEntry로 변환
            delete data.userId;
            entries.push(data as DiaryEntry);
          });

          console.log('📡 실시간 일기 업데이트:', entries.length, '개');
          callback(entries);
        },
        error => {
          console.error('❌ 실시간 일기 리스너 오류:', error);
        },
      );

      return unsubscribe;
    } catch (error) {
      console.error('❌ 실시간 일기 리스너 등록 실패:', error);
      return () => {}; // 빈 함수 반환
    }
  }

  // 연결 상태 확인
  async checkConnection(): Promise<boolean> {
    try {
      await this.db.enableNetwork();
      console.log('✅ Firestore 연결 확인됨');
      return true;
    } catch (error) {
      console.error('❌ Firestore 연결 실패:', error);
      return false;
    }
  }
}

// 싱글톤 인스턴스 생성
const firestoreService = new FirestoreService();
export default firestoreService;
