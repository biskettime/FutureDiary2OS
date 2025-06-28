import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../contexts/ThemeContext';
import authService, {User} from '../services/authService';
import syncService from '../services/syncService';
import SyncStatusComponent from '../components/SyncStatus';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  onPress: () => void;
  showArrow?: boolean;
}

interface BackupItem {
  name: string;
  date: string;
  count: number;
}

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {currentTheme} = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupList, setBackupList] = useState<BackupItem[]>([]);

  useEffect(() => {
    // 현재 사용자 상태 확인
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // 인증 상태 변화 리스너 등록
    const unsubscribe = authService.onAuthStateChanged(authUser => {
      setUser(authUser);
    });

    return () => unsubscribe();
  }, []);

  const handleAccountLogin = () => {
    if (user) {
      // 이미 로그인된 경우 - 계정 정보 표시
      Alert.alert(
        '계정 정보',
        `이메일: ${user.email}\n이름: ${user.displayName || '설정되지 않음'}`,
        [
          {
            text: '로그아웃',
            style: 'destructive',
            onPress: handleLogout,
          },
          {
            text: '닫기',
            style: 'cancel',
          },
        ],
      );
    } else {
      // 로그인되지 않은 경우 - 로그인 화면으로 이동
      try {
        navigation.navigate('Login', {
          onAuthSuccess: (authUser: User) => {
            setUser(authUser);
          },
        });
      } catch (error) {
        console.error('Navigation error:', error);
        Alert.alert('오류', '로그인 화면으로 이동할 수 없습니다.');
      }
    }
  };

  const handleLogout = async () => {
    Alert.alert('로그아웃', '정말 로그아웃하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await authService.signOut();
            setUser(null);
            Alert.alert('로그아웃', '성공적으로 로그아웃되었습니다.');
          } catch (error) {
            console.error('Logout error:', error);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleSync = async () => {
    if (!user) {
      Alert.alert(
        '로그인 필요',
        '백업 가져오기 기능을 사용하려면 먼저 로그인해주세요.',
      );
      return;
    }

    // 백업 리스트를 보여주는 기능으로 변경
    await handleShowBackupList();
  };

  const handleShowBackupList = async () => {
    console.log('🔍 백업 리스트 조회 시작');

    if (!user) {
      Alert.alert(
        '로그인 필요',
        '백업 가져오기 기능을 사용하려면 먼저 로그인해주세요.',
      );
      return;
    }

    try {
      setLoading(true);
      console.log('📋 syncService.getBackupList() 호출');
      const backupListData = await syncService.getBackupList();
      console.log('📋 백업 리스트 조회 결과:', backupListData);
      console.log('📋 백업 개수:', backupListData.length);

      if (backupListData.length === 0) {
        console.log('⚠️ 백업이 없음');
        Alert.alert(
          '백업 없음',
          '저장된 백업이 없습니다.\n먼저 "수동 클라우드 백업"을 실행해주세요.',
        );
        return;
      }

      // 백업 리스트 설정하고 모달 표시
      console.log('📋 백업 리스트 state 설정');
      setBackupList(backupListData);
      console.log('📋 모달 표시 설정');
      setShowBackupModal(true);
      console.log('✅ 백업 모달이 표시되어야 함');
    } catch (error) {
      console.error('❌ 백업 리스트 조회 에러:', error);
      Alert.alert('오류', '백업 리스트를 가져올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackupSelect = (backupName: string) => {
    setShowBackupModal(false);
    handleRestoreBackup(backupName);
  };

  const handleCloseBackupModal = () => {
    setShowBackupModal(false);
    setBackupList([]);
  };

  const handleRestoreBackup = async (backupName: string) => {
    Alert.alert(
      '⚠️ 백업 복원',
      `"${backupName}" 백업으로 복원하시겠습니까?\n\n현재 로컬 데이터가 백업 데이터로 교체됩니다.\n(기존 로컬 데이터는 삭제됩니다)`,
      [
        {text: '취소', style: 'cancel'},
        {
          text: '복원',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await syncService.restoreFromBackup(backupName);
              Alert.alert('복원 완료', '백업이 성공적으로 복원되었습니다.');
            } catch (error) {
              console.error('백업 복원 에러:', error);
              Alert.alert('복원 실패', '백업 복원 중 오류가 발생했습니다.');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleCheckFirebaseData = async () => {
    if (!user) {
      Alert.alert(
        '로그인 필요',
        '클라우드 데이터 확인을 위해 먼저 로그인해주세요.',
      );
      return;
    }

    try {
      await syncService.checkFirebaseData();
    } catch (error) {
      console.error('클라우드 데이터 확인 에러:', error);
    }
  };

  const handleDeleteAllFirebaseData = async () => {
    if (!user) {
      Alert.alert(
        '로그인 필요',
        '클라우드 데이터 삭제를 위해 먼저 로그인해주세요.',
      );
      return;
    }

    Alert.alert(
      '⚠️ 위험한 작업',
      '클라우드에 저장된 모든 일기 데이터가 영구적으로 삭제됩니다.\n\n이 작업은 되돌릴 수 없습니다!\n\n정말로 삭제하시겠습니까?',
      [
        {text: '취소', style: 'cancel'},
        {
          text: '모두 삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await syncService.deleteAllFirebaseData();
            } catch (error) {
              console.error('클라우드 데이터 삭제 에러:', error);
            }
          },
        },
      ],
    );
  };

  const handleDeleteAllLocalData = async () => {
    Alert.alert(
      '⚠️ 위험한 작업',
      '로컬에 저장된 모든 일기 데이터(샘플 데이터 포함)가 영구적으로 삭제됩니다.\n\n이 작업은 되돌릴 수 없습니다!\n\n정말로 삭제하시겠습니까?',
      [
        {text: '취소', style: 'cancel'},
        {
          text: '모두 삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await syncService.deleteAllLocalData();
            } catch (error) {
              console.error('로컬 데이터 삭제 에러:', error);
            }
          },
        },
      ],
    );
  };

  const handleDeleteAllDataCompletely = async () => {
    Alert.alert(
      '🚨 매우 위험한 작업',
      '로컬 + 클라우드에 저장된 모든 일기 데이터가 영구적으로 삭제됩니다.\n\n✅ 로컬 데이터 (앱 내부)\n✅ 클라우드 데이터\n✅ 샘플/테스트 데이터 포함\n\n이 작업은 절대 되돌릴 수 없습니다!\n\n"오늘 일어날 일"이 완전히 깨끗해집니다.',
      [
        {text: '취소', style: 'cancel'},
        {
          text: '완전 삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await syncService.deleteAllDataCompletely();
            } catch (error) {
              console.error('완전 데이터 삭제 에러:', error);
            }
          },
        },
      ],
    );
  };

  const handleSecretStore = () => {
    navigation.navigate('SecretStore');
  };

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.settingItem,
        {borderBottomColor: currentTheme.colors.border},
      ]}
      onPress={item.onPress}
      activeOpacity={0.7}
      disabled={loading}>
      <View style={styles.settingItemLeft}>
        <View
          style={[
            styles.iconContainer,
            {backgroundColor: currentTheme.colors.secondary},
          ]}>
          <Text style={styles.iconText}>{item.icon}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text
            style={[styles.settingTitle, {color: currentTheme.colors.text}]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text
              style={[
                styles.settingSubtitle,
                {color: currentTheme.colors.textSecondary},
              ]}>
              {item.subtitle}
            </Text>
          )}
        </View>
      </View>
      {item.showArrow && (
        <Text
          style={[
            styles.arrowText,
            {color: currentTheme.colors.textSecondary},
          ]}>
          ›
        </Text>
      )}
    </TouchableOpacity>
  );

  // 사용자 정보 컴포넌트
  const renderUserInfo = () => {
    if (!user) return null;

    return (
      <View
        style={[
          styles.userInfoContainer,
          {
            backgroundColor: currentTheme.colors.surface,
            borderBottomColor: currentTheme.colors.border,
          },
        ]}>
        <View style={styles.userInfo}>
          {user.photoURL ? (
            <Image source={{uri: user.photoURL}} style={styles.userPhoto} />
          ) : (
            <View
              style={[
                styles.userPhotoPlaceholder,
                {backgroundColor: currentTheme.colors.secondary},
              ]}>
              <Text
                style={[
                  styles.userPhotoText,
                  {color: currentTheme.colors.background},
                ]}>
                {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
              </Text>
            </View>
          )}
          <View style={styles.userTextInfo}>
            <Text style={[styles.userName, {color: currentTheme.colors.text}]}>
              {user.displayName || '이름 없음'}
            </Text>
            <Text
              style={[
                styles.userEmail,
                {color: currentTheme.colors.textSecondary},
              ]}>
              {user.email}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const settingSections = [
    {
      title: '계정',
      items: [
        {
          id: 'login',
          title: user ? '계정 관리' : '계정 로그인',
          subtitle: user
            ? `${user.email} (탭하여 로그아웃)`
            : '구글, 이메일로 로그인',
          icon: user ? '👤' : '🔐',
          onPress: handleAccountLogin,
          showArrow: !user,
        },
        {
          id: 'backup-restore',
          title: '백업 가져오기',
          subtitle: user ? '저장된 백업에서 일기 복원' : '로그인 후 사용 가능',
          icon: '📥',
          onPress: handleSync,
          showArrow: true,
        },
      ],
    },
    {
      title: '개인화',
      items: [
        // 테마 관련 기능은 비밀 일기 스토어로 이동
      ],
    },
    {
      title: '데이터 관리',
      items: [
        {
          id: 'delete-all-data-completely',
          title: '🚨 완전 삭제 (로컬+클라우드)',
          subtitle: '모든 일기 데이터를 완전히 삭제 (되돌릴 수 없음)',
          icon: '💥',
          onPress: handleDeleteAllDataCompletely,
          showArrow: false,
        },
        {
          id: 'check-firebase',
          title: '클라우드 데이터 확인',
          subtitle: '클라우드에 저장된 일기 데이터 확인',
          icon: '☁️',
          onPress: handleCheckFirebaseData,
          showArrow: false,
        },
        {
          id: 'delete-all-local',
          title: '⚠️ 로컬 전체 데이터 삭제',
          subtitle: '모든 로컬 일기 데이터(샘플 포함)를 영구 삭제',
          icon: '📱',
          onPress: handleDeleteAllLocalData,
          showArrow: false,
        },
        {
          id: 'delete-all-firebase',
          title: '⚠️ 클라우드 전체 데이터 삭제',
          subtitle: '모든 클라우드 일기 데이터를 영구 삭제',
          icon: '☁️',
          onPress: handleDeleteAllFirebaseData,
          showArrow: false,
        },
      ],
    },
    {
      title: '프리미엄',
      items: [
        {
          id: 'secret-store',
          title: '비밀 일기 스토어',
          subtitle: '프리미엄 기능 및 보안 강화',
          icon: '🔒',
          onPress: handleSecretStore,
          showArrow: true,
        },
      ],
    },
  ];

  // 백업 모달 렌더링
  const renderBackupModal = () => {
    console.log('🎭 백업 모달 렌더링');
    console.log('🎭 showBackupModal:', showBackupModal);
    console.log('🎭 backupList:', backupList);
    console.log('🎭 backupList.length:', backupList.length);

    return (
      <Modal
        visible={showBackupModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseBackupModal}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.backupModalContainer,
              {backgroundColor: currentTheme.colors.surface},
            ]}>
            {/* 헤더 */}
            <View style={styles.backupModalHeader}>
              <Text
                style={[
                  styles.backupModalTitle,
                  {color: currentTheme.colors.text},
                ]}>
                📥 백업 가져오기
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseBackupModal}>
                <Text
                  style={[
                    styles.closeButtonText,
                    {color: currentTheme.colors.text},
                  ]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            {/* 서브타이틀 */}
            <Text
              style={[
                styles.backupModalSubtitle,
                {color: currentTheme.colors.textSecondary},
              ]}>
              복원할 백업을 선택해주세요:
            </Text>

            {/* 백업 개수 표시 (디버깅용) */}
            <Text style={{color: 'red', marginBottom: 10}}>
              백업 개수: {backupList.length}
            </Text>

            {/* 백업 리스트 */}
            <FlatList
              data={backupList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => {
                console.log('📋 렌더링 중인 백업 아이템:', item);
                return (
                  <TouchableOpacity
                    style={[
                      styles.backupItem,
                      {borderBottomColor: currentTheme.colors.border},
                    ]}
                    onPress={() => handleBackupSelect(item.name)}>
                    <Text
                      style={[
                        styles.backupItemText,
                        {color: currentTheme.colors.text},
                      ]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              style={styles.backupList}
            />
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <ScrollView
      style={[
        styles.container,
        {backgroundColor: currentTheme.colors.background},
      ]}
      showsVerticalScrollIndicator={false}>
      <View
        style={[styles.header, {backgroundColor: currentTheme.colors.surface}]}>
        <Text style={[styles.headerTitle, {color: currentTheme.colors.text}]}>
          설정
        </Text>
        <Text
          style={[
            styles.headerSubtitle,
            {color: currentTheme.colors.textSecondary},
          ]}>
          앱 설정 및 개인화
        </Text>
      </View>

      {renderUserInfo()}

      {user && (
        <View
          style={[
            styles.syncSection,
            {backgroundColor: currentTheme.colors.surface},
          ]}>
          <Text
            style={[styles.sectionTitle, {color: currentTheme.colors.text}]}>
            💾 데이터 백업
          </Text>
          <SyncStatusComponent />
        </View>
      )}

      {settingSections.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text
            style={[styles.sectionTitle, {color: currentTheme.colors.text}]}>
            {section.title}
          </Text>
          <View
            style={[
              styles.sectionContent,
              {backgroundColor: currentTheme.colors.surface},
            ]}>
            {section.items.map(renderSettingItem)}
          </View>
        </View>
      ))}

      {renderBackupModal()}

      <View style={styles.footer}>
        <Text
          style={[
            styles.footerText,
            {color: currentTheme.colors.textSecondary},
          ]}>
          미래 일기 v1.0.0
        </Text>
        <Text
          style={[
            styles.footerSubtext,
            {color: currentTheme.colors.textSecondary},
          ]}>
          더 나은 일기 경험을 위해 계속 업데이트됩니다.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginHorizontal: 20,
  },
  sectionContent: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F0F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  arrowText: {
    fontSize: 18,
    color: '#C7C7CC',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    textAlign: 'center',
  },
  userInfoContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userPhotoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userPhotoText: {
    fontSize: 20,
  },
  userTextInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
  },
  syncSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backupModalContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    maxHeight: '80%',
  },
  backupModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backupModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backupModalSubtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  backupItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  backupItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  backupList: {
    flex: 1,
  },
});

export default SettingsScreen;
