// 🔧 Firebase Firestore 모듈을 안전하게 import
let firestore: any = null;

try {
  firestore = require('@react-native-firebase/firestore').default;
  console.log('✅ Firestore 모듈 로딩 성공');
} catch (error) {
  console.log('⚠️ Firestore 모듈 로딩 실패 - 로컬 전용 모드로 실행:', error);
}

import authService, {User} from './authService';
import {Alert} from 'react-native';
import {
  loadDiaryEntries,
  saveDiaryEntries,
  deleteDiaryEntry as deleteStorageDiaryEntry,
} from '../utils/storage';
import {DiaryEntry as StorageDiaryEntry} from '../types';

// 🗄️ 데이터베이스 구조
export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD 형식
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  isLocal?: boolean; // 로컬에만 있는 데이터인지 표시
}

// 💾 백업 엔트리 구조
export interface BackupEntry {
  id: string;
  name: string; // 백업 이름 (사용자 입력 이름 + 날짜시간)
  date: string; // YYYY-MM-DD 형식 백업 날짜
  diaries: DiaryEntry[];
  count: number;
  userId: string;
  createdAt: Date;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: Date | null;
  pendingUploads: number;
  pendingDownloads: number;
}

class SyncService {
  private userId: string | null = null;
  private syncListeners: ((status: SyncStatus) => void)[] = [];
  private currentSyncStatus: SyncStatus = {
    isOnline: false,
    lastSyncTime: null,
    pendingUploads: 0,
    pendingDownloads: 0,
  };

  constructor() {
    this.initializeSync();
  }

  // 🔄 동기화 초기화 (실시간 동기화 제거 - 수동 동기화만)
  private initializeSync() {
    // 인증 상태 변화 감지
    authService.onAuthStateChanged((user: User | null) => {
      if (user) {
        this.userId = user.uid;
        console.log('✅ 사용자 로그인됨. 수동 동기화만 사용됩니다.');
        this.updateSyncStatus({isOnline: true});
      } else {
        this.userId = null;
        this.updateSyncStatus({isOnline: false});
        console.log('❌ 사용자 로그아웃됨.');
      }
    });
  }

  // 🔗 Firebase 연결 테스트
  private async testFirebaseConnection(): Promise<boolean> {
    try {
      console.log('🔍 Firebase Firestore 연결 테스트 시작...');

      // 간단한 읽기 테스트 (빈 쿼리)
      await firestore().collection('test').limit(1).get();

      console.log('✅ Firebase Firestore 연결 성공');
      return true;
    } catch (error: any) {
      console.error('❌ Firebase Firestore 연결 실패:', error);
      console.error('❌ 에러 코드:', error?.code);
      console.error('❌ 에러 메시지:', error?.message);

      if (error?.code === 'permission-denied') {
        console.error(
          '🚫 Firestore 권한 거부 - 데이터베이스가 활성화되지 않았거나 보안 규칙 문제',
        );
      } else if (error?.code === 'unavailable') {
        console.error(
          '🌐 Firestore 서비스 사용 불가 - 네트워크 연결 확인 필요',
        );
      }

      return false;
    }
  }

  // 📥 서버에서 모든 일기 다운로드
  async downloadAllDiaries(): Promise<DiaryEntry[]> {
    if (!this.userId) throw new Error('사용자가 로그인되지 않았습니다.');

    try {
      console.log('📥 서버에서 일기 다운로드 중...');

      // 🔧 단순화된 쿼리 (인덱스 불필요)
      const snapshot = await firestore()
        .collection('diaries')
        .where('userId', '==', this.userId)
        .get();

      const diaries: DiaryEntry[] = [];

      snapshot.forEach(doc => {
        const data = doc.data() as DiaryEntry;
        data.id = doc.id;
        diaries.push(data);
      });

      // 클라이언트에서 날짜순 정렬
      diaries.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      console.log(`📥 ${diaries.length}개 일기 다운로드 완료`);

      // 로컬 스토리지에 저장
      for (const diary of diaries) {
        await this.saveToLocalStorage(diary);
      }

      return diaries;
    } catch (error) {
      console.error('❌ 일기 다운로드 실패:', error);
      throw error;
    }
  }

