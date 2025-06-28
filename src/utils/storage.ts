import AsyncStorage from '@react-native-async-storage/async-storage';
import {DiaryEntry} from '../types';

const DIARY_ENTRIES_KEY = 'DIARY_ENTRIES';

export const saveDiaryEntries = async (
  entries: DiaryEntry[],
): Promise<void> => {
  try {
    await AsyncStorage.setItem(DIARY_ENTRIES_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('일기 저장 중 오류:', error);
    throw error;
  }
};

export const loadDiaryEntries = async (): Promise<DiaryEntry[]> => {
  try {
    const data = await AsyncStorage.getItem(DIARY_ENTRIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('일기 불러오기 중 오류:', error);
    return [];
  }
};

export const saveDiaryEntry = async (entry: DiaryEntry): Promise<void> => {
  try {
    const entries = await loadDiaryEntries();
    const existingIndex = entries.findIndex(e => e.id === entry.id);

    if (existingIndex >= 0) {
      entries[existingIndex] = {...entry, updatedAt: new Date().toISOString()};
    } else {
      entries.push(entry);
    }

    entries.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    await saveDiaryEntries(entries);
  } catch (error) {
    console.error('일기 항목 저장 중 오류:', error);
    throw error;
  }
};

export const deleteDiaryEntry = async (id: string): Promise<void> => {
  try {
    const entries = await loadDiaryEntries();
    const filteredEntries = entries.filter(entry => entry.id !== id);
    await saveDiaryEntries(filteredEntries);
  } catch (error) {
    console.error('일기 삭제 중 오류:', error);
    throw error;
  }
};

export const generateId = (): string => {
  return `diary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const migrateLegacyTags = async (): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(DIARY_ENTRIES_KEY);
    if (!existingData) return;

    const entries: DiaryEntry[] = JSON.parse(existingData);
    let hasChanges = false;

    const migratedEntries = entries.map(entry => {
      if (entry.tags && entry.tags.length > 0) {
        const migratedTags = entry.tags.map(tag => {
          if (typeof tag === 'string') {
            hasChanges = true;
            return {
              name: tag,
              icon: '🏷️',
              color: '#6c757d',
            };
          }
          return tag;
        });

        return {
          ...entry,
          tags: migratedTags,
        };
      }
      return entry;
    });

    if (hasChanges) {
      await AsyncStorage.setItem(
        DIARY_ENTRIES_KEY,
        JSON.stringify(migratedEntries),
      );
      console.log('Legacy tags migrated successfully');
    }
  } catch (error) {
    console.error('Error migrating legacy tags:', error);
  }
};
