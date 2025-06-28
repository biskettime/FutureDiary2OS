import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {loadDiaryEntries} from '../utils/storage';
import {DiaryEntry as StorageDiaryEntry} from '../types';
import {
  formatDateToMonthDay,
  getDayOfWeek,
  getDateStatus,
} from '../utils/dateUtils';

interface DiaryEntry {
  id: string;
  date: string;
  dayOfWeek: string;
  mood: string;
  moodColor: string;
  content: string;
  title: string;
  image?: string;
  actualResult?: string;
  originalEntry?: StorageDiaryEntry;
}

interface YearSection {
  year: string;
  entries: DiaryEntry[];
}

const MyDiaryScreen: React.FC = () => {
  const [diaryData, setDiaryData] = useState<YearSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 카테고리별 옵션 정보 (WriteEntryScreen과 동일)
  const categoryOptionsMap = {
    weather: {
      title: '날씨',
      options: {
        sunny: {name: '맑음', icon: '☀️', color: '#FFE066'},
        cloudy: {name: '흐림', icon: '☁️', color: '#E0E0E0'},
        rainy: {name: '비', icon: '🌧️', color: '#81D4FA'},
        snowy: {name: '눈', icon: '❄️', color: '#E1F5FE'},
        windy: {name: '바람', icon: '💨', color: '#B0BEC5'},
      } as const,
    },
    people: {
      title: '사람',
      options: {
        friends: {name: '친구', icon: '⭐', color: '#64B5F6'},
        family: {name: '가족', icon: '🌱', color: '#81C784'},
        lover: {name: '연인', icon: '💖', color: '#F06292'},
        acquaintance: {name: '지인', icon: '😊', color: '#FFB74D'},
        alone: {name: '만나지 않음', icon: '❌', color: '#90A4AE'},
      } as const,
    },
    school: {
      title: '학교',
      options: {
        class: {name: '수업', icon: '📚', color: '#4CAF50'},
        study: {name: '공부', icon: '🔍', color: '#FFC107'},
        assignment: {name: '과제', icon: '📝', color: '#FF9800'},
        exam: {name: '시험', icon: '🌸', color: '#E91E63'},
        teamwork: {name: '팀플', icon: '💬', color: '#4CAF50'},
      } as const,
    },
    company: {
      title: '회사',
      options: {
        meeting: {name: '회의', icon: '👥', color: '#2196F3'},
        work: {name: '업무', icon: '💼', color: '#607D8B'},
        project: {name: '프로젝트', icon: '📊', color: '#9C27B0'},
        presentation: {name: '발표', icon: '🎤', color: '#FF5722'},
        training: {name: '교육', icon: '📖', color: '#795548'},
      } as const,
    },
    travel: {
      title: '여행',
      options: {
        airplane: {name: '비행기', icon: '✈️', color: '#03A9F4'},
        ship: {name: '배', icon: '🚢', color: '#00BCD4'},
        train: {name: '기차', icon: '🚄', color: '#4CAF50'},
        bus: {name: '버스', icon: '🚌', color: '#FF9800'},
        car: {name: '승용차', icon: '🚗', color: '#9E9E9E'},
        motorcycle: {name: '오토바이', icon: '🏍️', color: '#F44336'},
      } as const,
    },
    food: {
      title: '음식',
      options: {
        korean: {name: '한식', icon: '🍚', color: '#8BC34A'},
        western: {name: '양식', icon: '🍝', color: '#FFC107'},
        chinese: {name: '중식', icon: '🥢', color: '#FF5722'},
        japanese: {name: '일식', icon: '🍣', color: '#E91E63'},
        fast_food: {name: '패스트푸드', icon: '🍔', color: '#FF9800'},
      } as const,
    },
    dessert: {
      title: '디저트',
      options: {
        cake: {name: '케이크', icon: '🍰', color: '#F8BBD9'},
        ice_cream: {name: '아이스크림', icon: '🍦', color: '#E1F5FE'},
        chocolate: {name: '초콜릿', icon: '🍫', color: '#8D6E63'},
        cookie: {name: '쿠키', icon: '🍪', color: '#FFCC02'},
        fruit: {name: '과일', icon: '🍓', color: '#4CAF50'},
      } as const,
    },
    drink: {
      title: '음료',
      options: {
        coffee: {name: '커피', icon: '☕', color: '#8D6E63'},
        milk_tea: {name: '밀크티', icon: '🧋', color: '#D7CCC8'},
        juice: {name: '주스', icon: '🧃', color: '#FFC107'},
        water: {name: '물', icon: '💧', color: '#03A9F4'},
        alcohol: {name: '술', icon: '🍺', color: '#FF9800'},
      } as const,
    },
  } as const;

  // 기분에 따른 이모지와 색상 매핑
  const getMoodDisplay = (mood?: string) => {
    const moodMap = {
      excited: {emoji: '🤩', color: '#ff6b6b'},
      happy: {emoji: '😊', color: '#4ecdc4'},
      content: {emoji: '😌', color: '#45b7d1'},
      neutral: {emoji: '😐', color: '#96ceb4'},
      sad: {emoji: '😢', color: '#74b9ff'},
      angry: {emoji: '😠', color: '#fd79a8'},
      anxious: {emoji: '😰', color: '#fdcb6e'},
    };

    return (
      moodMap[mood as keyof typeof moodMap] || {emoji: '😊', color: '#4ecdc4'}
    );
  };

  // 저장된 일기들을 화면용 형식으로 변환
  const convertStorageEntryToDisplay = useCallback(
    (entry: StorageDiaryEntry): DiaryEntry => {
      const moodDisplay = getMoodDisplay(entry.mood);
      return {
        id: entry.id,
        date: formatDateToMonthDay(entry.date), // 화면 표시용 (예: "12월 25일")
        dayOfWeek: getDayOfWeek(entry.date),
        mood: moodDisplay.emoji,
        moodColor: moodDisplay.color,
        content: entry.content,
        title: entry.title,
        actualResult: entry.actualResult,
        originalEntry: entry, // ⚠️ 중요: 날짜 상태 판별을 위해 원본 데이터 보존 필수
      };
    },
    [],
  );

  // 저장된 일기들을 연도별로 그룹화하는 함수
  const groupEntriesByYear = useCallback(
    (entries: StorageDiaryEntry[]): YearSection[] => {
      const grouped = entries.reduce((acc, entry) => {
        const year = new Date(entry.date).getFullYear().toString();
        if (!acc[year]) {
          acc[year] = [];
        }
        acc[year].push(convertStorageEntryToDisplay(entry));
        return acc;
      }, {} as Record<string, DiaryEntry[]>);

      // 연도별로 정렬 (최신 연도부터)
      return Object.keys(grouped)
        .sort((a: string, b: string) => parseInt(b) - parseInt(a))
        .map(year => ({
          year,
          entries: grouped[year].sort(
            (a: DiaryEntry, b: DiaryEntry) =>
              new Date(b.date + ' 2024').getTime() -
              new Date(a.date + ' 2024').getTime(),
          ),
        }));
    },
    [convertStorageEntryToDisplay],
  );

  const getStatusColor = (status: 'past' | 'today' | 'future') => {
    switch (status) {
      case 'past':
        return '#4A90E2'; // 연한 파란색 (PAST)
      case 'today':
        return '#2E5BBA'; // 진한 파란색 (NOW)
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

  const loadData = useCallback(async () => {
    try {
      const entries = await loadDiaryEntries();
      if (entries && entries.length > 0) {
        const groupedByYear = groupEntriesByYear(entries);
        setDiaryData(groupedByYear);
      } else {
        setDiaryData([]);
      }
    } catch (error) {
      console.error('일기 데이터 로드 실패:', error);
      setDiaryData([]);
    }
  }, [groupEntriesByYear]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      await loadData();
      setIsLoading(false);
    };

    initializeData();
  }, [loadData]);

  // 화면이 포커스될 때마다 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>일기를 불러오는 중...</Text>
      </View>
    );
  }

  const renderMoodIcon = (mood: string, color: string) => (
    <View style={[styles.moodContainer, {backgroundColor: color}]}>
      <Text style={styles.moodEmoji}>{mood}</Text>
    </View>
  );

  // 선택된 카테고리들을 렌더링하는 함수
  const renderSelectedCategories = (entry: StorageDiaryEntry) => {
    const categories = [
      {key: 'selectedWeather', mapKey: 'weather'},
      {key: 'selectedPeople', mapKey: 'people'},
      {key: 'selectedSchool', mapKey: 'school'},
      {key: 'selectedCompany', mapKey: 'company'},
      {key: 'selectedTravel', mapKey: 'travel'},
      {key: 'selectedFood', mapKey: 'food'},
      {key: 'selectedDessert', mapKey: 'dessert'},
      {key: 'selectedDrink', mapKey: 'drink'},
    ];

    const selectedItems: Array<{icon: string; name: string; color: string}> =
      [];

    categories.forEach(({key, mapKey}) => {
      const selectedValues = entry[key as keyof StorageDiaryEntry] as
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
        <Text style={styles.categoriesTitle}>카테고리</Text>
        <View style={styles.categoryTagsContainer}>
          {selectedItems.map((item, index) => (
            <View
              key={index}
              style={[styles.categoryTag, {backgroundColor: item.color}]}>
              <Text style={styles.categoryTagIcon}>{item.icon}</Text>
              <Text style={styles.categoryTagText}>{item.name}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderDiaryEntry = (entry: DiaryEntry) => {
    // 날짜 상태 판별: 원본 날짜(YYYY-MM-DD 형식)를 사용해야 함
    // entry.date는 "12월 25일" 형식으로 변환된 것이므로 getDateStatus에 사용할 수 없음
    const status = getDateStatus(entry.originalEntry?.date || entry.date);

    return (
      <TouchableOpacity
        key={entry.id}
        style={styles.entryCard}
        activeOpacity={0.8}>
        <View style={styles.entryHeader}>
          {renderMoodIcon(entry.mood, entry.moodColor)}
          <View style={styles.dateContainer}>
            <View style={styles.dateRow}>
              <Text style={styles.dateText}>{entry.date}</Text>
              <View
                style={[
                  styles.statusIcon,
                  {backgroundColor: getStatusColor(status)},
                ]}>
                <Text style={styles.statusIconText}>
                  {getStatusIcon(status)}
                </Text>
              </View>
            </View>
            <Text style={styles.dayText}>{entry.dayOfWeek}</Text>
          </View>
        </View>

        {entry.title && <Text style={styles.titleText}>{entry.title}</Text>}

        <Text style={styles.contentText}>{entry.content}</Text>

        {/* 선택된 카테고리들 표시 */}
        {entry.originalEntry && renderSelectedCategories(entry.originalEntry)}

        {/* 타임라인에서 입력한 실제 결과 표시 */}
        {entry.actualResult && (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultLabel}>실제 결과</Text>
              {entry.originalEntry?.resultStatus === 'realized' && (
                <View style={styles.resultStatusIcon}>
                  <Text style={styles.resultStatusText}>✅ 실현됨</Text>
                </View>
              )}
              {entry.originalEntry?.resultStatus === 'not_realized' && (
                <View style={[styles.resultStatusIcon, styles.notRealizedIcon]}>
                  <Text style={styles.resultStatusText}>❌ 실현안됨</Text>
                </View>
              )}
            </View>
            <Text style={styles.resultText}>{entry.actualResult}</Text>
          </View>
        )}

        {entry.image && (
          <View style={styles.imageContainer}>
            <View style={styles.placeholderImage}>
              <Text style={styles.imageText}>📸 서울 타워 사진</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderYearSection = (yearSection: YearSection) => (
    <View key={yearSection.year} style={styles.yearSection}>
      <Text style={styles.yearTitle}>{yearSection.year}</Text>
      <View style={styles.entriesContainer}>
        {yearSection.entries.map(renderDiaryEntry)}
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>나의 일기장</Text>
        <Text style={styles.headerSubtitle}>소중한 순간들을 되돌아보세요</Text>
      </View>

      {diaryData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📔</Text>
          <Text style={styles.emptyTitle}>아직 작성한 일기가 없어요</Text>
          <Text style={styles.emptySubtitle}>
            첫 번째 일기를 작성해서{'\n'}소중한 순간을 기록해보세요!
          </Text>
        </View>
      ) : (
        diaryData.map(renderYearSection)
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>더 많은 추억을 만들어가세요 ✨</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D3142',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8B8B8B',
  },
  yearSection: {
    marginTop: 40,
  },
  yearTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3142',
    textAlign: 'center',
    marginBottom: 30,
  },
  entriesContainer: {
    paddingHorizontal: 20,
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  moodContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  moodEmoji: {
    fontSize: 20,
  },
  dateContainer: {
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3142',
    marginRight: 8,
  },
  dayText: {
    fontSize: 14,
    color: '#8B8B8B',
  },
  imageContainer: {
    marginBottom: 16,
  },
  placeholderImage: {
    height: 200,
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageText: {
    fontSize: 16,
    color: '#5A9FD4',
    fontWeight: '500',
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4A4A4A',
  },
  footer: {
    padding: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#8B8B8B',
    fontStyle: 'italic',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8B8B8B',
    fontStyle: 'italic',
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3142',
    marginBottom: 4,
  },
  resultContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#E8F4FD',
    borderRadius: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3142',
    marginRight: 8,
  },
  resultStatusIcon: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  resultStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resultText: {
    fontSize: 16,
    color: '#2D3142',
  },
  categoriesContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  categoriesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3142',
    marginBottom: 8,
  },
  categoryTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginRight: 6,
    marginBottom: 6,
  },
  categoryTagIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryTagText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  statusIcon: {
    padding: 4,
    borderRadius: 8,
  },
  statusIconText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
    minHeight: 400,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3142',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8B8B8B',
    textAlign: 'center',
  },
  notRealizedIcon: {
    backgroundColor: '#FF9800',
  },
});

export default MyDiaryScreen;
