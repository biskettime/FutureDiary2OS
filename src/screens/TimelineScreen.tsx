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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../contexts/ThemeContext';
import { DiaryEntry, RootStackParamList } from '../types';
import { loadDiaryEntries, saveDiaryEntry } from '../utils/storage';
import AngelBackground from '../components/AngelBackground';

type TimelineScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MainTabs'
>;

interface Props {
  navigation: TimelineScreenNavigationProp;
}

interface TimelineItem {
  entry: DiaryEntry;
  status: 'past' | 'today' | 'future';
  daysFromNow: number;
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

  // 카테고리별 옵션 정보 (WriteEntryScreen과 동일)
  const categoryOptionsMap = {
    weather: {
      title: '날씨',
      options: {
        sunny: { name: '맑음', icon: '☀️', color: '#FFE066' },
        cloudy: { name: '흐림', icon: '☁️', color: '#E0E0E0' },
        rainy: { name: '비', icon: '🌧️', color: '#81D4FA' },
        snowy: { name: '눈', icon: '❄️', color: '#E1F5FE' },
        windy: { name: '바람', icon: '💨', color: '#B0BEC5' },
      } as const,
    },
    people: {
      title: '사람',
      options: {
        friends: { name: '친구', icon: '⭐', color: '#64B5F6' },
        family: { name: '가족', icon: '🌱', color: '#81C784' },
        lover: { name: '연인', icon: '💖', color: '#F06292' },
        acquaintance: { name: '지인', icon: '😊', color: '#FFB74D' },
        alone: { name: '만나지 않음', icon: '❌', color: '#90A4AE' },
      } as const,
    },
    school: {
      title: '학교',
      options: {
        class: { name: '수업', icon: '📚', color: '#4CAF50' },
        study: { name: '공부', icon: '🔍', color: '#FFC107' },
        assignment: { name: '과제', icon: '📝', color: '#FF9800' },
        exam: { name: '시험', icon: '🌸', color: '#E91E63' },
        teamwork: { name: '팀플', icon: '💬', color: '#4CAF50' },
      } as const,
    },
    company: {
      title: '회사',
      options: {
        meeting: { name: '회의', icon: '👥', color: '#2196F3' },
        work: { name: '업무', icon: '💼', color: '#607D8B' },
        project: { name: '프로젝트', icon: '📊', color: '#9C27B0' },
        presentation: { name: '발표', icon: '🎤', color: '#FF5722' },
        training: { name: '교육', icon: '📖', color: '#795548' },
      } as const,
    },
    travel: {
      title: '여행',
      options: {
        airplane: { name: '비행기', icon: '✈️', color: '#03A9F4' },
        ship: { name: '배', icon: '🚢', color: '#00BCD4' },
        train: { name: '기차', icon: '🚄', color: '#4CAF50' },
        bus: { name: '버스', icon: '🚌', color: '#FF9800' },
        car: { name: '승용차', icon: '🚗', color: '#9E9E9E' },
        motorcycle: { name: '오토바이', icon: '🏍️', color: '#F44336' },
      } as const,
    },
    food: {
      title: '음식',
      options: {
        korean: { name: '한식', icon: '🍚', color: '#8BC34A' },
        western: { name: '양식', icon: '🍝', color: '#FFC107' },
        chinese: { name: '중식', icon: '🥢', color: '#FF5722' },
        japanese: { name: '일식', icon: '🍣', color: '#E91E63' },
        fast_food: { name: '패스트푸드', icon: '🍔', color: '#FF9800' },
      } as const,
    },
    dessert: {
      title: '디저트',
      options: {
        cake: { name: '케이크', icon: '🍰', color: '#F8BBD9' },
        ice_cream: { name: '아이스크림', icon: '🍦', color: '#E1F5FE' },
        chocolate: { name: '초콜릿', icon: '🍫', color: '#8D6E63' },
        cookie: { name: '쿠키', icon: '🍪', color: '#FFCC02' },
        fruit: { name: '과일', icon: '🍓', color: '#4CAF50' },
      } as const,
    },
    drink: {
      title: '음료',
      options: {
        coffee: { name: '커피', icon: '☕', color: '#8D6E63' },
        milk_tea: { name: '밀크티', icon: '🧋', color: '#D7CCC8' },
        juice: { name: '주스', icon: '🧃', color: '#FFC107' },
        water: { name: '물', icon: '💧', color: '#03A9F4' },
        alcohol: { name: '술', icon: '🍺', color: '#FF9800' },
      } as const,
    },
  } as const;

