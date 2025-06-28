import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useFocusEffect} from '@react-navigation/native';
import {RootStackParamList, DiaryEntry} from '../types';
import {loadDiaryEntries, deleteDiaryEntry} from '../utils/storage';

type HomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MainTabs'
>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({navigation}) => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    navigation.navigate('WriteEntry', {entry, isEdit: true});
  };

  const handleViewEntry = (entry: DiaryEntry) => {
    navigation.navigate('ViewEntry', {entry});
  };

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, []),
  );

  const renderEntry = ({item}: {item: DiaryEntry}) => (
    <TouchableOpacity
      style={styles.entryCard}
      onPress={() => handleViewEntry(item)}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryTitle}>{item.title}</Text>
        <View style={styles.entryActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditEntry(item)}>
            <Text style={styles.actionText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.alert('일기 삭제', '정말로 이 일기를 삭제하시겠습니까?', [
                {text: '취소', style: 'cancel'},
                {
                  text: '삭제',
                  style: 'destructive',
                  onPress: () => handleDeleteEntry(item.id),
                },
              ]);
            }}>
            <Text style={styles.actionText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.entryContent} numberOfLines={2}>
        {item.content}
      </Text>
      <Text style={styles.entryDate}>
        {new Date(item.date).toLocaleDateString('ko-KR')}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>일기를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>미래일기</Text>
      </View>

      {entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>아직 작성된 일기가 없습니다.</Text>
          <Text style={styles.emptySubText}>첫 번째 일기를 작성해보세요!</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('WriteEntry', {})}>
            <Text style={styles.emptyButtonText}>일기 쓰기</Text>
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
        style={styles.floatingButton}
        onPress={() => navigation.navigate('WriteEntry', {})}>
        <Text style={styles.floatingButtonText}>✏️</Text>
      </TouchableOpacity>
    </View>
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
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343a40',
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
    paddingVertical: 16,
    paddingBottom: 100, // 플로팅 버튼 공간 확보
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  entryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryTitle: {
    fontSize: 18,
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
  actionText: {
    fontSize: 16,
    color: '#6c757d',
  },
  entryContent: {
    fontSize: 14,
    color: '#6c757d',
  },
  entryDate: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 8,
  },
});

export default HomeScreen;