  // 📤 로컬 일기들 업로드
  async uploadLocalDiaries(): Promise<void> {
    try {
      console.log('📤 로컬 일기 업로드 중...');

      const localDiaries = await this.getLocalDiaries();
      const newDiaries = localDiaries.filter(diary => diary.isLocal);

      this.updateSyncStatus({pendingUploads: newDiaries.length});

      for (const diary of newDiaries) {
        await this.uploadDiary(diary);
      }

      console.log(`📤 ${newDiaries.length}개 일기 업로드 완료`);
      this.updateSyncStatus({pendingUploads: 0});
    } catch (error) {
      console.error('❌ 로컬 일기 업로드 실패:', error);
      throw error;
    }
  }

  // 📤 개별 일기 업로드
  async uploadDiary(diary: DiaryEntry): Promise<void> {
    if (!this.userId) throw new Error('사용자가 로그인되지 않았습니다.');

    try {
      const diaryData = {
        title: diary.title,
        content: diary.content,
        date: diary.date,
        userId: this.userId,
        createdAt: diary.createdAt || new Date(),
        updatedAt: new Date(),
      };

      if (diary.id && !diary.isLocal) {
        // 기존 일기 업데이트
        await firestore().collection('diaries').doc(diary.id).update(diaryData);
        console.log('📝 일기 업데이트됨:', diary.title);
      } else {
        // 새 일기 추가
        const docRef = await firestore().collection('diaries').add(diaryData);
        console.log('📝 새 일기 추가됨:', diary.title, 'ID:', docRef.id);

        // 로컬에서 isLocal 플래그 제거
        diary.id = docRef.id;
        diary.isLocal = false;
        await this.saveToLocalStorage(diary);
      }
    } catch (error) {
      console.error('❌ 일기 업로드 실패:', error);
      throw error;
    }
  }

  // 🗑️ 일기 삭제 (로컬 + 서버)
  async deleteDiary(diaryId: string): Promise<void> {
    try {
      // 서버에서 삭제
      if (this.userId) {
        await firestore().collection('diaries').doc(diaryId).delete();
        console.log('🗑️ 서버에서 일기 삭제됨:', diaryId);
      }

      // 로컬에서 삭제
      await this.removeFromLocalStorage(diaryId);
    } catch (error) {
      console.error('❌ 일기 삭제 실패:', error);
      throw error;
    }
  }

  // 💾 로컬 스토리지 관련 메서드들 (실제 구현)
  private async saveToLocalStorage(diary: DiaryEntry): Promise<void> {
    try {
      console.log('💾 로컬에 저장:', diary.title);

      // 기존 일기들 로드
      const existingEntries = await loadDiaryEntries();

      // 날짜 안전 처리 함수
      const getISOString = (date: Date | string | undefined): string => {
        if (!date) return new Date().toISOString();
        if (typeof date === 'string') return date;
        if (date instanceof Date) return date.toISOString();
        return new Date().toISOString();
      };

      // Firebase 형식을 앱 형식으로 변환
      const storageEntry: StorageDiaryEntry = {
        id: diary.id,
        title: diary.title,
        content: diary.content,
        date: diary.date,
        mood: 'content', // 기본값
        createdAt: getISOString(diary.createdAt),
        updatedAt: getISOString(diary.updatedAt),
      };

      // 기존 항목 찾기
      const existingIndex = existingEntries.findIndex(e => e.id === diary.id);

      if (existingIndex >= 0) {
        // 기존 항목 업데이트
        existingEntries[existingIndex] = {
          ...existingEntries[existingIndex],
          ...storageEntry,
        };
      } else {
        // 새 항목 추가
        existingEntries.push(storageEntry);
      }

      // 정렬 후 저장
      existingEntries.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      await saveDiaryEntries(existingEntries);

      console.log('💾 로컬 저장 완료:', diary.title);
    } catch (error) {
      console.error('❌ 로컬 저장 실패:', error);
    }
  }