  const loadTimeline = async () => {
    try {
      const entries = await loadDiaryEntries();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayDateString = today.toISOString().split('T')[0];

      console.log('📅 오늘 날짜:', todayDateString);
      console.log('📚 전체 일기 개수:', entries.length);

      // 오늘 날짜에 해당하는 일기들 찾기 (날짜가 오늘인 모든 일기)
      const todayPastEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);

        // 일기의 날짜가 오늘인지 확인 (타임라인 로직과 동일)
        const diffTime = entryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const isToday = diffDays === 0;

        console.log(`📝 일기: ${entry.title}`);
        console.log(`  - 일기 날짜: ${entry.date}`);
        console.log(`  - 일기 날짜 객체: ${entryDate.toDateString()}`);
        console.log(`  - 오늘 날짜: ${todayDateString}`);
        console.log(`  - 오늘 날짜 객체: ${today.toDateString()}`);
        console.log(`  - 날짜 차이 (일): ${diffDays}`);
        console.log(`  - 오늘인가?: ${isToday}`);
        console.log('  ---');

        return isToday;
      });

      console.log('☀️ 오늘 일어날 일 개수:', todayPastEntries.length);
      console.log(
        '☀️ 오늘 일어날 일 목록:',
        todayPastEntries.map(e => e.title),
      );

      setTodayEntries(todayPastEntries);

      const items: TimelineItem[] = entries
        .map(entry => {
          const entryDate = new Date(entry.date);
          entryDate.setHours(0, 0, 0, 0);

          const diffTime = entryDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          let status: 'past' | 'today' | 'future';
          if (diffDays < 0) {
            status = 'past';
          } else if (diffDays === 0) {
            status = 'today';
          } else {
            status = 'future';
          }

          return {
            entry,
            status,
            daysFromNow: diffDays,
          };
        })
        .filter(item => item.status === 'future'); // 미래 일기들만 타임라인에 표시 (오늘 일기는 위 섹션에서 처리)

      // 날짜순으로 정렬 (현재 -> 미래)
      items.sort((a, b) => a.daysFromNow - b.daysFromNow);

      setTimelineItems(items);
    } catch (error) {
      console.error('타임라인 로딩 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

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

  // 화면에 포커스될 때마다 타임라인 새로고침
  useFocusEffect(
    useCallback(() => {
      loadTimeline();
    }, []),
  );

  const formatTimelineDate = (daysFromNow: number, date: string) => {
    const entryDate = new Date(date);
    const dateStr = entryDate.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });

    if (daysFromNow === 0) {
      return `오늘 • ${dateStr}`;
    } else if (daysFromNow === 1) {
      return `내일 • ${dateStr}`;
    } else if (daysFromNow === -1) {
      return `어제 • ${dateStr}`;
    } else if (daysFromNow > 0) {
      return `${daysFromNow}일 후 • ${dateStr}`;
    } else {
      return `${Math.abs(daysFromNow)}일 전 • ${dateStr}`;
    }
  };

  const getStatusColor = (status: 'past' | 'today' | 'future') => {
    switch (status) {
      case 'past':
        return '#4A90E2'; // 연한 파란색 (PAST)
      case 'today':
        return '#2E5BBA'; // 진한 파란색 (PRESENT)
      case 'future':
        return '#8E44AD'; // 보라색 (FUTURE)
    }
  };

  const getStatusIcon = (status: 'past' | 'today' | 'future') => {
    switch (status) {
      case 'past':
        return 'Past';
      case 'today':
        return 'Today';
      case 'future':
        return 'Future';
    }
  };

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case 'excited':
        return '🤩';
      case 'happy':
        return '😊';
      case 'content':
        return '😌';
      case 'neutral':
        return '😐';
      case 'sad':
        return '😢';
      case 'angry':
        return '😠';
      case 'anxious':
        return '😰';
      default:
        return '📝';
    }
  };

  const renderTimelineItem = ({
    item,
    index,
  }: {
    item: TimelineItem;
    index: number;
  }) => {
    const isLast = index === timelineItems.length - 1;
    const displayEmoji = item.entry.emoji || getMoodEmoji(item.entry.mood);

    return (
      <TouchableOpacity
        style={styles.timelineItem}
        onPress={() => navigation.navigate('ViewEntry', { entry: item.entry })}
      >
        <View style={styles.timelineContent}>
          <View style={styles.timelineLeft}>
            <View
              style={[
                styles.timelineIcon,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              <Text style={styles.timelineIconText}>
                {getStatusIcon(item.status)}
              </Text>
            </View>
            {!isLast && (
              <View
                style={[
                  styles.timelineLine,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              />
            )}
          </View>

          <View style={styles.timelineRight}>
            <Text
              style={[
                styles.timelineDate,
                { color: getStatusColor(item.status) },
              ]}
            >
              {formatTimelineDate(item.daysFromNow, item.entry.date)}
            </Text>

            <View style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryMood}>{displayEmoji}</Text>
                <Text style={styles.entryTitle}>{item.entry.title}</Text>
              </View>

              <Text style={styles.entryContent} numberOfLines={2}>
                {item.entry.content}
              </Text>

              {/* 선택된 카테고리들 표시 */}
              {renderSelectedCategories(item.entry)}

              {item.entry.tags && item.entry.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {item.entry.tags.slice(0, 2).map((tag, tagIndex) => {
                    if (typeof tag === 'string') {
                      return (
                        <View
                          key={tagIndex}
                          style={[styles.tag, { backgroundColor: '#e9ecef' }]}
                        >
                          <Text style={[styles.tagText, { color: '#495057' }]}>
                            #{tag}
                          </Text>
                        </View>
                      );
                    } else {
                      return (
                        <View
                          key={tagIndex}
                          style={[styles.tag, { backgroundColor: tag.color }]}
                        >
                          <Text style={styles.tagIcon}>{tag.icon}</Text>
                          <Text style={styles.tagText}>{tag.name}</Text>
                        </View>
                      );
                    }
                  })}
                  {item.entry.tags.length > 2 && (
                    <Text style={styles.moreTagsText}>
                      +{item.entry.tags.length - 2}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTodayEntry = ({ item }: { item: DiaryEntry }) => {
    const displayEmoji = item.emoji || getMoodEmoji(item.mood);
    const hasResult =
      item.resultStatus ||
      (item.actualResult && item.actualResult.trim().length > 0);

    return (
      <View style={styles.todayEntryCard}>
        <View style={styles.todayEntryHeader}>
          <Text style={styles.todayEntryEmoji}>{displayEmoji}</Text>
          <View style={styles.todayEntryInfo}>
            <Text style={styles.todayEntryTitle}>{item.title}</Text>
            <Text style={styles.todayEntryDate}>
              {new Date(item.createdAt).toLocaleDateString('ko-KR')}에 작성
            </Text>
          </View>
        </View>

        <Text style={styles.todayEntryContent} numberOfLines={2}>
          {item.content}
        </Text>

        {/* 선택된 카테고리들 표시 */}
        {renderSelectedCategories(item)}

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagContainer}>
            {item.tags.slice(0, 3).map((tag, index) => {
              const tagInfo =
                typeof tag === 'string'
                  ? { name: tag, icon: '', color: '#e9ecef' }
                  : tag;
              return (
                <View
                  key={index}
                  style={[
                    styles.tag,
                    { backgroundColor: tagInfo.color + '20' },
                  ]}
                >
                  {tagInfo.icon && (
                    <Text style={styles.tagIcon}>{tagInfo.icon}</Text>
                  )}
                  <Text style={styles.tagText}>{tagInfo.name}</Text>
                </View>
              );
            })}
            {item.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{item.tags.length - 3}</Text>
            )}
          </View>
        )}

        {hasResult ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>실제 결과:</Text>
            <View
              style={[
                styles.resultStatusContainer,
                item.resultStatus === 'realized'
                  ? styles.realizedResult
                  : styles.notRealizedResult,
              ]}
            >
              <Text
                style={[
                  styles.resultStatusText,
                  item.resultStatus === 'realized'
                    ? styles.realizedText
                    : styles.notRealizedText,
                ]}
              >
                {item.resultStatus === 'realized'
                  ? '✅ 이루어졌어요! 😊'
                  : '❌ 아직 실현되지 않았어요:('}
              </Text>
              {item.actualResult &&
                item.actualResult !== '✅ 이루어졌어요! 😊' &&
                item.actualResult !== '❌ 아직 실현되지 않았어요:(' && (
                  <Text style={styles.resultDetailText}>
                    {item.actualResult.replace(
                      /^(✅ 이루어졌어요! 😊|❌ 아직 실현되지 않았어요:\()\n\n/,
                      '',
                    )}
                  </Text>
                )}
            </View>
            <TouchableOpacity
              style={styles.editResultButton}
              onPress={() => handleAddResult(item)}
            >
              <Text style={styles.editResultButtonText}>변경</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addResultButton}
            onPress={() => handleAddResult(item)}
          >
            <Text style={styles.addResultButtonText}>🤔 어떻게 되었나요?</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // 선택된 카테고리들을 렌더링하는 함수
  const renderSelectedCategories = (entry: DiaryEntry) => {
    const categories = [
      { key: 'selectedWeather', mapKey: 'weather' },
      { key: 'selectedPeople', mapKey: 'people' },
      { key: 'selectedSchool', mapKey: 'school' },
      { key: 'selectedCompany', mapKey: 'company' },
      { key: 'selectedTravel', mapKey: 'travel' },
      { key: 'selectedFood', mapKey: 'food' },
      { key: 'selectedDessert', mapKey: 'dessert' },
      { key: 'selectedDrink', mapKey: 'drink' },
    ];

    const selectedItems: Array<{ icon: string; name: string; color: string }> =
      [];

    categories.forEach(({ key, mapKey }) => {
      const selectedValues = entry[key as keyof DiaryEntry] as
        | string[]
        | undefined;
      if (selectedValues && selectedValues.length > 0) {
        selectedValues.forEach(value => {
          const categoryMap =
            categoryOptionsMap[mapKey as keyof typeof categoryOptionsMap];
          if (categoryMap && categoryMap.options) {
            const option = (categoryMap.options as any)[value];
            if (option && option.icon && option.name && option.color) {
              selectedItems.push({
                icon: option.icon,
                name: option.name,
                color: option.color,
              });
            }
          }
        });
      }
    });

    if (selectedItems.length === 0) return null;

    return (
      <View style={styles.categoriesContainer}>
        {selectedItems.slice(0, 3).map((item, index) => (
          <View
            key={index}
            style={[styles.categoryTag, { backgroundColor: item.color }]}
          >
            <Text style={styles.categoryTagIcon}>{item.icon}</Text>
            <Text style={styles.categoryTagText}>{item.name}</Text>
          </View>
        ))}
        {selectedItems.length > 3 && (
          <Text style={styles.moreCategoriesText}>
            +{selectedItems.length - 3}
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>타임라인을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <AngelBackground>
      <View
        style={[
          styles.container,
          {
            backgroundColor: currentTheme.colors.background,
            paddingTop: safeAreaInsets.top,
          },
        ]}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: currentTheme.colors.surface,
              borderBottomColor: currentTheme.colors.border,
            },
          ]}
        >
          <Text
            style={[styles.headerTitle, { color: currentTheme.colors.text }]}
          >
            {currentTheme.icons.home} 미래일기 타임라인
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: currentTheme.colors.textSecondary },
            ]}
          >
            오늘부터 시작되는 나의 미래 여행
          </Text>
        </View>

        {/* 오늘 일어날 일 섹션 */}
        {todayEntries.length > 0 && (
          <View
            style={[
              styles.todaySection,
              { backgroundColor: currentTheme.colors.surface },
            ]}
          >
            <View style={styles.todaySectionTitleContainer}>
              <Text
                style={[
                  styles.todaySectionTitle,
                  { color: currentTheme.colors.text },
                ]}
              >
                ☀️ 오늘 일어날 일!
              </Text>
              <Text
                style={[
                  styles.todayBadge,
                  {
                    backgroundColor: currentTheme.colors.primary,
                    color: currentTheme.colors.background,
                  },
                ]}
              >
                Today
              </Text>
            </View>
            <Text
              style={[
                styles.todaySectionSubtitle,
                { color: currentTheme.colors.textSecondary },
              ]}
            >
              과거에 작성했던 오늘의 예상 일정들입니다
            </Text>
            <FlatList
              data={todayEntries}
              renderItem={renderTodayEntry}
              keyExtractor={item => item.id}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.todayEntriesContainer}
              ItemSeparatorComponent={() => (
                <View style={styles.todayEntrySeparator} />
              )}
            />
          </View>
        )}

        {timelineItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text
              style={[styles.emptyText, { color: currentTheme.colors.text }]}
            >
              아직 작성된 일기가 없습니다.
            </Text>
            <Text
              style={[
                styles.emptySubText,
                { color: currentTheme.colors.textSecondary },
              ]}
            >
              미래의 나에게 보낼 첫 번째 일기를 작성해보세요!
            </Text>
            <TouchableOpacity
              style={[
                styles.emptyButton,
                { backgroundColor: currentTheme.colors.primary },
              ]}
              onPress={() => navigation.navigate('WriteEntry', {})}
            >
              <Text
                style={[
                  styles.emptyButtonText,
                  { color: currentTheme.colors.background },
                ]}
              >
                미래일기 쓰기
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={timelineItems}
            renderItem={renderTimelineItem}
            keyExtractor={item => item.entry.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* 실제 결과 선택 모달 */}
        <Modal
          visible={showResultModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowResultModal(false)}
        >
          <View style={styles.modalContainer}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: currentTheme.colors.surface },
              ]}
            >
              <Text
                style={[styles.modalTitle, { color: currentTheme.colors.text }]}
              >
                실제 결과 기록
              </Text>
              <Text
                style={[
                  styles.modalSubtitle,
                  { color: currentTheme.colors.textSecondary },
                ]}
              >
                "{selectedEntry?.title}"에 대한 결과를 기록해주세요
              </Text>

              <View style={styles.resultOptionContainer}>
                <TouchableOpacity
                  style={[
                    styles.resultOption,
                    styles.realizedOption,
                    selectedStatus === 'realized' && styles.selectedOption,
                  ]}
                  onPress={() => handleSelectStatus('realized')}
                >
                  <Text style={styles.resultOptionEmoji}>✅</Text>
                  <Text
                    style={[
                      styles.resultOptionText,
                      { color: currentTheme.colors.text },
                    ]}
                  >
                    이루어졌어요! 😊
                  </Text>
                  <Text
                    style={[
                      styles.resultOptionDescription,
                      { color: currentTheme.colors.textSecondary },
                    ]}
                  >
                    예상했던 일이 실제로 일어났어요
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.resultOption,
                    styles.notRealizedOption,
                    selectedStatus === 'not_realized' && styles.selectedOption,
                  ]}
                  onPress={() => handleSelectStatus('not_realized')}
                >
                  <Text style={styles.resultOptionEmoji}>❌</Text>
                  <Text
                    style={[
                      styles.resultOptionText,
                      { color: currentTheme.colors.text },
                    ]}
                  >
                    아직 실현되지 않았어요:(
                  </Text>
                  <Text
                    style={[
                      styles.resultOptionDescription,
                      { color: currentTheme.colors.textSecondary },
                    ]}
                  >
                    예상과 다르게 일어나지 않았어요
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.detailInputContainer}>
                <Text
                  style={[
                    styles.detailInputLabel,
                    { color: currentTheme.colors.text },
                  ]}
                >
                  실제로 일어난 일을 기록해주세요
                </Text>
                <TextInput
                  style={[
                    styles.detailInput,
                    {
                      backgroundColor: currentTheme.colors.background,
                      borderColor: currentTheme.colors.border,
                      color: currentTheme.colors.text,
                    },
                  ]}
                  value={actualResultDetail}
                  onChangeText={setActualResultDetail}
                  placeholder="자세한 내용을 입력해주세요... (선택사항)"
                  placeholderTextColor={currentTheme.colors.textSecondary}
                  multiline
                  textAlignVertical="top"
                  maxLength={500}
                />
              </View>

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    { backgroundColor: currentTheme.colors.textSecondary },
                  ]}
                  onPress={() => setShowResultModal(false)}
                >
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    { backgroundColor: currentTheme.colors.success },
                    !selectedStatus && styles.disabledButton,
                  ]}
                  onPress={handleSaveResult}
                  disabled={!selectedStatus}
                >
                  <Text
                    style={[
                      styles.saveButtonText,
                      !selectedStatus && styles.disabledButtonText,
                    ]}
                  >
                    저장
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </AngelBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6c757d',
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#495057',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  timelineItem: {
    marginBottom: 20,
  },
  timelineContent: {
    flexDirection: 'row',
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIcon: {
    minWidth: 60,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    paddingHorizontal: 8,
  },
  timelineIconText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 8,
    opacity: 0.3,
  },
  timelineRight: {
    flex: 1,
  },
  timelineDate: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  entryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryMood: {
    fontSize: 20,
    marginRight: 8,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343a40',
    flex: 1,
  },
  entryContent: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#495057',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  tagIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  todaySection: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 0,
    backgroundColor: '#fff8e1',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  todaySectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  todaySectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f57c00',
    marginRight: 8,
  },
  todayBadge: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#2E5BBA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    transform: [{ rotate: '-10deg' }],
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  todaySectionSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  todayEntriesContainer: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  todayEntrySeparator: {
    width: 12,
  },
  todayEntryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#f57c00',
  },
  todayEntryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  todayEntryEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  todayEntryInfo: {
    flex: 1,
  },
  todayEntryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 4,
  },
  todayEntryDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  todayEntryContent: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 12,
  },
  resultContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  resultStatusContainer: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  resultStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#343a40',
  },
  realizedResult: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
  },
  notRealizedResult: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
  },
  realizedText: {
    color: '#155724',
  },
  notRealizedText: {
    color: '#721c24',
  },
  resultDetailText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  editResultButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#6c757d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editResultButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  addResultButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addResultButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343a40',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  resultOptionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  resultOption: {
    flex: 1,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 8,
    alignItems: 'center',
  },
  resultOptionEmoji: {
    fontSize: 20,
    marginBottom: 8,
  },
  resultOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#343a40',
  },
  resultOptionDescription: {
    fontSize: 12,
    color: '#6c757d',
  },
  realizedOption: {
    borderColor: '#28a745',
  },
  notRealizedOption: {
    borderColor: '#dc3545',
  },
  selectedOption: {
    borderColor: '#007bff',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#e9ecef',
  },
  disabledButtonText: {
    color: '#6c757d',
  },
  detailInputContainer: {
    marginBottom: 20,
  },
  detailInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 8,
  },
  detailInput: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 8,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  categoryTagIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryTagText: {
    fontSize: 12,
    color: '#495057',
  },
  moreCategoriesText: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
});

export default TimelineScreen;
