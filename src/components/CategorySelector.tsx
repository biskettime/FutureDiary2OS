import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CategoryOption } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface CategorySelectorProps {
  title: string;
  options: Record<string, CategoryOption>;
  selectedItems: string[];
  onToggle: (optionId: string) => void;
  maxSelections?: number;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  title,
  options,
  selectedItems,
  onToggle,
  maxSelections = 3,
}) => {
  const { currentTheme } = useTheme();

  const handleToggle = (optionId: string) => {
    if (selectedItems.includes(optionId)) {
      onToggle(optionId);
    } else if (selectedItems.length < maxSelections) {
      onToggle(optionId);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: currentTheme.colors.text }]}>
        {title}
      </Text>
      <View style={styles.optionsContainer}>
        {Object.entries(options).map(([optionId, option]) => {
          const isSelected = selectedItems.includes(optionId);
          return (
            <TouchableOpacity
              key={optionId}
              style={[
                styles.optionButton,
                {
                  backgroundColor: isSelected ? option.color : currentTheme.colors.surface,
                  borderColor: isSelected ? option.color : currentTheme.colors.border,
                },
              ]}
              onPress={() => handleToggle(optionId)}
              disabled={!isSelected && selectedItems.length >= maxSelections}
            >
              <Text style={styles.optionIcon}>{option.icon}</Text>
              <Text
                style={[
                  styles.optionText,
                  {
                    color: isSelected ? '#fff' : currentTheme.colors.text,
                  },
                ]}
              >
                {option.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 80,
  },
  optionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default CategorySelector; 