  private async removeFromLocalStorage(diaryId: string): Promise<void> {
    try {
      console.log('🗑️ 로컬에서 삭제:', diaryId);
      await deleteStorageDiaryEntry(diaryId);
      console.log('🗑️ 로컬 삭제 완료:', diaryId);
    } catch (error) {
      console.error('❌ 로컬 삭제 실패:', error);
    }
  }

  private async getLocalDiaries(): Promise<DiaryEntry[]> {
    try {
      const storageEntries = await loadDiaryEntries();

      // 날짜 안전 처리 함수
      const getDate = (dateStr: string | undefined): Date => {
        if (!dateStr) return new Date();
        try {
          const date = new Date(dateStr);
          return isNaN(date.getTime()) ? new Date() : date;
        } catch {
          return new Date();
        }
      };

      // 앱 형식을 Firebase 형식으로 변환
      const diaryEntries: DiaryEntry[] = storageEntries.map(entry => ({
        id: entry.id,
        title: entry.title,
        content: entry.content,
        date: entry.date,
        userId: this.userId || '',
        createdAt: getDate(entry.createdAt),
        updatedAt: getDate(entry.updatedAt),
        isLocal: true, // 로컬에서 가져온 데이터는 로컬 플래그 설정
      }));

      console.log(`📱 로컬에서 ${diaryEntries.length}개 일기 로드`);
      return diaryEntries;
    } catch (error) {
      console.error('❌ 로컬 일기 로드 실패:', error);
      return [];
    }
  }

  // 📊 동기화 상태 관리
  private updateSyncStatus(updates: Partial<SyncStatus>) {
    this.currentSyncStatus = {...this.currentSyncStatus, ...updates};
    this.syncListeners.forEach(listener => listener(this.currentSyncStatus));
  }

  // 📊 동기화 상태 리스너
  onSyncStatusChanged(callback: (status: SyncStatus) => void) {
    this.syncListeners.push(callback);

    // 현재 상태 즉시 전달
    callback(this.currentSyncStatus);

    // 구독 해제 함수 반환
    return () => {
      const index = this.syncListeners.indexOf(callback);
      if (index > -1) {
        this.syncListeners.splice(index, 1);
      }
    };
  }

  // 🔄 수동 동기화
  async manualSync(): Promise<void> {
    if (!this.userId) {
      Alert.alert('로그인 필요', '동기화하려면 먼저 로그인해주세요.');
      return;
    }

    try {
      console.log('🔄 수동 동기화 시작...');

      // 1. 로컬 일기 확인
      const localDiaries = await this.getLocalDiaries();
      console.log(`📱 로컬 일기 개수: ${localDiaries.length}개`);

      if (localDiaries.length > 0) {
        console.log('📱 로컬 일기 목록:');
        localDiaries.forEach((diary, index) => {
          console.log(`  ${index + 1}. ${diary.title} (${diary.date})`);
        });
      }

      // 2. 실체 동기화 수행 (수동)
      console.log('🔗 Firebase 연결 상태 확인 중...');
      const isConnected = await this.testFirebaseConnection();

      if (!isConnected) {
        Alert.alert(
          'Firebase 연결 실패',
          'Firebase Firestore에 연결할 수 없습니다.\n네트워크 연결을 확인해주세요.',
        );
        return;
      }

      // 서버에서 모든 일기 가져오기
      await this.downloadAllDiaries();

      // 로컬의 새로운 일기들 업로드
      await this.uploadLocalDiaries();

      console.log('✅ 수동 동기화 완료');

      // 동기화 후 Firebase 상태 확인
      const snapshot = await firestore()
        .collection('diaries')
        .where('userId', '==', this.userId)
        .get();

      Alert.alert(
        '동기화 완료',
        `로컬: ${localDiaries.length}개 일기\nFirebase: ${snapshot.size}개 일기\n\n데이터가 성공적으로 동기화되었습니다.`,
      );
    } catch (error) {
      console.error('❌ 수동 동기화 실패:', error);
      Alert.alert('동기화 실패', '동기화 중 오류가 발생했습니다.');
    }
  }

