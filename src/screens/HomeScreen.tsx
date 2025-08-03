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
import DiaryCard from '../components/DiaryCard';
import { WidgetService } from '../services/WidgetService';

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

  const loadEntries = useCallback(async () => {
    try {
      const loadedEntries = await loadDiaryEntries();
      setEntries(loadedEntries);
      await WidgetService.updateWidgetData(loadedEntries, currentTheme);
    } catch (error) {
      Alert.alert('오류', '일기를 불러오는 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [currentTheme]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  };

  const handleDeleteEntry = async (entry: DiaryEntry) => {
    Alert.alert('일기 삭제', '정말로 이 일기를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDiaryEntry(entry.id);
            await loadEntries();
            await WidgetService.updateWidgetData(entries, currentTheme);
          } catch (error) {
            console.error('일기 삭제 중 오류:', error);
            Alert.alert('오류', '일기 삭제 중 오류가 발생했습니다.');
          }
        },
      },
    ]);
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
    }, [loadEntries]),
  );

  const renderEntry = ({ item }: { item: DiaryEntry }) => {
    return (
      <DiaryCard
        entry={item}
        onPress={handleViewEntry}
        onEdit={handleEditEntry}
        onDelete={handleDeleteEntry}
        variant="timeline"
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
              일기를 불러오는 중...
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
            나의 일기장
          </Text>
        </View>

        <FlatList
          data={entries}
          renderItem={renderEntry}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
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
                아직 작성된 일기가 없습니다.
              </Text>
              <Text
                style={[
                  styles.emptySubText,
                  { color: currentTheme.colors.textSecondary },
                ]}
              >
                첫 번째 일기를 작성해보세요!
              </Text>
            </View>
          }
        />

        {/* 일기 작성 플로팅 버튼 */}
        <TouchableOpacity
          style={[
            styles.floatingButton,
            { backgroundColor: currentTheme.colors.primary },
          ]}
          onPress={() => navigation.navigate('WriteEntry', {})}
        >
          <Icon name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
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
  listContainer: {
    paddingBottom: 20,
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
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});

export default HomeScreen;
