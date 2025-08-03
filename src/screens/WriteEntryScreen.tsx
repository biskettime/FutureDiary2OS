import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  launchImageLibrary,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { DiaryEntry, RootStackParamList } from '../types';
import { saveDiaryEntry, generateId, loadDiaryEntries } from '../utils/storage';

import { useTheme } from '../contexts/ThemeContext';
import { WidgetService } from '../services/WidgetService';
import { CATEGORY_OPTIONS, MOOD_OPTIONS } from '../constants/categories';
import CategorySelector from '../components/CategorySelector';
import ImageSelector from '../components/ImageSelector';
import DateSelector from '../components/DateSelector';
import ThemeBackground from '../components/ThemeBackground';

type WriteEntryScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'WriteEntry'
>;
type WriteEntryScreenRouteProp = RouteProp<RootStackParamList, 'WriteEntry'>;

interface Props {
  navigation: WriteEntryScreenNavigationProp;
  route: WriteEntryScreenRouteProp;
}

const WriteEntryScreen: React.FC<Props> = ({ navigation, route }) => {
  const { entry, isEdit } = route.params;
  const safeAreaInsets = useSafeAreaInsets();
  const { currentTheme } = useTheme();

  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [mood, setMood] = useState<keyof typeof MOOD_OPTIONS | undefined>(
    entry?.mood,
  );
  const [selectedDate, setSelectedDate] = useState(
    entry?.date || new Date().toISOString().split('T')[0],
  );
  const [selectedImages, setSelectedImages] = useState<string[]>(
    entry?.images || [],
  );
  const [saving, setSaving] = useState(false);

  // 카테고리 상태들
  const [selectedPeople, setSelectedPeople] = useState<string[]>(
    entry?.selectedPeople || [],
  );
  const [selectedSchool, setSelectedSchool] = useState<string[]>(
    entry?.selectedSchool || [],
  );
  const [selectedCompany, setSelectedCompany] = useState<string[]>(
    entry?.selectedCompany || [],
  );
  const [selectedTravel, setSelectedTravel] = useState<string[]>(
    entry?.selectedTravel || [],
  );
  const [selectedFood, setSelectedFood] = useState<string[]>(
    entry?.selectedFood || [],
  );
  const [selectedDessert, setSelectedDessert] = useState<string[]>(
    entry?.selectedDessert || [],
  );

  const toggleCategoryOption = (
    optionId: string,
    setState: React.Dispatch<React.SetStateAction<string[]>>,
    _currentState: string[],
  ) => {
    setState(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  };

  const convertImageToBase64 = async (uri: string): Promise<string> => {
    try {
      const base64 = await RNFS.readFile(uri, 'base64');
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error('이미지 변환 오류:', error);
      throw error;
    }
  };

  const handleImageSelection = async () => {
    try {
      const result: ImagePickerResponse = await launchImageLibrary({
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        selectionLimit: 5 - selectedImages.length,
      });

      if (result.assets && result.assets.length > 0) {
        const newImages = await Promise.all(
          result.assets.map(async asset => {
            if (asset.uri) {
              return await convertImageToBase64(asset.uri);
            }
            return '';
          }),
        );

        setSelectedImages(prev => [
          ...prev,
          ...newImages.filter(img => img !== ''),
        ]);
      }
    } catch (error) {
      console.error('이미지 선택 오류:', error);
      Alert.alert('오류', '이미지 선택 중 문제가 발생했습니다.');
    }
  };

  const removeImage = (indexToRemove: number) => {
    setSelectedImages(prev =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }

    setSaving(true);

    try {
      const diaryEntry: DiaryEntry = {
        id: entry?.id || generateId(),
        title: title.trim(),
        content: content.trim(),
        date: selectedDate,
        mood,
        emoji: mood ? MOOD_OPTIONS[mood].emoji : undefined,
        images: selectedImages,
        selectedPeople,
        selectedSchool,
        selectedCompany,
        selectedTravel,
        selectedFood,
        selectedDessert,
        createdAt: entry?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveDiaryEntry(diaryEntry);

      // 위젯 업데이트
      const allEntries = await loadDiaryEntries();
      await WidgetService.updateWidgetData(allEntries, currentTheme);

      Alert.alert(
        '성공',
        isEdit ? '일기가 수정되었습니다.' : '일기가 저장되었습니다.',
        [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error: any) {
      console.error('❌ 일기 저장 전체 프로세스 실패:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        error: error,
      });

      const errorMessage =
        error.message || error.toString() || '알 수 없는 오류가 발생했습니다.';
      console.error('📱 사용자에게 표시할 에러:', errorMessage);

      Alert.alert(
        '일기 저장 오류',
        `저장 중 문제가 발생했습니다:\n\n${errorMessage}\n\n잠시 후 다시 시도해주세요.`,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim() || selectedImages.length > 0) {
      Alert.alert(
        '작성 취소',
        '작성 중인 내용이 있습니다. 정말로 취소하시겠습니까?',
        [
          { text: '계속 작성', style: 'cancel' },
          {
            text: '취소',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <ThemeBackground hideCharacter={true}>
      <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <Icon name="x" size={24} color={currentTheme.colors.text} />
          </TouchableOpacity>
          <Text
            style={[styles.headerTitle, { color: currentTheme.colors.text }]}
          >
            {isEdit ? '일기 수정' : '새 일기'}
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={[
              styles.saveButton,
              { backgroundColor: currentTheme.colors.primary },
              saving && { opacity: 0.6 },
            ]}
          >
            <Text style={styles.saveButtonText}>
              {saving ? '저장 중...' : '저장'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 제목 입력 */}
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: currentTheme.colors.text }]}
            >
              제목
            </Text>
            <TextInput
              style={[
                styles.titleInput,
                {
                  backgroundColor: currentTheme.colors.surface,
                  color: currentTheme.colors.text,
                  borderColor: currentTheme.colors.border,
                },
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="일기 제목을 입력하세요"
              placeholderTextColor={currentTheme.colors.textSecondary}
              maxLength={100}
            />
          </View>

          {/* 날짜 선택 */}
          <DateSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            minDate={new Date().toISOString().split('T')[0]}
          />

          {/* 기분 선택 */}
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: currentTheme.colors.text }]}
            >
              기분
            </Text>
            <View style={styles.moodContainer}>
              {Object.entries(MOOD_OPTIONS).map(([key, option]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.moodButton,
                    {
                      backgroundColor:
                        mood === key
                          ? option.color
                          : currentTheme.colors.surface,
                      borderColor: currentTheme.colors.border,
                    },
                  ]}
                  onPress={() => setMood(key as keyof typeof MOOD_OPTIONS)}
                >
                  <Text style={styles.moodEmoji}>{option.emoji}</Text>
                  <Text
                    style={[
                      styles.moodText,
                      {
                        color: mood === key ? '#fff' : currentTheme.colors.text,
                      },
                    ]}
                  >
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 카테고리 선택들 */}
          <CategorySelector
            title="사람"
            options={CATEGORY_OPTIONS.people.options}
            selectedItems={selectedPeople}
            onToggle={optionId =>
              toggleCategoryOption(optionId, setSelectedPeople, selectedPeople)
            }
          />

          <CategorySelector
            title="학교"
            options={CATEGORY_OPTIONS.school.options}
            selectedItems={selectedSchool}
            onToggle={optionId =>
              toggleCategoryOption(optionId, setSelectedSchool, selectedSchool)
            }
          />

          <CategorySelector
            title="회사"
            options={CATEGORY_OPTIONS.company.options}
            selectedItems={selectedCompany}
            onToggle={optionId =>
              toggleCategoryOption(
                optionId,
                setSelectedCompany,
                selectedCompany,
              )
            }
          />

          <CategorySelector
            title="여행"
            options={CATEGORY_OPTIONS.travel.options}
            selectedItems={selectedTravel}
            onToggle={optionId =>
              toggleCategoryOption(optionId, setSelectedTravel, selectedTravel)
            }
          />

          <CategorySelector
            title="음식"
            options={CATEGORY_OPTIONS.food.options}
            selectedItems={selectedFood}
            onToggle={optionId =>
              toggleCategoryOption(optionId, setSelectedFood, selectedFood)
            }
          />

          <CategorySelector
            title="디저트"
            options={CATEGORY_OPTIONS.dessert.options}
            selectedItems={selectedDessert}
            onToggle={optionId =>
              toggleCategoryOption(
                optionId,
                setSelectedDessert,
                selectedDessert,
              )
            }
          />

          {/* 이미지 선택 */}
          <ImageSelector
            selectedImages={selectedImages}
            onAddImage={handleImageSelection}
            onRemoveImage={removeImage}
          />

          {/* 내용 입력 */}
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: currentTheme.colors.text }]}
            >
              내용
            </Text>
            <TextInput
              style={[
                styles.contentInput,
                {
                  backgroundColor: currentTheme.colors.surface,
                  color: currentTheme.colors.text,
                  borderColor: currentTheme.colors.border,
                },
              ]}
              value={content}
              onChangeText={setContent}
              placeholder="일기 내용을 입력하세요..."
              placeholderTextColor={currentTheme.colors.textSecondary}
              multiline
              textAlignVertical="top"
              numberOfLines={10}
              maxLength={2000}
            />
          </View>
        </ScrollView>

        {/* 일기 작성 플로팅 버튼 */}
        <TouchableOpacity
          style={[
            styles.floatingButton,
            { backgroundColor: currentTheme.colors.primary },
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          <Icon name="edit-3" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </ThemeBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  titleInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 80,
  },
  moodEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  moodText: {
    fontSize: 12,
    fontWeight: '500',
  },
  contentInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 120,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});

export default WriteEntryScreen;