  // 📊 현재 동기화 상태 가져오기
  getSyncStatus(): SyncStatus {
    return {...this.currentSyncStatus};
  }

  // 🔍 Firebase 데이터 확인 (디버깅용)
  async checkFirebaseData(): Promise<void> {
    if (!this.userId) {
      Alert.alert('로그인 필요', '사용자가 로그인되지 않았습니다.');
      return;
    }

    try {
      console.log('🔍 Firebase 데이터 확인 시작...');

      const snapshot = await firestore()
        .collection('diaries')
        .where('userId', '==', this.userId)
        .get();

      console.log(`📊 Firebase에서 찾은 일기 개수: ${snapshot.size}개`);

      if (snapshot.empty) {
        Alert.alert(
          'Firebase 데이터 확인',
          'Firebase에 저장된 일기가 없습니다.',
        );
        return;
      }

      let dataInfo = `Firebase에서 ${snapshot.size}개의 일기를 찾았습니다:\n\n`;

      snapshot.forEach((doc, index) => {
        const data = doc.data();
        dataInfo += `${index + 1}. ${data.title} (${data.date})\n`;
        console.log(`📝 일기 ${index + 1}:`, {
          id: doc.id,
          title: data.title,
          date: data.date,
          userId: data.userId,
        });
      });

      Alert.alert('Firebase 데이터 확인', dataInfo);
    } catch (error: any) {
      console.error('❌ Firebase 데이터 확인 실패:', error);
      Alert.alert(
        '오류',
        `Firebase 데이터 확인 중 오류가 발생했습니다.\n\n${
          error?.message || error
        }`,
      );
    }
  }

  // 🗑️ 모든 로컬 데이터 삭제 (개발용)
  async deleteAllLocalData(): Promise<void> {
    try {
      console.log('🗑️ 로컬 데이터 전체 삭제 시작...');

      const localDiaries = await this.getLocalDiaries();
      console.log(`🗑️ 삭제할 로컬 일기 개수: ${localDiaries.length}개`);

      if (localDiaries.length === 0) {
        Alert.alert('삭제 완료', '삭제할 로컬 데이터가 없습니다.');
        return;
      }

      // 빈 배열로 저장하여 모든 데이터 삭제
      await saveDiaryEntries([]);

      console.log(`✅ ${localDiaries.length}개 로컬 일기 삭제 완료`);
      Alert.alert(
        '삭제 완료',
        `로컬에서 ${localDiaries.length}개의 일기가 삭제되었습니다.`,
      );
    } catch (error: any) {
      console.error('❌ 로컬 데이터 삭제 실패:', error);
      Alert.alert(
        '삭제 실패',
        `로컬 데이터 삭제 중 오류가 발생했습니다.\n\n${
          error?.message || error
        }`,
      );
    }
  }

