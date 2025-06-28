import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import syncService, {SyncStatus} from '../services/syncService';

interface SyncStatusProps {
  style?: any;
}

const SyncStatusComponent: React.FC<SyncStatusProps> = ({style}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: false,
    lastSyncTime: null,
    pendingUploads: 0,
    pendingDownloads: 0,
  });
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [backupName, setBackupName] = useState('');

  useEffect(() => {
    // 동기화 상태 리스너 등록
    const unsubscribe = syncService.onSyncStatusChanged(setSyncStatus);

    return unsubscribe;
  }, []);

  const handleManualSync = async () => {
    // 백업 이름 입력 모달 표시
    setBackupName('');
    setShowNameInput(true);
  };

  const handleCreateBackup = async () => {
    setShowNameInput(false);
    setIsManualSyncing(true);

    try {
      // 입력된 이름이 있으면 사용, 없으면 undefined (기본 이름 사용)
      const finalBackupName = backupName.trim() || undefined;
      await syncService.createCloudBackup(finalBackupName);
    } catch (error) {
      console.error('클라우드 백업 에러:', error);
      Alert.alert('백업 실패', '백업 생성 중 오류가 발생했습니다.');
    } finally {
      setIsManualSyncing(false);
      setBackupName('');
    }
  };

  const handleCancelBackup = () => {
    setShowNameInput(false);
    setBackupName('');
  };

  const formatLastSyncTime = (date: Date | null) => {
    if (!date) return '백업된 적 없음';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}시간 전`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}일 전`;
  };

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return '#ff6b6b';
    if (syncStatus.pendingUploads > 0 || syncStatus.pendingDownloads > 0)
      return '#ffa500';
    return '#51cf66';
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) return '오프라인';
    if (syncStatus.pendingUploads > 0)
      return `업로드 대기 중 (${syncStatus.pendingUploads})`;
    if (syncStatus.pendingDownloads > 0)
      return `다운로드 대기 중 (${syncStatus.pendingDownloads})`;
    return '백업 완료됨';
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, {backgroundColor: getStatusColor()}]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>

        {(syncStatus.pendingUploads > 0 ||
          syncStatus.pendingDownloads > 0 ||
          isManualSyncing) && (
          <ActivityIndicator
            size="small"
            color={getStatusColor()}
            style={styles.loader}
          />
        )}
      </View>

      <Text style={styles.lastSyncText}>
        마지막 백업: {formatLastSyncTime(syncStatus.lastSyncTime)}
      </Text>

      <TouchableOpacity
        style={[
          styles.syncButton,
          isManualSyncing && styles.syncButtonDisabled,
        ]}
        onPress={handleManualSync}
        disabled={isManualSyncing}>
        {isManualSyncing ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.syncButtonText}>수동 클라우드 백업</Text>
        )}
      </TouchableOpacity>

      {/* 백업 이름 입력 모달 */}
      <Modal
        visible={showNameInput}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelBackup}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>💾 클라우드 백업</Text>
            <Text style={styles.modalSubtitle}>
              백업 이름을 입력해주세요.{'\n'}(비워두면 기본 이름으로 저장됩니다)
            </Text>

            <TextInput
              style={styles.textInput}
              value={backupName}
              onChangeText={setBackupName}
              placeholder="예: 주간백업, 중요백업..."
              placeholderTextColor="#999"
              autoFocus={true}
              maxLength={20}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelBackup}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreateBackup}>
                <Text style={styles.confirmButtonText}>백업</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    flex: 1,
  },
  loader: {
    marginLeft: 8,
  },
  lastSyncText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 12,
  },
  syncButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  syncButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    minWidth: 300,
    maxWidth: 350,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  confirmButton: {
    backgroundColor: '#007bff',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SyncStatusComponent;
