import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DiaryEntry, RootStackParamList } from '../types';
import { loadDiaryEntries } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';
import ThemeBackground from '../components/ThemeBackground';

type SearchScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MainTabs'
>;

interface Props {
  navigation: SearchScreenNavigationProp;
}

interface SearchFilters {
  keyword: string;
  startDate: string;
  endDate: string;
}

const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const safeAreaInsets = useSafeAreaInsets();
  const { currentTheme } = useTheme();
  const [allEntries, setAllEntries] = useState<DiaryEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: '',
    startDate: '',
    endDate: '',
  });

  // 카테고리 옵션 매핑 (MyDiaryScreen과 동일)
  const categoryOptionsMap = {
    weather: {
      sunny: '맑음',
      cloudy: '흐림',
      rainy: '비',
      snowy: '눈',
      windy: '바람',
    },
    people: {
      friends: '친구',
      family: '가족',
      lover: '연인',
      acquaintance: '지인',
      alone: '만나지 않음',
    },
    school: {
      class: '수업',
      study: '공부',
      assignment: '과제',
      exam: '시험',
      teamwork: '팀플',
    },
    company: {
      meeting: '회의',
      work: '업무',
      project: '프로젝트',
      presentation: '발표',
      training: '교육',
    },
    travel: {
      airplane: '비행기',
      ship: '배',
      train: '기차',
      bus: '버스',
      car: '승용차',
      motorcycle: '오토바이',
    },
    food: {
      korean: '한식',
      western: '양식',
      chinese: '중식',
      japanese: '일식',
      fast_food: '패스트푸드',
    },
    dessert: {
      cake: '케이크',
      ice_cream: '아이스크림',
      chocolate: '초콜릿',
      cookie: '쿠키',
      fruit: '과일',
    },
    drink: {
      coffee: '커피',
      milk_tea: '밀크티',
      juice: '주스',
      water: '물',
      alcohol: '술',
    },
  };

  const loadEntries = async () => {
    try {
      const entries = await loadDiaryEntries();
      setAllEntries(entries);
      setFilteredEntries([]);
    } catch (error) {
      console.error('일기 로딩 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, []),
  );

  const applyFilters = () => {
    let filtered = allEntries;

    // 키워드 검색 (제목, 내용, 태그, 카테고리 포함)
    if (filters.keyword.trim()) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(entry => {
        // 제목과 내용 검색
        const titleMatch = entry.title.toLowerCase().includes(keyword);
        const contentMatch = entry.content.toLowerCase().includes(keyword);

        // 태그 검색
        let tagMatch = false;
        if (entry.tags && entry.tags.length > 0) {
          tagMatch = entry.tags.some(tag => {
            const tagName = typeof tag === 'string' ? tag : tag.name;
            return tagName.toLowerCase().includes(keyword);
          });
        }

        // 카테고리 검색 (selectedWeather, selectedPeople 등)
        let categoryMatch = false;
        const categoryFields = [
          { field: 'selectedWeather', mapKey: 'weather' },
          { field: 'selectedPeople', mapKey: 'people' },
          { field: 'selectedSchool', mapKey: 'school' },
          { field: 'selectedCompany', mapKey: 'company' },
          { field: 'selectedTravel', mapKey: 'travel' },
          { field: 'selectedFood', mapKey: 'food' },
          { field: 'selectedDessert', mapKey: 'dessert' },
          { field: 'selectedDrink', mapKey: 'drink' },
        ];

        categoryFields.forEach(({ field, mapKey }) => {
          const categoryValues = entry[field as keyof typeof entry] as
            | string[]
            | undefined;
          if (categoryValues && Array.isArray(categoryValues)) {
            categoryValues.forEach(value => {
              // 영어 키 검색
              if (value.toLowerCase().includes(keyword)) {
                categoryMatch = true;
              }
              // 한국어 이름 검색
              const categoryMap =
                categoryOptionsMap[mapKey as keyof typeof categoryOptionsMap];
              const koreanName = (categoryMap as any)[value];
              if (koreanName && koreanName.toLowerCase().includes(keyword)) {
                categoryMatch = true;
              }
            });
          }
        });

        return titleMatch || contentMatch || tagMatch || categoryMatch;
      });
    }

    // 날짜 범위 검색
    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter(entry => {
        const entryDate = entry.date;

        if (filters.startDate && entryDate < filters.startDate) {
          return false;
        }
        if (filters.endDate && entryDate > filters.endDate) {
          return false;
        }
        return true;
      });
    }

    setFilteredEntries(filtered);
  };

  const handleKeywordChange = (text: string) => {
    setFilters(prev => ({ ...prev, keyword: text }));
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      startDate: '',
      endDate: '',
    });
    setFilteredEntries([]);
  };

  const hasActiveSearch = () => {
    return (
      filters.keyword.trim() !== '' ||
      filters.startDate !== '' ||
      filters.endDate !== ''
    );
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

  const renderSearchResult = ({ item }: { item: DiaryEntry }) => {
    const displayEmoji = item.emoji || getMoodEmoji(item.mood);

    return (
      <TouchableOpacity
        style={[styles.resultCard, { backgroundColor: '#FFFFFF' }]}
        onPress={() => navigation.navigate('ViewEntry', { entry: item })}
      >
        <View style={styles.resultHeader}>
          <Text style={styles.resultEmoji}>{displayEmoji}</Text>
          <View style={styles.resultInfo}>
            <Text style={[styles.resultTitle, { color: '#000000' }]}>
              {item.title}
            </Text>
            <Text style={[styles.resultDate, { color: '#666666' }]}>
              {new Date(item.date).toLocaleDateString('ko-KR')}
            </Text>
          </View>
        </View>

        <Text
          style={[styles.resultContent, { color: '#333333' }]}
          numberOfLines={2}
        >
          {item.content}
        </Text>

        {item.tags && item.tags.length > 0 && (
          <View style={styles.resultTags}>
            {item.tags.slice(0, 3).map((tag, index) => {
              const tagInfo =
                typeof tag === 'string'
                  ? { name: tag, icon: '', color: '#e9ecef' }
                  : tag;
              return (
                <View
                  key={index}
                  style={[
                    styles.resultTag,
                    { backgroundColor: tagInfo.color + '20' },
                  ]}
                >
                  {tagInfo.icon && (
                    <Text style={styles.tagIcon}>{tagInfo.icon}</Text>
                  )}
                  <Text
                    style={[styles.tagText, { color: '#333333' }]}
                    numberOfLines={1}
                  >
                    {tagInfo.name}
                  </Text>
                </View>
              );
            })}
            {item.tags.length > 3 && (
              <Text
                style={[
                  styles.moreTagsText,
                  { color: currentTheme.colors.textSecondary },
                ]}
              >
                ...
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ThemeBackground>
        <View
          style={[
            styles.centerContainer,
            { backgroundColor: currentTheme.colors.background },
          ]}
        >
          <Text
            style={[
              styles.loadingText,
              { color: currentTheme.colors.textSecondary },
            ]}
          >
            일기를 불러오는 중...
          </Text>
        </View>
      </ThemeBackground>
    );
  }

  return (
    <ThemeBackground>
      <View
        style={[
          styles.container,
          {
            paddingTop: safeAreaInsets.top,
            backgroundColor: currentTheme.colors.background,
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
            🔍 일기 찾기
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: currentTheme.colors.textSecondary },
            ]}
          >
            키워드, 날짜, 태그로 일기를 검색해보세요
          </Text>
        </View>

        <View
          style={[
            styles.filterContainer,
            { backgroundColor: currentTheme.colors.surface },
          ]}
        >
          {/* 키워드 검색 */}
          <View
            style={[
              styles.filterSection,
              { borderBottomColor: currentTheme.colors.border },
            ]}
          >
            <Text
              style={[styles.filterTitle, { color: currentTheme.colors.text }]}
            >
              🔤 키워드 검색
            </Text>
            <TextInput
              style={[
                styles.keywordInput,
                {
                  backgroundColor: currentTheme.colors.background,
                  borderColor: currentTheme.colors.border,
                  color: currentTheme.colors.text,
                },
              ]}
              value={filters.keyword}
              onChangeText={handleKeywordChange}
              placeholder="제목, 내용, 태그, 카테고리에서 검색..."
              placeholderTextColor={currentTheme.colors.textSecondary}
            />
          </View>

          {/* 검색 버튼 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.searchButton,
                { backgroundColor: currentTheme.colors.primary },
              ]}
              onPress={applyFilters}
            >
              <Text style={styles.searchButtonText}>🔍 검색하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.clearButton,
                { backgroundColor: currentTheme.colors.textSecondary },
              ]}
              onPress={clearFilters}
            >
              <Text style={styles.clearButtonText}>🗑️ 초기화</Text>
            </TouchableOpacity>
          </View>

          {/* 날짜 범위 검색 */}
          <View
            style={[
              styles.filterSection,
              { borderBottomColor: currentTheme.colors.border },
            ]}
          >
            <Text
              style={[styles.filterTitle, { color: currentTheme.colors.text }]}
            >
              📅 날짜 범위 (선택사항)
            </Text>
            <View style={styles.dateRow}>
              <View style={styles.dateInputContainer}>
                <Text
                  style={[
                    styles.dateLabel,
                    { color: currentTheme.colors.textSecondary },
                  ]}
                >
                  시작일
                </Text>
                <TextInput
                  style={[
                    styles.dateInput,
                    {
                      backgroundColor: currentTheme.colors.background,
                      borderColor: currentTheme.colors.border,
                      color: currentTheme.colors.text,
                    },
                  ]}
                  value={filters.startDate}
                  onChangeText={text => handleDateChange('startDate', text)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={currentTheme.colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.dateSeparator,
                  { color: currentTheme.colors.textSecondary },
                ]}
              >
                ~
              </Text>
              <View style={styles.dateInputContainer}>
                <Text
                  style={[
                    styles.dateLabel,
                    { color: currentTheme.colors.textSecondary },
                  ]}
                >
                  종료일
                </Text>
                <TextInput
                  style={[
                    styles.dateInput,
                    {
                      backgroundColor: currentTheme.colors.background,
                      borderColor: currentTheme.colors.border,
                      color: currentTheme.colors.text,
                    },
                  ]}
                  value={filters.endDate}
                  onChangeText={text => handleDateChange('endDate', text)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={currentTheme.colors.textSecondary}
                />
              </View>
            </View>
          </View>
        </View>

        {/* 검색 결과 */}
        <View style={styles.resultsContainer}>
          <Text
            style={[styles.resultsTitle, { color: currentTheme.colors.text }]}
          >
            검색 결과 ({filteredEntries.length}개)
          </Text>

          {!hasActiveSearch() ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text
                style={[
                  styles.emptyText,
                  { color: currentTheme.colors.textSecondary },
                ]}
              >
                검색어를 입력해주세요
              </Text>
              <Text
                style={[
                  styles.emptySubText,
                  { color: currentTheme.colors.textSecondary },
                ]}
              >
                키워드, 날짜, 태그로 일기를 검색할 수 있습니다
              </Text>
            </View>
          ) : filteredEntries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>😔</Text>
              <Text
                style={[
                  styles.emptyText,
                  { color: currentTheme.colors.textSecondary },
                ]}
              >
                검색 결과가 없습니다
              </Text>
              <Text
                style={[
                  styles.emptySubText,
                  { color: currentTheme.colors.textSecondary },
                ]}
              >
                다른 검색 조건을 시도해보세요
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredEntries}
              renderItem={renderSearchResult}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              style={styles.resultsList}
            />
          )}
        </View>
      </View>
    </ThemeBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343a40',
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
  filterContainer: {
    backgroundColor: '#ffffff',
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 12,
  },
  keywordInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInputContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f8f9fa',
  },
  dateSeparator: {
    fontSize: 16,
    color: '#6c757d',
    marginHorizontal: 16,
    marginTop: 16,
  },

  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    color: '#6c757d',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 14,
    color: '#adb5bd',
  },
  resultsList: {
    flex: 1,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 2,
  },
  resultDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  resultContent: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 8,
  },
  resultTags: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    overflow: 'hidden',
  },
  resultTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 6,
  },
  tagIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#495057',
  },
  moreTagsText: {
    fontSize: 10,
    color: '#6c757d',
    fontStyle: 'italic',
  },
});

export default SearchScreen;