  // 🗑️ 로컬 + Firebase 모든 데이터 완전 삭제 (개발용)
  async deleteAllDataCompletely(): Promise<void> {
    try {
      console.log('🗑️ 모든 데이터 완전 삭제 시작...');

      // 1. 로컬 데이터 개수 확인
      const localDiaries = await this.getLocalDiaries();
      console.log(`📱 로컬 일기 개수: ${localDiaries.length}개`);

      // 2. Firebase 데이터 개수 확인
      let firebaseCount = 0;
      if (this.userId) {
        const snapshot = await firestore()
          .collection('diaries')
          .where('userId', '==', this.userId)
          .get();
        firebaseCount = snapshot.size;
        console.log(`☁️ Firebase 일기 개수: ${firebaseCount}개`);
      }

      const totalCount = Math.max(localDiaries.length, firebaseCount);

      if (totalCount === 0) {
        Alert.alert('삭제 완료', '삭제할 데이터가 없습니다.');
        return;
      }

      // 3. 로컬 데이터 삭제
      if (localDiaries.length > 0) {
        await saveDiaryEntries([]);
        console.log(`✅ ${localDiaries.length}개 로컬 일기 삭제 완료`);
      }

      // 4. Firebase 데이터 삭제
      if (this.userId && firebaseCount > 0) {
        const snapshot = await firestore()
          .collection('diaries')
          .where('userId', '==', this.userId)
          .get();

        // 배치로 삭제
        const batch = firestore().batch();
        snapshot.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`✅ ${firebaseCount}개 Firebase 일기 삭제 완료`);
      }

      Alert.alert(
        '완전 삭제 완료',
        `로컬 ${localDiaries.length}개 + Firebase ${firebaseCount}개 일기가 모두 삭제되었습니다.\n\n"오늘 일어날 일"이 이제 깨끗해집니다! 🎉`,
      );
    } catch (error: any) {
      console.error('❌ 완전 데이터 삭제 실패:', error);
      Alert.alert(
        '삭제 실패',
        `데이터 완전 삭제 중 오류가 발생했습니다.\n\n${
          error?.message || error
        }`,
      );
    }
  }

  // 🗑️ Firebase 모든 데이터 삭제 (개발용)
  async deleteAllFirebaseData(): Promise<void> {
    if (!this.userId) {
      Alert.alert('로그인 필요', '사용자가 로그인되지 않았습니다.');
      return;
    }

    try {
      console.log('🗑️ Firebase 데이터 전체 삭제 시작...');

      const snapshot = await firestore()
        .collection('diaries')
        .where('userId', '==', this.userId)
        .get();

      console.log(`🗑️ 삭제할 일기 개수: ${snapshot.size}개`);

      if (snapshot.empty) {
        Alert.alert('삭제 완료', 'Firebase에 삭제할 데이터가 없습니다.');
        return;
      }

      // 배치로 삭제
      const batch = firestore().batch();
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      console.log(`✅ ${snapshot.size}개 일기 삭제 완료`);
      Alert.alert(
        '삭제 완료',
        `Firebase에서 ${snapshot.size}개의 일기가 삭제되었습니다.`,
      );
    } catch (error: any) {
      console.error('❌ Firebase 데이터 삭제 실패:', error);
      Alert.alert(
        '삭제 실패',
        `Firebase 데이터 삭제 중 오류가 발생했습니다.\n\n${
          error?.message || error
        }`,
      );
    }
  }

  // 💾 클라우드 백업 생성
  async createCloudBackup(
    backupName?: string,
  ): Promise<{name: string; count: number}> {
    if (!this.userId) throw new Error('사용자가 로그인되지 않았습니다.');

    try {
      console.log('💾 클라우드 백업 생성 중...');

      // 로컬 일기 데이터 가져오기
      const localDiaries = await this.getLocalDiaries();

      if (localDiaries.length === 0) {
        throw new Error('백업할 일기 데이터가 없습니다.');
      }

      // 백업 날짜는 오늘 날짜로 설정
      const backupDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // 백업 시간 생성 (25-06-05-18:30 형식)
      const now = new Date();
      const backupDateTime = `${String(now.getFullYear()).slice(-2)}-${String(
        now.getMonth() + 1,
      ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(
        now.getHours(),
      ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // 백업 이름 생성
      const finalBackupName = backupName
        ? `${backupName}(${backupDateTime})`
        : `백업${backupDateTime}`;

      const backupData: Omit<BackupEntry, 'id'> = {
        name: finalBackupName,
        date: backupDate,
        diaries: localDiaries,
        count: localDiaries.length,
        userId: this.userId,
        createdAt: new Date(),
      };

      // Firebase에 백업 저장
      const docRef = await firestore().collection('backups').add(backupData);

      console.log(
        `💾 백업 생성 완료: ${docRef.id} (${localDiaries.length}개 일기)`,
      );

      Alert.alert(
        '백업 완료',
        `클라우드 백업이 성공적으로 생성되었습니다.\n\n📝 백업 이름: ${finalBackupName}\n📅 백업 날짜: ${backupDate}\n📋 일기 개수: ${localDiaries.length}개`,
      );

      return {name: finalBackupName, count: localDiaries.length};
    } catch (error) {
      console.error('❌ 클라우드 백업 생성 실패:', error);
      throw error;
    }
  }

  // 📋 백업 리스트 조회
  async getBackupList(): Promise<
    Array<{name: string; date: string; count: number}>
  > {
    if (!this.userId) throw new Error('사용자가 로그인되지 않았습니다.');

    try {
      console.log('📋 백업 리스트 조회 중...');

      // orderBy 제거하여 인덱스 문제 방지
      const snapshot = await firestore()
        .collection('backups')
        .where('userId', '==', this.userId)
        .get();

      const backupList: Array<{
        name: string;
        date: string;
        count: number;
        createdAt: Date;
      }> = [];

      snapshot.forEach(doc => {
        const data = doc.data() as BackupEntry;

        // createdAt 필드를 안전하게 Date 객체로 변환
        let createdAtDate: Date;
        if (data.createdAt instanceof Date) {
          createdAtDate = data.createdAt;
        } else if (
          data.createdAt &&
          typeof data.createdAt === 'object' &&
          'seconds' in data.createdAt
        ) {
          // Firestore Timestamp 객체인 경우
          createdAtDate = new Date((data.createdAt as any).seconds * 1000);
        } else if (data.createdAt && typeof data.createdAt === 'string') {
          // 문자열인 경우
          createdAtDate = new Date(data.createdAt);
        } else {
          // 기본값: 현재 시간
          createdAtDate = new Date();
        }

        backupList.push({
          name: data.name || `백업${data.date}`, // 이전 백업과의 호환성을 위해
          date: data.date,
          count: data.count,
          createdAt: createdAtDate,
        });
      });

      // 클라이언트 사이드에서 정렬 (최신순 - 가장 최근 백업이 맨 위)
      backupList.sort((a, b) => {
        const timeA = a.createdAt.getTime();
        const timeB = b.createdAt.getTime();
        return timeB - timeA; // 내림차순 정렬 (최신순)
      });

      console.log(`📋 ${backupList.length}개 백업 발견 (시간순 정렬됨)`);

      // 정렬 결과 로그 출력
      backupList.forEach((backup, index) => {
        console.log(
          `  ${index + 1}. ${
            backup.name
          } (${backup.createdAt.toLocaleString()})`,
        );
      });

      // createdAt 제거하고 반환
      return backupList.map(backup => ({
        name: backup.name,
        date: backup.date,
        count: backup.count,
      }));
    } catch (error) {
      console.error('❌ 백업 리스트 조회 실패:', error);
      throw error;
    }
  }

  // 📥 백업에서 복원
  async restoreFromBackup(backupName: string): Promise<void> {
    if (!this.userId) throw new Error('사용자가 로그인되지 않았습니다.');

    try {
      console.log(`📥 백업 복원 중: ${backupName}`);

      // 해당 이름의 백업 찾기
      const snapshot = await firestore()
        .collection('backups')
        .where('userId', '==', this.userId)
        .where('name', '==', backupName)
        .limit(1)
        .get();

      if (snapshot.empty) {
        throw new Error('해당 이름의 백업을 찾을 수 없습니다.');
      }

      const backupDoc = snapshot.docs[0];
      const backupData = backupDoc.data() as BackupEntry;

      // 현재 로컬 데이터 삭제
      await this.deleteAllLocalData();

      // 백업 데이터를 로컬에 저장
      for (const diary of backupData.diaries) {
        await this.saveToLocalStorage(diary);
      }

      console.log(`📥 백업 복원 완료: ${backupData.count}개 일기 복원됨`);

      Alert.alert(
        '복원 완료',
        `${backupName} 백업이 성공적으로 복원되었습니다.\n\n📝 복원된 일기: ${backupData.count}개`,
      );

      this.updateSyncStatus({lastSyncTime: new Date()});
    } catch (error) {
      console.error('❌ 백업 복원 실패:', error);
      throw error;
    }
  }
}

export default new SyncService();
