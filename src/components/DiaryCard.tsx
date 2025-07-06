import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { DiaryEntry } from '../types';

interface Props {
  entry: DiaryEntry;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const DiaryCard: React.FC<Props> = ({ entry, onPress, onEdit, onDelete }) => {
  // 디버깅을 위한 로그 추가
  console.log('📱 DiaryCard entry:', entry.title);
  console.log('🖼️ Images:', entry.images);
  console.log('📊 Images length:', entry.images?.length);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
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

  const getMoodColor = (mood?: string) => {
    switch (mood) {
      case 'excited':
        return '#ff6b6b';
      case 'happy':
        return '#4ecdc4';
      case 'content':
        return '#45b7d1';
      case 'neutral':
        return '#96ceb4';
      case 'sad':
        return '#74b9ff';
      case 'angry':
        return '#fd79a8';
      case 'anxious':
        return '#fdcb6e';
      default:
        return '#6c757d';
    }
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const displayEmoji = entry.emoji || getMoodEmoji(entry.mood);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardContent}>
        <View style={styles.leftContent}>
          <View style={styles.header}>
            <View style={styles.leftHeader}>
              <Text style={styles.emoji}>{displayEmoji}</Text>
              <View>
                <Text style={styles.title}>{entry.title}</Text>
                <Text style={styles.date}>{formatDate(entry.date)}</Text>
              </View>
            </View>
            {!(entry.images && entry.images.length > 0) && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={e => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <Text style={styles.actionText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={e => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <Text style={styles.actionText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Text style={styles.content}>{truncateContent(entry.content)}</Text>

          {entry.tags && entry.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {entry.tags.slice(0, 3).map((tag, index) => {
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
              {entry.tags.length > 3 && (
                <Text style={styles.moreTagsText}>
                  +{entry.tags.length - 3}
                </Text>
              )}
            </View>
          )}
        </View>

        {entry.images && entry.images.length > 0 && (
          <View style={styles.rightContent}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: entry.images[0] }}
                style={styles.diaryImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.imageActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={e => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Text style={styles.actionText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={e => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Text style={styles.actionText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View
        style={[
          styles.moodIndicator,
          { backgroundColor: getMoodColor(entry.mood) },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
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
    position: 'relative',
  },
  cardContent: {
    flexDirection: 'row',
  },
  leftContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#6c757d',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  actionText: {
    fontSize: 16,
  },
  content: {
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
    borderRadius: 25,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 6,
  },
  tagIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  rightContent: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: 16,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 8,
  },
  diaryImage: {
    width: '100%',
    height: '100%',
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  moodIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 6,
    height: '100%',
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
});

export default DiaryCard;
