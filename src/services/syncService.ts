export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: Date | null;
  pendingUploads: number;
  pendingDownloads: number;
}

class SyncService {
  private currentSyncStatus: SyncStatus = {
    isOnline: false,
    lastSyncTime: null,
    pendingUploads: 0,
    pendingDownloads: 0,
  };

  // 동기화 상태 업데이트
  private updateSyncStatus(updates: Partial<SyncStatus>) {
    this.currentSyncStatus = { ...this.currentSyncStatus, ...updates };
  }

  // 동기화 상태 변화 리스너
  onSyncStatusChanged(callback: (status: SyncStatus) => void) {
    callback(this.currentSyncStatus);
    return () => {}; // unsubscribe 함수
  }

  // 동기화 상태 가져오기
  getSyncStatus(): SyncStatus {
    return this.currentSyncStatus;
  }

  // 수동 동기화 (Firebase 제거로 비활성화)
  async manualSync(): Promise<void> {
    console.log('Firebase가 제거되어 동기화 기능을 사용할 수 없습니다.');
  }

  // 클라우드 데이터 확인 (Firebase 제거로 비활성화)
  async checkFirebaseData(): Promise<void> {
    console.log(
      'Firebase가 제거되어 클라우드 데이터 확인을 사용할 수 없습니다.',
    );
  }

  // 로컬 데이터 삭제 (Firebase 제거로 비활성화)
  async deleteAllLocalData(): Promise<void> {
    console.log('Firebase가 제거되어 이 기능을 사용할 수 없습니다.');
  }

  // 클라우드 데이터 삭제 (Firebase 제거로 비활성화)
  async deleteAllFirebaseData(): Promise<void> {
    console.log('Firebase가 제거되어 이 기능을 사용할 수 없습니다.');
  }

  // 모든 데이터 완전 삭제 (Firebase 제거로 비활성화)
  async deleteAllDataCompletely(): Promise<void> {
    console.log('Firebase가 제거되어 이 기능을 사용할 수 없습니다.');
  }

  // 클라우드 백업 생성 (Firebase 제거로 비활성화)
  async createCloudBackup(
    _backupName?: string,
  ): Promise<{ name: string; count: number }> {
    console.log('Firebase가 제거되어 백업 기능을 사용할 수 없습니다.');
    return { name: '', count: 0 };
  }

  // 백업 리스트 가져오기 (Firebase 제거로 비활성화)
  async getBackupList(): Promise<
    Array<{ name: string; date: string; count: number }>
  > {
    console.log('Firebase가 제거되어 백업 기능을 사용할 수 없습니다.');
    return [];
  }

  // 백업에서 복원 (Firebase 제거로 비활성화)
  async restoreFromBackup(_backupName: string): Promise<void> {
    console.log('Firebase가 제거되어 백업 복원 기능을 사용할 수 없습니다.');
  }
}

const syncService = new SyncService();
export default syncService;
