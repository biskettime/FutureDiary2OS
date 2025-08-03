import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { DiaryEntry } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import {
  formatDate,
  getDaysFromNow,
  getTimelineStatus,
} from '../utils/dateUtils';
import { MOOD_OPTIONS } from '../constants/categories';
import CategoryDisplay from './CategoryDisplay';

interface DiaryCardProps {
  entry: DiaryEntry;
  onPress?: (entry: DiaryEntry) => void;
  onEdit?: (entry: DiaryEntry) => void;
  onDelete?: (entry: DiaryEntry) => void;
  showActions?: boolean;
  showDate?: boolean;
  showMood?: boolean;
  showCategories?: boolean;
  variant?: 'default' | 'compact' | 'timeline';
}

const DiaryCard: React.FC<DiaryCardProps> = ({
  entry,
  onPress,
  onEdit,
  onDelete,
  showActions = true,
  showDate = true,
  showMood = true,
  showCategories = true,
  variant = 'default',
}) => {
  const { currentTheme } = useTheme();

  const getMoodEmoji = (mood?: string) => {
    if (!mood) return '😐';
    return MOOD_OPTIONS[mood as keyof typeof MOOD_OPTIONS]?.emoji || '😐';
  };

  const getBorderColor = (entryDate: string) => {
    const status = getTimelineStatus(entryDate);
    switch (status) {
      case 'past':
        return currentTheme.colors.border;
      case 'today':
        return currentTheme.colors.primary;
      case 'future':
        return currentTheme.colors.accent;
      default:
        return currentTheme.colors.border;
    }
  };

  const getStatusText = (entryDate: string) => {
    const daysFromNow = getDaysFromNow(entryDate);
    const status = getTimelineStatus(entryDate);

    switch (status) {
      case 'past':
        return `${Math.abs(daysFromNow)}일 전`;
      case 'today':
        return '오늘';
      case 'future':
        return `${daysFromNow}일 후`;
      default:
        return '';
    }
  };

  const handlePress = () => {
    onPress?.(entry);
  };

  const handleEdit = () => {
    onEdit?.(entry);
  };

  const handleDelete = () => {
    onDelete?.(entry);
  };

  const cardStyles = [
    styles.card,
    {
      backgroundColor: currentTheme.colors.surface,
      borderColor: getBorderColor(entry.date),
      borderWidth: variant === 'timeline' ? 2 : 1,
    },
    variant === 'compact' && styles.compactCard,
  ];

  return (
    <TouchableOpacity
      style={cardStyles}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        {showDate && (
          <View style={styles.dateContainer}>
            <Text style={[styles.date, { color: currentTheme.colors.text }]}>
              {formatDate(entry.date)}
            </Text>
            {variant === 'timeline' && (
              <Text
                style={[
                  styles.statusText,
                  { color: currentTheme.colors.textSecondary },
                ]}
              >
                {getStatusText(entry.date)}
              </Text>
            )}
          </View>
        )}

        {showMood && entry.mood && (
          <View style={styles.moodContainer}>
            <Text style={styles.moodEmoji}>{getMoodEmoji(entry.mood)}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.title, { color: currentTheme.colors.text }]}
          numberOfLines={variant === 'compact' ? 1 : 2}
        >
          {entry.title}
        </Text>

        {variant !== 'compact' && (
          <Text
            style={[
              styles.contentText,
              { color: currentTheme.colors.textSecondary },
            ]}
            numberOfLines={3}
          >
            {entry.content}
          </Text>
        )}
      </View>

      {showCategories && variant !== 'compact' && (
        <CategoryDisplay entry={entry} maxItems={3} />
      )}

      {showActions && (onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
              <Icon
                name="edit-3"
                size={16}
                color={currentTheme.colors.primary}
              />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDelete}
            >
              <Icon
                name="trash-2"
                size={16}
                color={currentTheme.colors.error}
              />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  compactCard: {
    padding: 12,
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateContainer: {
    flex: 1,
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 12,
    marginTop: 2,
  },
  moodContainer: {
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 20,
  },
  content: {
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default DiaryCard;
