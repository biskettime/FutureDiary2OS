import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../contexts/ThemeContext';

interface ImageSelectorProps {
  selectedImages: string[];
  onAddImage: () => void;
  onRemoveImage: (index: number) => void;
  maxImages?: number;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({
  selectedImages,
  onAddImage,
  onRemoveImage,
  maxImages = 5,
}) => {
  const { currentTheme } = useTheme();



  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: currentTheme.colors.text }]}>
        사진 첨부 ({selectedImages.length}/{maxImages})
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.imagesContainer}>
          {/* 이미지 추가 버튼 */}
          {selectedImages.length < maxImages && (
            <TouchableOpacity
              style={[
                styles.addImageButton,
                {
                  backgroundColor: currentTheme.colors.surface,
                  borderColor: currentTheme.colors.border,
                },
              ]}
              onPress={onAddImage}
            >
              <Icon name="plus" size={24} color={currentTheme.colors.primary} />
              <Text
                style={[
                  styles.addImageText,
                  { color: currentTheme.colors.primary },
                ]}
              >
                추가
              </Text>
            </TouchableOpacity>
          )}

          {/* 선택된 이미지들 */}
          {selectedImages.map((imageUri, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemoveImage(index)}
              >
                <Icon name="x" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
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
  imagesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  addImageText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 8,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },

});

export default ImageSelector;
