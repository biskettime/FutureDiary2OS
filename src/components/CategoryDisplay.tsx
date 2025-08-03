import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DiaryEntry, CategoryOption } from '../types';
import { CATEGORY_OPTIONS } from '../constants/categories';

interface CategoryDisplayProps {
  entry: DiaryEntry;
  maxItems?: number;
  showTitle?: boolean;
}

const CategoryDisplay: React.FC<CategoryDisplayProps> = ({
  entry,
  maxItems = 3,
  showTitle = false,
}) => {
  const getSelectedCategories = (): Array<{ key: string; option: CategoryOption; category: string }> => {
    const categories: Array<{ key: string; option: CategoryOption; category: string }> = [];

    // 각 카테고리별로 선택된 항목들을 수집
    Object.entries(CATEGORY_OPTIONS).forEach(([categoryKey, categoryData]) => {
      const selectedKey = entry[`selected${categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)}` as keyof DiaryEntry] as string[];
      
      if (selectedKey && Array.isArray(selectedKey)) {
        selectedKey.forEach(key => {
          const option = categoryData.options[key];
          if (option) {
            categories.push({
              key,
              option,
              category: categoryData.title,
            });
          }
        });
      }
    });

    return categories.slice(0, maxItems);
  };

  const selectedCategories = getSelectedCategories();

  if (selectedCategories.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {showTitle && (
        <Text style={styles.title}>선택된 카테고리</Text>
      )}
      <View style={styles.categoriesContainer}>
        {selectedCategories.map((item, index) => (
          <View key={`${item.category}-${item.key}-${index}`} style={styles.categoryItem}>
            <Text style={styles.categoryIcon}>{item.option.icon}</Text>
            <Text style={styles.categoryName}>{item.option.name}</Text>
          </View>
        ))}
        {selectedCategories.length === maxItems && (
          <Text style={styles.moreText}>...</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.7,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  categoryIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryName: {
    fontSize: 10,
    fontWeight: '500',
    opacity: 0.8,
  },
  moreText: {
    fontSize: 10,
    opacity: 0.5,
    marginLeft: 4,
  },
});

export default CategoryDisplay; 