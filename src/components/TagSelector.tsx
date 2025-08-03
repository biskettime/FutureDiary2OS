import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { TagInfo } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface TagSelectorProps {
  title: string;
  recommendedTags: TagInfo[];
  selectedTags: TagInfo[];
  onToggle: (tag: TagInfo) => void;
  maxSelections?: number;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  title,
  recommendedTags,
  selectedTags,
  onToggle,
  maxSelections = 5,
}) => {
  const { currentTheme } = useTheme();

  const handleToggle = (tag: TagInfo) => {
    const isSelected = selectedTags.some(
      selected => selected.name === tag.name,
    );
    if (isSelected) {
      onToggle(tag);
    } else if (selectedTags.length < maxSelections) {
      onToggle(tag);
    }
  };

  const isTagSelected = (tag: TagInfo) => {
    return selectedTags.some(selected => selected.name === tag.name);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: currentTheme.colors.text }]}>
        {title}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tagsContainer}>
          {recommendedTags.map((tag, index) => {
            const isSelected = isTagSelected(tag);
            return (
              <TouchableOpacity
                key={`${tag.name}-${index}`}
                style={[
                  styles.tagButton,
                  {
                    backgroundColor: isSelected
                      ? tag.color
                      : currentTheme.colors.surface,
                    borderColor: isSelected
                      ? tag.color
                      : currentTheme.colors.border,
                  },
                ]}
                onPress={() => handleToggle(tag)}
                disabled={!isSelected && selectedTags.length >= maxSelections}
              >
                <Text style={styles.tagIcon}>{tag.icon}</Text>
                <Text
                  style={[
                    styles.tagText,
                    {
                      color: isSelected ? '#fff' : currentTheme.colors.text,
                    },
                  ]}
                >
                  {tag.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    minWidth: 100,
  },
  tagIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default TagSelector;
