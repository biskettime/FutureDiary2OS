import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { deleteDiaryEntry } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';
import ThemeBackground from '../components/ThemeBackground';

type ViewEntryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ViewEntry'
>;
type ViewEntryScreenRouteProp = RouteProp<RootStackParamList, 'ViewEntry'>;

interface Props {
  navigation: ViewEntryScreenNavigationProp;
  route: ViewEntryScreenRouteProp;
}

const ViewEntryScreen: React.FC<Props> = ({ navigation, route }) => {
  const { entry } = route.params;
  const { currentTheme } = useTheme();

  const handleDelete = useCallback(() => {
    Alert.alert('일기 삭제', '정말로 이 일기를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDiaryEntry(entry.id);
            navigation.goBack();
          } catch (error) {
            Alert.alert('오류', '일기 삭제 중 문제가 발생했습니다.');
          }
        },
      },
    ]);
  }, [entry.id, navigation]);

  useEffect(() => {
    navigation.setOptions({
      title: '일기 보기',
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() =>
              navigation.navigate('WriteEntry', { entry, isEdit: true })
            }
          >
            <Text
              style={[
                styles.headerButtonText,
                { color: currentTheme.colors.primary },
              ]}
            >
              수정
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Text style={[styles.headerButtonText, styles.deleteButtonText]}>
              삭제
            </Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, entry, handleDelete, currentTheme]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMoodInfo = (mood?: string) => {
    switch (mood) {
      case 'excited':
        return { emoji: '🤩', label: '신남', color: '#ff6b6b' };
      case 'happy':
        return { emoji: '😊', label: '행복', color: '#4ecdc4' };
      case 'content':
        return { emoji: '😌', label: '만족', color: '#45b7d1' };
      case 'neutral':
        return { emoji: '😐', label: '보통', color: '#96ceb4' };
      case 'sad':
        return { emoji: '😢', label: '슬픔', color: '#74b9ff' };
      case 'angry':
        return { emoji: '😠', label: '화남', color: '#fd79a8' };
      case 'anxious':
        return { emoji: '😰', label: '불안', color: '#fdcb6e' };
      default:
        return null;
    }
  };

  const moodInfo = getMoodInfo(entry.mood);
  const displayEmoji = entry.emoji || (moodInfo ? moodInfo.emoji : '📝');

  return (
    <ThemeBackground>
      <ScrollView
        style={[
          styles.container,
          { backgroundColor: currentTheme.colors.background },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.mainEmoji}>{displayEmoji}</Text>
              <Text style={[styles.title, { color: currentTheme.colors.text }]}>
                {entry.title}
              </Text>
            </View>
            <Text
              style={[
                styles.date,
                { color: currentTheme.colors.textSecondary },
              ]}
            >
              {formatDate(entry.date)}
            </Text>
            {moodInfo && (
              <View
                style={[
                  styles.moodContainer,
                  { backgroundColor: currentTheme.colors.surface },
                ]}
              >
                <Text style={styles.moodEmoji}>{moodInfo.emoji}</Text>
                <Text style={[styles.moodLabel, { color: moodInfo.color }]}>
                  {moodInfo.label}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.body}>
            <View style={styles.contentContainer}>
              {/* 텍스트 영역 */}
              <View style={styles.textArea}>
                <Text
                  style={[
                    styles.contentText,
                    { color: currentTheme.colors.text },
                  ]}
                >
                  {entry.content}
                </Text>
              </View>

              {/* 이미지 영역 */}
              {entry.images && entry.images.length > 0 && (
                <View style={styles.imageArea}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.imagesScrollView}
                    contentContainerStyle={styles.imagesScrollContent}
                  >
                    {entry.images.map((imageUri, index) => (
                      <View key={index} style={styles.imageContainer}>
                        <Image
                          source={{ uri: imageUri }}
                          style={styles.image}
                          resizeMode="cover"
                          onError={error => {
                            console.log(
                              '🚨 ViewEntry 이미지 로딩 오류:',
                              error.nativeEvent.error,
                            );
                            console.log('🚨 문제 이미지 URI:', imageUri);
                          }}
                          onLoad={() => {
                            console.log(
                              '✅ ViewEntry 이미지 로딩 성공:',
                              imageUri,
                            );
                          }}
                        />
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          {entry.tags && entry.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text
                style={[styles.tagsTitle, { color: currentTheme.colors.text }]}
              >
                태그
              </Text>
              <View style={styles.tagsContainer}>
                {entry.tags.map((tag, index) => {
                  if (typeof tag === 'string') {
                    return (
                      <View
                        key={index}
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
                        key={index}
                        style={[styles.tag, { backgroundColor: tag.color }]}
                      >
                        <Text style={styles.tagIcon}>{tag.icon}</Text>
                        <Text style={styles.tagText}>{tag.name}</Text>
                      </View>
                    );
                  }
                })}
              </View>
            </View>
          )}

          <View
            style={[
              styles.footer,
              { borderTopColor: currentTheme.colors.border },
            ]}
          >
            <Text
              style={[
                styles.footerText,
                { color: currentTheme.colors.textSecondary },
              ]}
            >
              작성일: {formatDate(entry.createdAt)}{' '}
              {formatTime(entry.createdAt)}
            </Text>
            {entry.updatedAt !== entry.createdAt && (
              <Text
                style={[
                  styles.footerText,
                  { color: currentTheme.colors.textSecondary },
                ]}
              >
                수정일: {formatDate(entry.updatedAt)}{' '}
                {formatTime(entry.updatedAt)}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </ThemeBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mainEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
    flex: 1,
  },
  date: {
    fontSize: 16,
    marginBottom: 12,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  moodEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  body: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textArea: {
    flex: 1,
    marginRight: 16,
  },
  imageArea: {
    alignItems: 'flex-end',
  },
  contentText: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
    maxWidth: '48%',
    minWidth: 60,
  },
  tagIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tagText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: 16,
  },
  footerText: {
    fontSize: 12,
    marginBottom: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    marginRight: 16,
  },
  headerButton: {
    marginLeft: 16,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {},
  deleteButtonText: {
    color: '#dc3545',
  },
  imagesScrollView: {
    flexDirection: 'row',
  },
  imagesScrollContent: {
    paddingLeft: 8,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
});

export default ViewEntryScreen;
