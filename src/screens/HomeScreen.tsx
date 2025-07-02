import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { RootStackParamList, DiaryEntry } from '../types';
import { loadDiaryEntries, deleteDiaryEntry } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';
import ThemeBackground from '../components/ThemeBackground';

type HomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MainTabs'
>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const safeAreaInsets = useSafeAreaInsets();
  const { currentTheme } = useTheme();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 카테고리별 옵션 정보 (타임라인과 동일)
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

  const getBorderColor = (entryDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entry = new Date(entryDate);
    entry.setHours(0, 0, 0, 0);

    const diffTime = entry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return '#4A90E2'; // 과거 - 연한 파란색
    } else if (diffDays === 0) {
      return '#f57c00'; // 오늘 - 오렌지색
    } else {
      return '#8E44AD'; // 미래 - 보라색
    }
  };

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

  const loadEntries = async () => {
    try {
      const loadedEntries = await loadDiaryEntries();
      setEntries(loadedEntries);
    } catch (error) {
      Alert.alert('오류', '일기를 불러오는 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteDiaryEntry(id);
      setEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (error) {
      Alert.alert('오류', '일기 삭제 중 문제가 발생했습니다.');
    }
  };

  const handleEditEntry = (entry: DiaryEntry) => {
    navigation.navigate('WriteEntry', { entry, isEdit: true });
  };

  const handleViewEntry = (entry: DiaryEntry) => {
    navigation.navigate('ViewEntry', { entry });
  };

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, []),
  );

  const renderEntry = ({ item }: { item: DiaryEntry }) => {
    const displayEmoji = item.emoji || getMoodEmoji(item.mood);
    const borderColor = getBorderColor(item.date);

    return (
      <TouchableOpacity
        style={[styles.entryCard, { borderLeftColor: borderColor }]}
        onPress={() => handleViewEntry(item)}
      >
        <View style={styles.entryHeader}>
          <Text style={styles.entryMood}>{displayEmoji}</Text>
          <Text style={[styles.entryTitle, { color: '#343a40', flex: 1 }]}>
            {item.title}
          </Text>
          <View style={styles.entryActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditEntry(item)}
            >
              <Icon name="edit-3" size={16} color="#6c757d" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                Alert.alert('일기 삭제', '정말로 이 일기를 삭제하시겠습니까?', [
                  { text: '취소', style: 'cancel' },
                  {
                    text: '삭제',
                    style: 'destructive',
                    onPress: () => handleDeleteEntry(item.id),
                  },
                ]);
              }}
            >
              <Icon name="trash-2" size={16} color="#dc3545" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.entryContent} numberOfLines={2}>
          {item.content}
        </Text>

        {/* 선택된 카테고리들 표시 */}
        {renderSelectedCategories(item)}

        {/* 태그 표시 */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 2).map((tag, tagIndex) => {
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
            {item.tags.length > 2 && (
              <Text style={styles.moreTagsText}>+{item.tags.length - 2}</Text>
            )}
          </View>
        )}

        <View style={styles.entryFooter}>
          <Text style={styles.entryDate}>
            {new Date(item.date).toLocaleDateString('ko-KR')}
          </Text>
          <Text style={styles.createdDate}>
            {new Date(item.createdAt).toLocaleDateString('ko-KR')}에 작성
          </Text>
        </View>
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
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="edit-3" size={22} color={currentTheme.colors.primary} />
            <Text
              style={[
                styles.headerTitle,
                { color: currentTheme.colors.text, marginLeft: 8 },
              ]}
            >
              내가 쓴 일기들
            </Text>
          </View>
          <Text
            style={[
              styles.headerSubtitle,
              { color: currentTheme.colors.textSecondary },
            ]}
          >
            미래의 나에게 보낸 소중한 기록들
          </Text>
        </View>

        {entries.length === 0 ? (
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
          <>
            <FlatList
              data={entries}
              renderItem={renderEntry}
              keyExtractor={item => item.id}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}

        {/* 플로팅 액션 버튼 */}
        <TouchableOpacity
          style={[
            styles.floatingButton,
            { backgroundColor: currentTheme.colors.primary },
          ]}
          onPress={() => navigation.navigate('WriteEntry', {})}
        >
          <Icon name="plus" size={28} color={currentTheme.colors.background} />
        </TouchableOpacity>
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
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 100, // 플로팅 버튼 공간 확보
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonText: {
    fontSize: 24,
  },
  entryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  },
  entryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
  },
  entryContent: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 12,
  },
  entryDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  createdDate: {
    fontSize: 12,
    color: '#6c757d',
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
  tagIcon: {
    fontSize: 12,
    marginRight: 4,
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
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
});

export default HomeScreen;
