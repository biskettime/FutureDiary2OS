import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../contexts/ThemeContext';
import { DiaryEntry, RootStackParamList, TimelineItem } from '../types';
import { loadDiaryEntries, saveDiaryEntry } from '../utils/storage';
import {
  createTimelineItems,
  sortTimelineItems,
  getTodayEntries,
} from '../utils/dateUtils';
import ThemeBackground from '../components/ThemeBackground';
import DiaryCard from '../components/DiaryCard';
import { WidgetService } from '../services/WidgetService';

type TimelineScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MainTabs'
>;

interface Props {
  navigation: TimelineScreenNavigationProp;
}

const TimelineScreen: React.FC<Props> = ({ navigation }) => {
  const { currentTheme } = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [todayEntries, setTodayEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<
    'realized' | 'not_realized' | null
  >(null);
  const [actualResultDetail, setActualResultDetail] = useState('');

  const loadTimeline = useCallback(async () => {
    try {
      setLoading(true);
      const entries = await loadDiaryEntries();

      // 오늘 일기들 필터링
      const todayEntries = getTodayEntries(entries);
      setTodayEntries(todayEntries);

      // 타임라인 아이템 생성 및 정렬
      const timelineItems = createTimelineItems(entries);
      const futureItems = timelineItems.filter(
        item => item.status === 'future',
      );
      const sortedItems = sortTimelineItems(futureItems);
      setTimelineItems(sortedItems);

      // 위젯 데이터 업데이트
      await WidgetService.updateWidgetData(entries, currentTheme);
    } catch (error) {
      console.error('타임라인 로딩 중 오류:', error);
    } finally {
      setLoading(false);
    }
  }, [currentTheme]);

  const handleAddResult = (entry: DiaryEntry) => {
    setSelectedEntry(entry);
    setSelectedStatus(entry.resultStatus || null);
    setActualResultDetail(
      entry.actualResult &&
        entry.actualResult !== '✅ 이루어졌어요! 😊' &&
        entry.actualResult !== '❌ 아직 실현되지 않았어요:('
        ? entry.actualResult
        : '',
    );
    setShowResultModal(true);
  };

  const handleSelectStatus = (resultStatus: 'realized' | 'not_realized') => {
    setSelectedStatus(resultStatus);
  };

  const handleSaveResult = async () => {
    if (!selectedEntry || !selectedStatus) {
      Alert.alert('알림', '결과를 선택해주세요.');
      return;
    }

    try {
      const statusText =
        selectedStatus === 'realized'
          ? '✅ 이루어졌어요! 😊'
          : '❌ 아직 실현되지 않았어요:(';
      const finalResult = actualResultDetail.trim()
        ? `${statusText}\n\n${actualResultDetail.trim()}`
        : statusText;

      const updatedEntry = {
        ...selectedEntry,
        resultStatus: selectedStatus,
        actualResult: finalResult,
        updatedAt: new Date().toISOString(),
      };

      await saveDiaryEntry(updatedEntry);

      // 상태 업데이트
      setTodayEntries(prev =>
        prev.map(entry =>
          entry.id === selectedEntry.id ? updatedEntry : entry,
        ),
      );

      setTimelineItems(prev =>
        prev.map(item =>
          item.entry.id === selectedEntry.id
            ? { ...item, entry: updatedEntry }
            : item,
        ),
      );

      setShowResultModal(false);
      setSelectedEntry(null);
      setSelectedStatus(null);
      setActualResultDetail('');

      Alert.alert(
        '성공',
        selectedStatus === 'realized'
          ? '이루어진 일로 기록되었습니다! 😊'
          : '아직 실현되지 않은 일로 기록되었습니다.',
      );
    } catch (error) {
      Alert.alert('오류', '결과 저장 중 문제가 발생했습니다.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTimeline();
    setRefreshing(false);
  };

  const formatTimelineDate = (daysFromNow: number, _date: string) => {
    if (daysFromNow === 0) return '오늘';
    if (daysFromNow === 1) return '내일';
    if (daysFromNow === 2) return '모레';
    if (daysFromNow > 0) return `${daysFromNow}일 후`;
    return `${Math.abs(daysFromNow)}일 전`;
  };

  const getStatusColor = (status: 'past' | 'today' | 'future') => {
    switch (status) {
      case 'past':
        return currentTheme.colors.border;
      case 'today':
        return currentTheme.colors.primary;
      case 'future':
        return currentTheme.colors.accent;
      default:
        return currentTheme.colors.border;
    }
  };

  const getStatusIcon = (status: 'past' | 'today' | 'future') => {
    switch (status) {
      case 'past':
        return '📅';
      case 'today':
        return '⭐';
      case 'future':
        return '🚀';
      default:
        return '📅';
    }
  };

  const handleViewEntry = (entry: DiaryEntry) => {
    navigation.navigate('ViewEntry', { entry });
  };

  const handleEditEntry = (entry: DiaryEntry) => {
    navigation.navigate('WriteEntry', { entry, isEdit: true });
  };

  const handleDeleteEntry = async (_entry: DiaryEntry) => {
    Alert.alert('일기 삭제', '정말로 이 일기를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            // 삭제 로직 구현 필요
            await loadTimeline();
          } catch (error) {
            console.error('일기 삭제 중 오류:', error);
            Alert.alert('오류', '일기 삭제 중 오류가 발생했습니다.');
          }
        },
      },
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      loadTimeline();
    }, [loadTimeline]),
  );

  const renderTimelineItem = ({ item }: { item: TimelineItem }) => {
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);

    return (
      <View style={styles.timelineItemContainer}>
        {/* 타임라인 상태 표시 */}
        <View style={styles.timelineStatusContainer}>
          <View
            style={[
              styles.timelineStatusIndicator,
              { backgroundColor: statusColor },
            ]}
          >
            <Text style={styles.timelineStatusIcon}>{statusIcon}</Text>
          </View>
          <View style={styles.timelineStatusTextContainer}>
            <Text style={styles.timelineStatusText}>
              {formatTimelineDate(item.daysFromNow, item.entry.date)}
            </Text>
          </View>
        </View>

        {/* 일기 카드 */}
        <View style={styles.timelineCardContainer}>
          <DiaryCard
            entry={item.entry}
            onPress={handleViewEntry}
            onEdit={handleEditEntry}
            onDelete={handleDeleteEntry}
            variant="timeline"
            showActions={false}
          />

          {/* 결과 추가 버튼 */}
          <TouchableOpacity
            style={styles.resultButton}
            onPress={() => handleAddResult(item.entry)}
          >
            <Icon name="check-circle" size={20} color={statusColor} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTodayEntry = ({ item }: { item: DiaryEntry }) => {
    return (
      <DiaryCard
        entry={item}
        onPress={handleViewEntry}
        onEdit={handleEditEntry}
        onDelete={handleDeleteEntry}
        onAddResult={handleAddResult}
        variant="default"
      />
    );
  };

  if (loading) {
    return (
      <ThemeBackground>
        <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
          <View style={styles.loadingContainer}>
            <Text
              style={[styles.loadingText, { color: currentTheme.colors.text }]}
            >
              타임라인을 불러오는 중...
            </Text>
          </View>
        </View>
      </ThemeBackground>
    );
  }

  return (
    <ThemeBackground>
      <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: currentTheme.colors.text }]}>
            미래 타임라인
          </Text>
        </View>

        {/* 오늘 일기 섹션 */}
        {todayEntries.length > 0 && (
          <View style={styles.todaySection}>
            <Text
              style={[styles.sectionTitle, { color: currentTheme.colors.text }]}
            >
              오늘 일어날 일 ({todayEntries.length})
            </Text>
            <FlatList
              data={todayEntries}
              renderItem={renderTodayEntry}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.todayListContainer}
            />
          </View>
        )}

        {/* 타임라인 섹션 */}
        <View style={styles.timelineSection}>
          <Text
            style={[styles.sectionTitle, { color: currentTheme.colors.text }]}
          >
            미래 일기 ({timelineItems.length})
          </Text>
          <FlatList
            data={timelineItems}
            renderItem={renderTimelineItem}
            keyExtractor={item => item.entry.id}
            contentContainerStyle={styles.timelineListContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[currentTheme.colors.primary]}
                tintColor={currentTheme.colors.primary}
              />
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text
                  style={[
                    styles.emptyText,
                    { color: currentTheme.colors.textSecondary },
                  ]}
                >
                  아직 미래 일기가 없습니다.
                </Text>
                <Text
                  style={[
                    styles.emptySubText,
                    { color: currentTheme.colors.textSecondary },
                  ]}
                >
                  첫 번째 미래 일기를 작성해보세요!
                </Text>
              </View>
            }
          />
        </View>

        {/* 결과 입력 모달 */}
        <Modal
          visible={showResultModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowResultModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowResultModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View
                  style={[
                    styles.modalContent,
                    { backgroundColor: currentTheme.colors.surface },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalTitle,
                      { color: currentTheme.colors.text },
                    ]}
                  >
                    결과 입력
                  </Text>

                  <View style={styles.statusButtons}>
                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        selectedStatus === 'realized' && {
                          backgroundColor: currentTheme.colors.success,
                        },
                      ]}
                      onPress={() => handleSelectStatus('realized')}
                    >
                      <Text style={styles.statusButtonText}>✅ 실현됨</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        selectedStatus === 'not_realized' && {
                          backgroundColor: currentTheme.colors.error,
                        },
                      ]}
                      onPress={() => handleSelectStatus('not_realized')}
                    >
                      <Text style={styles.statusButtonText}>❌ 미실현</Text>
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    style={[
                      styles.resultInput,
                      {
                        backgroundColor: currentTheme.colors.background,
                        color: currentTheme.colors.text,
                        borderColor: currentTheme.colors.border,
                      },
                    ]}
                    placeholder="상세 내용을 입력하세요 (선택사항)"
                    placeholderTextColor={currentTheme.colors.textSecondary}
                    value={actualResultDetail}
                    onChangeText={setActualResultDetail}
                    multiline
                    numberOfLines={4}
                  />

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => setShowResultModal(false)}
                    >
                      <Text style={styles.cancelButtonText}>취소</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.modalButton,
                        styles.saveButton,
                        { backgroundColor: currentTheme.colors.primary },
                      ]}
                      onPress={handleSaveResult}
                    >
                      <Text style={styles.saveButtonText}>저장</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </ThemeBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 8,
  },
  todaySection: {
    marginBottom: 20,
  },
  timelineSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  todayListContainer: {
    paddingHorizontal: 20,
  },
  timelineListContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  timelineItemContainer: {
    marginBottom: 20,
  },
  timelineStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineStatusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timelineStatusIcon: {
    fontSize: 16,
  },
  timelineStatusTextContainer: {
    flex: 1,
  },
  timelineStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timelineCardContainer: {
    position: 'relative',
  },
  resultButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusButtons: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 20,
    textAlignVertical: 'top',
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
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default TimelineScreen;
