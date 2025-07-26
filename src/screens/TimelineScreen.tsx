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
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../contexts/ThemeContext';
import { DiaryEntry, RootStackParamList } from '../types';
import { loadDiaryEntries, saveDiaryEntry } from '../utils/storage';
import ThemeBackground from '../components/ThemeBackground';
import { WidgetService } from '../services/WidgetService';

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

      // 위젯 데이터 업데이트
      await WidgetService.updateWidgetData(entries, currentTheme);
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
        style={styles.timelineItemHorizontal}
        onPress={() => navigation.navigate('ViewEntry', { entry: item.entry })}
      >
        <View style={styles.timelineContentHorizontal}>
          {/* 위쪽: 아이콘과 연결선 */}
          <View style={styles.timelineTopHorizontal}>
            <View
              style={[
                styles.timelineIconHorizontal,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              <Text style={styles.timelineIconTextHorizontal}>
                {getStatusIcon(item.status)}
              </Text>
            </View>
            {!isLast && item.status !== 'future' && (
              <View
                style={[
                  styles.timelineLineHorizontal,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              />
            )}
          </View>

          {/* 아래쪽: 날짜와 카드 */}
          <View style={styles.timelineBottomHorizontal}>
            <Text
              style={[
                styles.timelineDateHorizontal,
                { color: getStatusColor(item.status) },
              ]}
            >
              {formatTimelineDate(item.daysFromNow, item.entry.date)}
            </Text>

            <View
              style={[
                styles.entryCardHorizontal,
                {
                  borderTopColor: getStatusColor(item.status),
                  backgroundColor: '#FFFFFF',
                },
              ]}
            >
              {/* 1. 제목 섹션: 기분 이모티콘 + 제목 */}
              <View style={styles.titleMoodSectionHorizontal}>
                <Text style={styles.todayEntryEmojiHorizontal}>
                  {displayEmoji}
                </Text>
                <Text
                  style={[styles.todayEntryTitleHorizontal, { flex: 1 }]}
                  numberOfLines={1}
                >
                  {item.entry.title}
                </Text>
              </View>

              {/* 2. 일기 내용 */}
              <Text
                style={styles.todayEntryContentHorizontal}
                numberOfLines={2}
              >
                {item.entry.content}
              </Text>

              {/* 3. 이미지 (있을 경우) */}
              {item.entry.images && item.entry.images.length > 0 && (
                <View style={styles.imageContainerHorizontal}>
                  <Image
                    source={{ uri: item.entry.images[0] }}
                    style={styles.entryImageHorizontal}
                    resizeMode="cover"
                    onError={error => {
                      console.log(
                        '🚨 타임라인 이미지 로딩 오류:',
                        error.nativeEvent.error,
                      );
                      console.log('🚨 문제 이미지 URI:', item.entry.images![0]);
                    }}
                    onLoad={() => {
                      console.log(
                        '✅ 타임라인 이미지 로딩 성공:',
                        item.entry.images![0],
                      );
                    }}
                  />
                  {item.entry.images.length > 1 && (
                    <Text style={styles.imageCountHorizontal}>
                      +{item.entry.images.length - 1}
                    </Text>
                  )}
                </View>
              )}

              {/* 4. 태그 */}
              <View style={styles.tagsContainerHorizontal}>
                {/* 날씨 태그 */}
                {item.entry.selectedWeather &&
                  item.entry.selectedWeather.length > 0 && (
                    <>
                      {item.entry.selectedWeather
                        .slice(0, 1)
                        .map((weather, index) => {
                          const weatherOption = (
                            categoryOptionsMap.weather?.options as any
                          )?.[weather];
                          if (weatherOption) {
                            return (
                              <View
                                key={index}
                                style={[
                                  styles.categoryTagHorizontal,
                                  {
                                    backgroundColor: weatherOption.color,
                                  },
                                ]}
                              >
                                <Text style={styles.categoryTagIconHorizontal}>
                                  {weatherOption.icon}
                                </Text>
                                <Text style={styles.categoryTagTextHorizontal}>
                                  {weatherOption.name}
                                </Text>
                              </View>
                            );
                          }
                          return null;
                        })}
                      {item.entry.selectedWeather.length > 1 && (
                        <Text style={styles.moreCategoriesTextHorizontal}>
                          +{item.entry.selectedWeather.length - 1}
                        </Text>
                      )}
                    </>
                  )}

                {/* 기타 태그 */}
                {item.entry.tags && item.entry.tags.length > 0 && (
                  <>
                    {item.entry.tags.slice(0, 1).map((tag, index) => {
                      const tagInfo =
                        typeof tag === 'string'
                          ? { name: tag, icon: '', color: '#e9ecef' }
                          : tag;
                      return (
                        <View
                          key={index}
                          style={[
                            styles.tagHorizontal,
                            {
                              backgroundColor: tagInfo.color + '20',
                            },
                          ]}
                        >
                          {tagInfo.icon && (
                            <Text style={styles.tagIconHorizontal}>
                              {tagInfo.icon}
                            </Text>
                          )}
                          <Text
                            style={styles.tagTextHorizontal}
                            numberOfLines={1}
                          >
                            #{tagInfo.name}
                          </Text>
                        </View>
                      );
                    })}
                    {item.entry.tags.length > 1 && (
                      <Text style={styles.moreTagsTextHorizontal}>
                        +{item.entry.tags.length - 1}
                      </Text>
                    )}
                  </>
                )}
              </View>
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

    // 디버깅을 위한 로그 추가
    console.log('📱 TimelineScreen renderTodayEntry:', item.title);
    console.log('🖼️ Images:', item.images);
    console.log('📊 Images length:', item.images?.length);

    return (
      <TouchableOpacity
        style={styles.todayEntryCard}
        onPress={() => {
          console.log('🔥 iOS 오늘 일기 카드 클릭됨:', item.title);
          navigation.navigate('ViewEntry', { entry: item });
        }}
        activeOpacity={0.8}
        // iOS 전용 터치 설정
        delayPressIn={0}
        delayPressOut={0}
        delayLongPress={500}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {/* 1. 제목 섹션: 기분 이모티콘 + 제목 */}
        <View style={styles.titleMoodSection}>
          <Text style={styles.todayEntryEmoji}>{displayEmoji}</Text>
          <Text
            style={[styles.todayEntryTitle, { marginLeft: 8, flex: 1 }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
        </View>

        {/* 2. 메인 콘텐츠 섹션: 일기내용 + 이미지 (좌우 분할) */}
        <View style={styles.contentImageSection}>
          {/* 좌측: 일기 내용 + 날씨 태그 */}
          <View style={styles.leftContentSection}>
            <Text style={styles.todayEntryPreviewContent} numberOfLines={2}>
              {item.content}
            </Text>

            {/* 날씨 태그와 기타 태그를 한 줄로 통합 */}
            <View style={styles.allTagsSection}>
              {/* 날씨 태그 */}
              {item.selectedWeather && item.selectedWeather.length > 0 && (
                <>
                  {item.selectedWeather.slice(0, 1).map((weather, index) => {
                    const weatherOption = (
                      categoryOptionsMap.weather?.options as any
                    )?.[weather];
                    if (weatherOption) {
                      return (
                        <View
                          key={index}
                          style={[
                            styles.categoryTag,
                            {
                              backgroundColor: weatherOption.color,
                              marginRight: 6,
                            },
                          ]}
                        >
                          <Text style={styles.categoryTagIcon}>
                            {weatherOption.icon}
                          </Text>
                          <Text style={styles.categoryTagText}>
                            {weatherOption.name}
                          </Text>
                        </View>
                      );
                    }
                    return null;
                  })}
                  {item.selectedWeather.length > 1 && (
                    <Text
                      style={[styles.moreCategoriesText, { marginRight: 6 }]}
                    >
                      +{item.selectedWeather.length - 1}
                    </Text>
                  )}
                </>
              )}

              {/* 기타 태그 */}
              {item.tags && item.tags.length > 0 && (
                <>
                  {item.tags.slice(0, 2).map((tag, index) => {
                    const tagInfo =
                      typeof tag === 'string'
                        ? { name: tag, icon: '', color: '#e9ecef' }
                        : tag;
                    return (
                      <View
                        key={index}
                        style={[
                          styles.tag,
                          {
                            backgroundColor: tagInfo.color + '20',
                            marginRight: 6,
                          },
                        ]}
                      >
                        {tagInfo.icon && (
                          <Text style={styles.tagIcon}>{tagInfo.icon}</Text>
                        )}
                        <Text style={styles.tagText} numberOfLines={1}>
                          #{tagInfo.name}
                        </Text>
                      </View>
                    );
                  })}
                  {item.tags.length > 2 && (
                    <Text style={styles.moreTagsText}>
                      +{item.tags.length - 2}
                    </Text>
                  )}
                </>
              )}
            </View>
          </View>

          {/* 우측: 이미지 (크기 줄임) */}
          {item.images && item.images.length > 0 && (
            <View style={styles.todayEntrySmallImageSection}>
              <View style={styles.todayEntrySmallImageContainer}>
                <Image
                  source={{ uri: item.images![0] }}
                  style={styles.todayEntrySmallImage}
                  resizeMode="cover"
                  onError={error => {
                    console.log(
                      '🚨 TimelineScreen 이미지 로딩 오류:',
                      error.nativeEvent.error,
                    );
                    console.log('🚨 문제 이미지 URI:', item.images![0]);
                  }}
                  onLoad={() => {
                    console.log(
                      '✅ TimelineScreen 이미지 로딩 성공:',
                      item.images![0],
                    );
                  }}
                />
              </View>
              {item.images.length > 1 && (
                <Text style={styles.smallImageCountText}>
                  +{item.images.length - 1}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* 4. 결과 표시 (있을 경우) */}
        {hasResult && (
          <View style={styles.resultSection}>
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
          </View>
        )}

        {/* 5. 버튼 섹션 (전체 너비) */}
        <View style={styles.buttonSection}>
          {hasResult ? (
            <TouchableOpacity
              style={styles.editResultButton}
              onPress={() => handleAddResult(item)}
            >
              <Text style={styles.editResultButtonText}>결과 변경</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.addResultButton}
              onPress={() => handleAddResult(item)}
            >
              <Text style={styles.addResultButtonText}>
                🤔 어떻게 되었나요?
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
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
    <ThemeBackground>
      <View
        style={[
          styles.container,
          {
            backgroundColor: currentTheme.colors.background,
          },
        ]}
      >
        {/* Safe Area Spacer */}
        <View style={{ height: safeAreaInsets.top }} />

        {/* 헤더 섹션 - 15% */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: currentTheme.colors.surface,
              borderBottomColor: currentTheme.colors.border,
              flex: 0.15,
            },
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              flex: 1,
            }}
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
            >
              <Icon name="star" size={22} color="#8B5CF6" />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text
                  style={[
                    styles.headerTitle,
                    { color: currentTheme.colors.text },
                  ]}
                >
                  미래일기 타임라인
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
            </View>

            {/* 천사 테마일 때만 angel01.png 이미지 표시 */}
            {currentTheme.id === 'angel' && (
              <Image
                source={require('../images/angel01.png')}
                style={styles.angelImage}
                resizeMode="contain"
              />
            )}

            {/* 은하수 테마일 때만 enhasu.png 이미지 표시 */}
            {currentTheme.id === 'galaxy-dream' && (
              <Image
                source={require('../images/enhasu.png')}
                style={styles.enhasuImage}
                resizeMode="contain"
                onError={error => console.log('enhasu.png 로드 실패:', error)}
              />
            )}

            {/* 로즈골드 테마일 때만 romance.png 이미지 표시 */}
            {currentTheme.id === 'rosegold-love' && (
              <Image
                source={require('../images/romance.png')}
                style={styles.romanceImage}
                resizeMode="contain"
                onError={error => console.log('romance.png 로드 실패:', error)}
              />
            )}

            {/* 달빛 세레나데 테마일 때만 moonra.png 이미지 표시 */}
            {currentTheme.id === 'moonlight-serenade' && (
              <Image
                source={require('../images/moonra.png')}
                style={styles.moonraImage}
                resizeMode="contain"
                onError={error => console.log('moonra.png 로드 실패:', error)}
              />
            )}
          </View>
        </View>

        {/* 오늘 일어날 일 섹션 - 42.5% */}
        <View
          style={[
            styles.todaySection,
            {
              backgroundColor: currentTheme.colors.surface,
              flex: 0.425,
            },
          ]}
        >
          {todayEntries.length > 0 ? (
            <>
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
                // iOS 기본 설정 (미래 일기와 동일)
                bounces={true}
                alwaysBounceHorizontal={true}
                scrollEnabled={true}
                // iOS와 동일한 snap back 효과
                snapToStart={true}
                snapToAlignment="start"
                snapToInterval={Platform.OS === 'android' ? 316 : undefined}
                // iOS 전용 터치 간섭 방지 설정
                scrollEventThrottle={16}
                canCancelContentTouches={false}
                delaysContentTouches={false}
                // Android에서 iOS와 동일한 경험 제공
                {...(Platform.OS === 'android' && {
                  overScrollMode: 'always',
                  nestedScrollEnabled: true,
                  removeClippedSubviews: false,
                  decelerationRate: 0.9, // 더 부드러운 감속
                  bouncesZoom: false,
                })}
                // iOS와 동일한 스크롤 특성
                automaticallyAdjustContentInsets={false}
              />
            </>
          ) : (
            <View style={styles.emptyTodayContainer}>
              <Text
                style={[
                  styles.emptyTodayText,
                  { color: currentTheme.colors.textSecondary },
                ]}
              >
                오늘 일어날 예정인 일기가 없습니다
              </Text>
            </View>
          )}
        </View>

        {/* 미래 일기 타임라인 섹션 - 42.5% */}
        <View style={[styles.timelineSection, { flex: 0.425 }]}>
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
              showsHorizontalScrollIndicator={false}
              horizontal={true}
            />
          )}
        </View>

        {/* 실제 결과 선택 모달 */}
        <Modal
          visible={showResultModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowResultModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.modalContainer}>
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
                      selectedStatus === 'not_realized' &&
                        styles.selectedOption,
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
                    returnKeyType="done"
                    blurOnSubmit={true}
                    onSubmitEditing={() => {
                      Keyboard.dismiss();
                    }}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flex: 0.15,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    justifyContent: 'center',
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
    borderLeftWidth: 4,
  },
  entryCardContent: {
    flexDirection: 'row',
  },
  entryLeftContent: {
    flex: 1,
  },
  entryRightContent: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: 12,
  },
  entryImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  entryImage: {
    width: '100%',
    height: '100%',
  },
  timelineImageCountBadge: {
    backgroundColor: '#343a40',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  timelineImageCountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
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
    flexWrap: 'nowrap',
    alignItems: 'center',
    overflow: 'hidden',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    flexShrink: 0,
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
    flex: 0.425,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 0,
    backgroundColor: '#fff8e1',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  timelineSection: {
    flex: 0.425,
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    // iOS와 완전히 동일한 레이아웃 제공
    ...Platform.select({
      ios: {
        paddingRight: 50, // iOS 기본 여백
      },
      android: {
        paddingRight: 50, // iOS와 동일한 여백으로 변경
        // snap back을 위한 정확한 크기 설정
        flexGrow: 0,
        alignItems: 'flex-start',
      },
    }),
  },
  todayEntrySeparator: {
    width: 16,
  },
  todayEntryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    width: 300, // iOS와 동일한 카드 크기
    minHeight: 160,
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
  todayEntryCardContent: {
    flexDirection: 'row',
  },
  todayEntryLeftContent: {
    flex: 1,
  },
  // 새로운 레이아웃 스타일들
  titleSection: {
    width: '100%',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  metaImageSection: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metaDataSection: {
    flex: 1,
    paddingRight: 16,
  },
  dateSection: {
    marginBottom: 8,
  },
  moodSection: {
    marginBottom: 8,
    alignItems: 'flex-start',
  },

  todayEntryImageSection: {
    width: 120,
    alignItems: 'center',
  },
  contentSection: {
    width: '100%',
    marginBottom: 16,
  },
  todayEntryFullContent: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
    marginBottom: 12,
  },
  resultSection: {
    width: '100%',
    marginBottom: 16,
  },
  buttonSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343a40',
    textAlign: 'center',
    lineHeight: 28,
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
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
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
    flexWrap: 'nowrap',
    marginTop: 8,
    marginBottom: 8,
    overflow: 'hidden',
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
  // 로즈골드 테마 기준으로 모든 이미지 크기 통일
  themeImageBase: {
    width: 120,
    height: 120,
    opacity: 0.7,
    backgroundColor: 'transparent',
  },
  angelImage: {
    width: 120,
    height: 120,
    opacity: 0.7,
    backgroundColor: 'transparent',
  },
  enhasuImage: {
    width: 120,
    height: 120,
    opacity: 0.7,
    backgroundColor: 'transparent',
  },
  romanceImage: {
    width: 120,
    height: 120,
    opacity: 0.7,
    backgroundColor: 'transparent',
  },
  moonraImage: {
    width: 120,
    height: 120,
    opacity: 0.7,
    backgroundColor: 'transparent',
  },
  todayEntryRightContent: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: 16,
  },
  todayEntryImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  todayEntryImage: {
    width: '100%',
    height: '100%',
  },
  imageCountBadge: {
    backgroundColor: '#343a40',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  imageCountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyTodayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTodayText: {
    fontSize: 16,
    textAlign: 'center',
  },
  moodWeatherSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  titleMoodSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contentImageSection: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  leftContentSection: {
    flex: 1,
    marginRight: 12,
  },
  todayEntryPreviewContent: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 18,
    marginBottom: 6,
  },
  weatherTagsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  allTagsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    marginBottom: 6,
    overflow: 'hidden',
  },
  todayEntrySmallImageSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayEntrySmallImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  todayEntrySmallImage: {
    width: '100%',
    height: '100%',
  },
  smallImageCountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6c757d',
    marginTop: 4,
  },
  // 가로 타임라인 스타일들
  timelineItemHorizontal: {
    marginRight: 16,
    width: 220,
  },
  timelineContentHorizontal: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  timelineTopHorizontal: {
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
  },
  timelineIconHorizontal: {
    minWidth: 60,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    paddingHorizontal: 8,
  },
  timelineIconTextHorizontal: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timelineLineHorizontal: {
    height: 2,
    width: 228,
    marginLeft: 8,
    opacity: 0.3,
  },
  timelineBottomHorizontal: {
    alignItems: 'center',
    width: '100%',
  },
  timelineDateHorizontal: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  entryCardHorizontal: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderTopWidth: 4,
    width: '100%',
  },
  titleMoodSectionHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  todayEntryEmojiHorizontal: {
    fontSize: 16,
    marginRight: 6,
  },
  todayEntryTitleHorizontal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#343a40',
  },
  todayEntryContentHorizontal: {
    fontSize: 12,
    color: '#495057',
    lineHeight: 16,
    marginBottom: 8,
  },
  imageContainerHorizontal: {
    alignItems: 'center',
    marginBottom: 8,
  },
  entryImageHorizontal: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  imageCountHorizontal: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6c757d',
    marginTop: 4,
  },
  tagsContainerHorizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTagHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  categoryTagIconHorizontal: {
    fontSize: 10,
    marginRight: 2,
  },
  categoryTagTextHorizontal: {
    fontSize: 10,
    color: '#495057',
  },
  moreCategoriesTextHorizontal: {
    fontSize: 10,
    color: '#6c757d',
    fontStyle: 'italic',
    marginRight: 4,
  },
  tagHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  tagIconHorizontal: {
    fontSize: 10,
    marginRight: 2,
  },
  tagTextHorizontal: {
    fontSize: 10,
    color: '#495057',
  },
  moreTagsTextHorizontal: {
    fontSize: 10,
    color: '#6c757d',
    fontStyle: 'italic',
  },
});

export default TimelineScreen;
