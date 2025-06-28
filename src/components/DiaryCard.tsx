import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {DiaryEntry} from '../types';

interface Props {
  entry: DiaryEntry;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const DiaryCard: React.FC<Props> = ({entry, onPress, onEdit, onDelete}) => {
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
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <Text style={styles.emoji}>{displayEmoji}</Text>
          <View>
            <Text style={styles.title}>{entry.title}</Text>
            <Text style={styles.date}>{formatDate(entry.date)}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={e => {
              e.stopPropagation();
              onEdit();
            }}>
            <Text style={styles.actionText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={e => {
              e.stopPropagation();
              onDelete();
            }}>
            <Text style={styles.actionText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.content}>{truncateContent(entry.content)}</Text>

      {entry.tags && entry.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {entry.tags.slice(0, 3).map((tag, index) => {
            if (typeof tag === 'string') {
              return (
                <View
                  key={index}
                  style={[styles.tag, {backgroundColor: '#e9ecef'}]}>
                  <Text style={[styles.tagText, {color: '#495057'}]}>
                    #{tag}
                  </Text>
                </View>
              );
            } else {
              return (
                <View
                  key={index}
                  style={[styles.tag, {backgroundColor: tag.color}]}>
                  <Text style={styles.tagIcon}>{tag.icon}</Text>
                  <Text style={styles.tagText}>{tag.name}</Text>
                </View>
              );
            }
          })}
          {entry.tags.length > 3 && (
            <Text style={styles.moreTagsText}>+{entry.tags.length - 3}</Text>
          )}
        </View>
      )}

      <View
        style={[
          styles.moodIndicator,
          {backgroundColor: getMoodColor(entry.mood)},
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    position: 'relative',
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
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 4,
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
  moodIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 4,
    height: '100%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
});

export default DiaryCard;
