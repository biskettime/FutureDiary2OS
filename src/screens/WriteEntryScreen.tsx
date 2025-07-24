import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Image,
  Keyboard,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import {
  launchImageLibrary,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DiaryEntry, RootStackParamList, TagInfo } from '../types';
import { saveDiaryEntry, generateId } from '../utils/storage';
import {
  getTodayString,
  getRelativeDateString,
  formatDateToKorean,
  getDaysAgo,
  getDaysLater,
} from '../utils/dateUtils';
import { useTheme } from '../contexts/ThemeContext';

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
  const [mood, setMood] = useState<
    | 'excited'
    | 'happy'
    | 'content'
    | 'neutral'
    | 'sad'
    | 'angry'
    | 'anxious'
    | undefined
  >(entry?.mood);

  // 새로운 카테고리 상태들
  const [selectedWeather, setSelectedWeather] = useState<string[]>(
    entry?.selectedWeather || [],
  );
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
  const [selectedDrink, setSelectedDrink] = useState<string[]>(
    entry?.selectedDrink || [],
  );

  // 사진 첨부 상태 추가
  const [selectedImages, setSelectedImages] = useState<string[]>(
    entry?.images || [],
  );

  // 기존 태그를 TagInfo 형태로 변환
  const convertTagsToTagInfo = (tags?: (string | TagInfo)[]): TagInfo[] => {
    if (!tags) return [];
    return tags.map(tag => {
      if (typeof tag === 'string') {
        // 기존 string 태그를 기본 TagInfo로 변환
        return {
          name: tag,
          icon: '🏷️',
          color: '#6c757d',
        };
      }
      return tag;
    });
  };

  const [selectedTags, setSelectedTags] = useState<TagInfo[]>(
    convertTagsToTagInfo(entry?.tags),
  );
  const [selectedDate, setSelectedDate] = useState(
    entry?.date || getTodayString(),
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [showCustomTagModal, setShowCustomTagModal] = useState(false);
  const [customTagName, setCustomTagName] = useState('');
  const [customTagIcon, setCustomTagIcon] = useState('🏷️');
  const [customTagColor, setCustomTagColor] = useState('#4ecdc4');
  const [saving, setSaving] = useState(false);

  // 카테고리별 옵션 데이터
  const weatherOptions = [
    { id: 'sunny', name: '맑음', icon: '☀️', color: '#FFE066' },
    { id: 'cloudy', name: '흐림', icon: '☁️', color: '#E0E0E0' },
    { id: 'rainy', name: '비', icon: '🌧️', color: '#81D4FA' },
    { id: 'snowy', name: '눈', icon: '❄️', color: '#E1F5FE' },
  ];

  const peopleOptions = [
    { id: 'friends', name: '친구', icon: '⭐', color: '#64B5F6' },
    { id: 'family', name: '가족', icon: '🌱', color: '#81C784' },
    { id: 'lover', name: '연인', icon: '💖', color: '#F06292' },
    { id: 'acquaintance', name: '지인', icon: '😊', color: '#FFB74D' },
  ];

  const schoolOptions = [
    { id: 'class', name: '수업', icon: '📚', color: '#4CAF50' },
    { id: 'study', name: '공부', icon: '🔍', color: '#FFC107' },
    { id: 'assignment', name: '과제', icon: '📝', color: '#FF9800' },
    { id: 'exam', name: '시험', icon: '🌸', color: '#E91E63' },
    { id: 'teamwork', name: '팀플', icon: '💬', color: '#4CAF50' },
  ];

  const companyOptions = [
    { id: 'meeting', name: '회의', icon: '👥', color: '#2196F3' },
    { id: 'work', name: '업무', icon: '💼', color: '#607D8B' },
    { id: 'project', name: '프로젝트', icon: '📊', color: '#9C27B0' },
    { id: 'presentation', name: '발표', icon: '🎤', color: '#FF5722' },
  ];

  const travelOptions = [
    { id: 'airplane', name: '비행기', icon: '✈️', color: '#03A9F4' },
    { id: 'ship', name: '배', icon: '🚢', color: '#00BCD4' },
    { id: 'train', name: '기차', icon: '🚄', color: '#4CAF50' },
    { id: 'bus', name: '버스', icon: '🚌', color: '#FF9800' },
    { id: 'car', name: '승용차', icon: '🚗', color: '#9E9E9E' },
    { id: 'motorcycle', name: '오토바이', icon: '🏍️', color: '#F44336' },
  ];

  const foodOptions = [
    { id: 'korean', name: '한식', icon: '🍚', color: '#8BC34A' },
    { id: 'western', name: '양식', icon: '🍝', color: '#FFC107' },
    { id: 'chinese', name: '중식', icon: '🥢', color: '#FF5722' },
    { id: 'japanese', name: '일식', icon: '🍣', color: '#E91E63' },
    { id: 'fast_food', name: '패스트푸드', icon: '🍔', color: '#FF9800' },
  ];

  const dessertOptions = [
    { id: 'cake', name: '케이크', icon: '🍰', color: '#F8BBD9' },
    { id: 'ice_cream', name: '아이스크림', icon: '🍦', color: '#E1F5FE' },
    { id: 'chocolate', name: '초콜릿', icon: '🍫', color: '#8D6E63' },
    { id: 'cookie', name: '쿠키', icon: '🍪', color: '#FFCC02' },
    { id: 'fruit', name: '과일', icon: '🍓', color: '#4CAF50' },
  ];

  const drinkOptions = [
    { id: 'coffee', name: '커피', icon: '☕', color: '#8D6E63' },
    { id: 'milk_tea', name: '밀크티', icon: '🧋', color: '#D7CCC8' },
    { id: 'juice', name: '주스', icon: '🧃', color: '#FFC107' },
    { id: 'water', name: '물', icon: '💧', color: '#03A9F4' },
    { id: 'alcohol', name: '술', icon: '🍺', color: '#FF9800' },
  ];

  // 기본 추천 태그들 (제공된 이미지 스타일)
  const recommendedTags = [
    { id: 'daily', name: '매일 운동하기', icon: '🏃', color: '#4285f4' },
    { id: 'music', name: '근육 늘리기', icon: '💪', color: '#9c27b0' },
    { id: 'health', name: '건강한 식습관', icon: '🥗', color: '#4caf50' },
    { id: 'meditation', name: '금연하기', icon: '🚭', color: '#607d8b' },
    { id: 'habit', name: '책읽는 습관', icon: '📖', color: '#673ab7' },
    { id: 'nature', name: '상식교양쌓기', icon: '🧠', color: '#009688' },
    { id: 'birthday', name: '생신상 놀이기', icon: '🎂', color: '#ff9800' },
    { id: 'language', name: '말하기 연습', icon: '💬', color: '#e91e63' },
    { id: 'foreign', name: '외국어 배우기', icon: '🌐', color: '#2196f3' },
    { id: 'sns', name: 'SNS 운영하기', icon: '📱', color: '#ff5722' },
    { id: 'money', name: '부자되기', icon: '💰', color: '#795548' },
    { id: 'diary', name: '마음챙김', icon: '💚', color: '#4caf50' },
    { id: 'morning', name: '모닝루틴', icon: '☀️', color: '#ffc107' },
    { id: 'success', name: '명상하기', icon: '🧘', color: '#9c27b0' },
    { id: 'memory', name: '일기쓰기', icon: '✍️', color: '#607d8b' },
    { id: 'study', name: '악기 배우기', icon: '🎹', color: '#009688' },
    {
      id: 'development',
      name: '깨끗한 집 만들기',
      icon: '🏠',
      color: '#ff9800',
    },
    { id: 'digital', name: '디지털 디톡스', icon: '📱', color: '#e91e63' },
  ];

  const customTagIcons = [
    '🏷️',
    '⭐',
    '❤️',
    '🎯',
    '💡',
    '🔥',
    '✨',
    '🌟',
    '💪',
    '🎨',
    '📚',
    '🌱',
    '🚀',
    '💎',
    '🎪',
    '🎭',
  ];

  const customTagColors = [
    '#4ecdc4',
    '#ff6b6b',
    '#45b7d1',
    '#96ceb4',
    '#74b9ff',
    '#fd79a8',
    '#fdcb6e',
    '#e17055',
    '#81ecec',
    '#fab1a0',
    '#a29bfe',
    '#fd79a8',
    '#6c5ce7',
    '#00b894',
    '#e84393',
  ];

  const handleSave = useCallback(async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('오류', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    setSaving(true);

    try {
      const now = new Date().toISOString();

      const newEntry: DiaryEntry = {
        id: entry?.id || generateId(),
        title: title.trim(),
        content: content.trim(),
        date: selectedDate,
        mood,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        selectedWeather:
          selectedWeather.length > 0 ? selectedWeather : undefined,
        selectedPeople: selectedPeople.length > 0 ? selectedPeople : undefined,
        selectedSchool: selectedSchool.length > 0 ? selectedSchool : undefined,
        selectedCompany:
          selectedCompany.length > 0 ? selectedCompany : undefined,
        selectedTravel: selectedTravel.length > 0 ? selectedTravel : undefined,
        selectedFood: selectedFood.length > 0 ? selectedFood : undefined,
        selectedDessert:
          selectedDessert.length > 0 ? selectedDessert : undefined,
        selectedDrink: selectedDrink.length > 0 ? selectedDrink : undefined,
        images: selectedImages.length > 0 ? selectedImages : undefined,
        createdAt: entry?.createdAt || now,
        updatedAt: now,
      };

      // 디버깅을 위한 로그 추가
      console.log('💾 Saving entry with images:', selectedImages);
      console.log('📊 Selected images length:', selectedImages.length);
      console.log('📝 Full entry data:', newEntry);
      console.log('🖼️ Images in entry:', newEntry.images);

      await saveDiaryEntry(newEntry);
      Alert.alert(
        '성공',
        isEdit ? '일기가 수정되었습니다.' : '일기가 저장되었습니다.',
        [{ text: '확인', onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      Alert.alert('오류', '일기 저장 중 문제가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }, [
    title,
    content,
    mood,
    selectedTags,
    selectedDate,
    selectedWeather,
    selectedPeople,
    selectedSchool,
    selectedCompany,
    selectedTravel,
    selectedFood,
    selectedDessert,
    selectedDrink,
    selectedImages,
    entry,
    isEdit,
    navigation,
  ]);

  useEffect(() => {
    navigation.setOptions({
      title: isEdit ? '일기 수정' : '새 일기',
    });
  }, [navigation, isEdit]);

  const moodOptions = [
    { value: 'excited', emoji: '🤩', label: '신남', color: '#ff6b6b' },
    { value: 'happy', emoji: '😊', label: '행복', color: '#4ecdc4' },
    { value: 'content', emoji: '😌', label: '만족', color: '#45b7d1' },
    { value: 'neutral', emoji: '😐', label: '보통', color: '#96ceb4' },
    { value: 'sad', emoji: '😢', label: '슬픔', color: '#74b9ff' },
    { value: 'angry', emoji: '😠', label: '화남', color: '#fd79a8' },
    { value: 'anxious', emoji: '😰', label: '불안', color: '#fdcb6e' },
  ] as const;

  const toggleTag = (tag: { name: string; icon: string; color: string }) => {
    const tagInfo: TagInfo = {
      name: tag.name,
      icon: tag.icon,
      color: tag.color,
    };

    const existingIndex = selectedTags.findIndex(t => t.name === tag.name);
    if (existingIndex >= 0) {
      setSelectedTags(selectedTags.filter((_, i) => i !== existingIndex));
    } else {
      setSelectedTags([...selectedTags, tagInfo]);
    }
  };

  // 카테고리별 옵션 토글 함수들
  const toggleCategoryOption = (
    category: string,
    optionId: string,
    setState: React.Dispatch<React.SetStateAction<string[]>>,
    currentState: string[],
  ) => {
    if (currentState.includes(optionId)) {
      setState(currentState.filter(id => id !== optionId));
    } else {
      setState([...currentState, optionId]);
    }
  };

  // 카테고리 옵션 렌더링 함수
  const renderCategoryOptions = (
    title: string,
    options: Array<{ id: string; name: string; icon: string; color: string }>,
    selectedItems: string[],
    setState: React.Dispatch<React.SetStateAction<string[]>>,
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.categoryOptionsContainer}>
        {options.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.categoryOption,
              { backgroundColor: option.color },
              selectedItems.includes(option.id) &&
                styles.selectedCategoryOption,
            ]}
            onPress={() =>
              toggleCategoryOption(title, option.id, setState, selectedItems)
            }
          >
            <Text style={styles.categoryIcon}>{option.icon}</Text>
            <Text style={styles.categoryLabel}>{option.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const handleCustomTagSave = () => {
    if (!customTagName.trim()) {
      Alert.alert('오류', '태그 이름을 입력해주세요.');
      return;
    }

    const customTagInfo: TagInfo = {
      name: customTagName.trim(),
      icon: customTagIcon,
      color: customTagColor,
    };

    const existingIndex = selectedTags.findIndex(
      t => t.name === customTagInfo.name,
    );
    if (existingIndex === -1) {
      setSelectedTags([...selectedTags, customTagInfo]);
    }

    setCustomTagName('');
    setCustomTagIcon('🏷️');
    setCustomTagColor('#4ecdc4');
    setShowCustomTagModal(false);
  };

  const formatDateForDisplay = (dateString: string) => {
    return getRelativeDateString(dateString);
  };

  const getMinDate = () => {
    return getDaysAgo(7);
  };

  const getMaxDate = () => {
    return getDaysLater(30);
  };

  const getMarkedDates = () => {
    return {
      [selectedDate]: {
        selected: true,
        disableTouchEvent: true,
        selectedColor: '#007AFF',
        selectedTextColor: '#ffffff',
      },
    };
  };

  // 이미지를 Base64로 인코딩하는 함수
  const convertImageToBase64 = async (uri: string): Promise<string> => {
    try {
      const base64String = await RNFS.readFile(uri, 'base64');
      const base64Uri = `data:image/jpeg;base64,${base64String}`;
      console.log('✅ 이미지 Base64 변환 성공');
      return base64Uri;
    } catch (error) {
      console.error('🚨 이미지 Base64 변환 실패:', error);
      throw error;
    }
  };

  // 사진 선택 함수
  const handleImageSelection = () => {
    launchImageLibrary(
      {
        mediaType: 'photo' as MediaType,
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.7,
        selectionLimit: 5, // 최대 5장까지 선택 가능
      },
      async (response: ImagePickerResponse) => {
        if (response.didCancel || response.errorMessage) {
          console.log('📷 이미지 선택 취소 또는 오류:', response.errorMessage);
          return;
        }

        if (response.assets && response.assets.length > 0) {
          try {
            const tempImages = response.assets
              .filter(asset => asset.uri)
              .map(asset => asset.uri!);

            console.log('📷 선택된 임시 이미지 URI들:', tempImages);

            // 각 이미지를 Base64로 변환
            const base64Images: string[] = [];
            for (const tempUri of tempImages) {
              const base64Uri = await convertImageToBase64(tempUri);
              base64Images.push(base64Uri);
            }

            console.log('📷 Base64 변환된 이미지 개수:', base64Images.length);
            setSelectedImages(prev => [...prev, ...base64Images]);
          } catch (error) {
            console.error('🚨 이미지 저장 오류:', error);
            Alert.alert('오류', '이미지 저장 중 문제가 발생했습니다.');
          }
        }
      },
    );
  };

  // 이미지 삭제 함수
  const removeImage = async (indexToRemove: number) => {
    console.log('🗑️ 이미지 삭제:', indexToRemove);
    setSelectedImages(prev =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      {/* 자체 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerButtonText}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>새 일기</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleSave}
          disabled={saving || !title.trim() || !content.trim()}
        >
          <Text
            style={[
              styles.headerButtonText,
              styles.saveHeaderButton,
              (saving || !title.trim() || !content.trim()) &&
                styles.disabledHeaderButton,
            ]}
          >
            {saving ? '저장중...' : '저장'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={true}
        alwaysBounceVertical={false}
      >
        {/* 날짜 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>날짜</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowCalendar(!showCalendar)}
          >
            <Text style={styles.dateButtonText}>
              {formatDateForDisplay(selectedDate)}
            </Text>
            <Text style={styles.dateButtonSubtext}>
              {formatDateToKorean(selectedDate)}
            </Text>
          </TouchableOpacity>

          {showCalendar && (
            <View style={styles.calendarContainer}>
              <Calendar
                current={selectedDate}
                onDayPress={day => {
                  setSelectedDate(day.dateString);
                  setShowCalendar(false);
                }}
                markedDates={getMarkedDates()}
                theme={{
                  backgroundColor: '#ffffff',
                  calendarBackground: '#ffffff',
                  textSectionTitleColor: '#b6c1cd',
                  selectedDayBackgroundColor: '#007AFF',
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: '#007AFF',
                  dayTextColor: '#2d4150',
                  textDisabledColor: '#d9e1e8',
                  arrowColor: '#007AFF',
                  disabledArrowColor: '#d9e1e8',
                  monthTextColor: '#2d4150',
                  indicatorColor: '#007AFF',
                  textDayFontWeight: '500',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '600',
                  textDayFontSize: 16,
                  textMonthFontSize: 18,
                  textDayHeaderFontSize: 14,
                }}
                minDate={getMinDate()}
                maxDate={getMaxDate()}
                monthFormat={'yyyy년 MM월'}
                firstDay={1}
                showWeekNumbers={false}
                disableMonthChange={false}
                hideExtraDays={true}
                disableAllTouchEventsForDisabledDays={true}
              />
            </View>
          )}
        </View>

        {/* 제목 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제목</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="일기 제목을 입력하세요"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            autoCorrect={false}
            autoCapitalize="none"
            keyboardType="default"
          />
        </View>

        {/* 내용 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>내용</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="오늘의 이야기를 써보세요..."
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            autoCorrect={false}
            autoCapitalize="none"
            keyboardType="default"
            returnKeyType="done"
            blurOnSubmit={true}
            onSubmitEditing={() => {
              Keyboard.dismiss();
            }}
          />
        </View>

        {/* 사진 첨부 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>사진 첨부</Text>
          <TouchableOpacity
            style={[
              styles.photoButton,
              { backgroundColor: currentTheme.colors.primary },
            ]}
            onPress={handleImageSelection}
          >
            <Text style={styles.photoButtonText}>📷 사진 선택</Text>
          </TouchableOpacity>

          {selectedImages.length > 0 && (
            <View style={styles.selectedImagesContainer}>
              <Text style={styles.selectedImagesTitle}>
                선택된 사진 ({selectedImages.length})
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imagesScrollView}
              >
                {selectedImages.map((imageUri, index) => (
                  <View key={index} style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.imagePreview}
                      resizeMode="cover"
                      onError={error => {
                        console.log(
                          '🚨 이미지 로딩 오류:',
                          error.nativeEvent.error,
                        );
                        console.log('🚨 문제 이미지 URI:', imageUri);
                      }}
                      onLoad={() => {
                        console.log('✅ 이미지 로딩 성공:', imageUri);
                      }}
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Text style={styles.removeImageText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* 기분 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기분</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.moodScrollView}
          >
            {moodOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.moodOption,
                  { backgroundColor: option.color },
                  mood === option.value && styles.selectedMoodOption,
                ]}
                onPress={() => setMood(option.value)}
              >
                <Text style={styles.moodEmoji}>{option.emoji}</Text>
                <Text style={styles.moodLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 태그 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>태그</Text>
          <View style={styles.tagsContainer}>
            {recommendedTags.map(tag => {
              const isSelected = selectedTags.some(t => t.name === tag.name);
              return (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.tagButton,
                    { backgroundColor: tag.color },
                    isSelected && styles.selectedTag,
                  ]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={styles.tagIcon}>{tag.icon}</Text>
                  <Text style={styles.tagText}>{tag.name}</Text>
                </TouchableOpacity>
              );
            })}

            {/* 직접 작성 버튼 */}
            <TouchableOpacity
              style={[styles.tagButton, styles.customTagButton]}
              onPress={() => setShowCustomTagModal(true)}
            >
              <Text style={styles.tagIcon}>✏️</Text>
              <Text style={styles.tagText}>직접 작성</Text>
            </TouchableOpacity>
          </View>

          {/* 선택된 태그 표시 */}
          {selectedTags.length > 0 && (
            <View style={styles.selectedTagsContainer}>
              <Text style={styles.selectedTagsTitle}>선택된 태그:</Text>
              <View style={styles.selectedTagsList}>
                {selectedTags.map((tag, index) => (
                  <View
                    key={index}
                    style={[
                      styles.selectedTagItem,
                      { backgroundColor: tag.color },
                    ]}
                  >
                    <Text style={styles.selectedTagIcon}>{tag.icon}</Text>
                    <Text style={styles.selectedTagText}>{tag.name}</Text>
                    <TouchableOpacity
                      style={styles.removeTagButton}
                      onPress={() =>
                        setSelectedTags(
                          selectedTags.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <Text style={styles.removeTagText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* 카테고리 옵션들 */}
        {renderCategoryOptions(
          '날씨',
          weatherOptions,
          selectedWeather,
          setSelectedWeather,
        )}
        {renderCategoryOptions(
          '사람',
          peopleOptions,
          selectedPeople,
          setSelectedPeople,
        )}
        {renderCategoryOptions(
          '학교',
          schoolOptions,
          selectedSchool,
          setSelectedSchool,
        )}
        {renderCategoryOptions(
          '회사',
          companyOptions,
          selectedCompany,
          setSelectedCompany,
        )}
        {renderCategoryOptions(
          '여행',
          travelOptions,
          selectedTravel,
          setSelectedTravel,
        )}
        {renderCategoryOptions(
          '음식',
          foodOptions,
          selectedFood,
          setSelectedFood,
        )}
        {renderCategoryOptions(
          '디저트',
          dessertOptions,
          selectedDessert,
          setSelectedDessert,
        )}
        {renderCategoryOptions(
          '음료',
          drinkOptions,
          selectedDrink,
          setSelectedDrink,
        )}
      </ScrollView>

      {/* 커스텀 태그 작성 모달 */}
      <Modal
        visible={showCustomTagModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCustomTagModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>태그 직접 작성</Text>

            <Text style={styles.modalLabel}>아이콘 선택</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.iconSelector}
            >
              {customTagIcons.map((icon, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.iconOption,
                    customTagIcon === icon && styles.selectedIconOption,
                  ]}
                  onPress={() => setCustomTagIcon(icon)}
                >
                  <Text style={styles.iconOptionText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.modalLabel}>태그 이름</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="태그 이름을 입력하세요"
              value={customTagName}
              onChangeText={setCustomTagName}
              maxLength={20}
              autoCorrect={false}
              autoCapitalize="none"
              keyboardType="default"
            />

            <Text style={styles.modalLabel}>배경 색상</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.colorSelector}
            >
              {customTagColors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    customTagColor === color && styles.selectedColorOption,
                  ]}
                  onPress={() => setCustomTagColor(color)}
                />
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCustomTagModal(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveModalButton]}
                onPress={handleCustomTagSave}
              >
                <Text style={styles.saveModalButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveHeaderButton: {
    color: '#007AFF',
  },
  disabledHeaderButton: {
    color: '#999',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  dateButton: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  dateButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  dateButtonSubtext: {
    fontSize: 14,
    color: '#666',
  },
  calendarContainer: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  titleInput: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    fontSize: 16,
    color: '#333',
  },
  contentInput: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    fontSize: 16,
    color: '#333',
    minHeight: 200,
    textAlignVertical: 'top',
  },
  moodScrollView: {
    marginHorizontal: -4,
  },
  moodOption: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 20,
    minWidth: 80,
  },
  selectedMoodOption: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    marginBottom: 10,
  },
  selectedTag: {
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  customTagButton: {
    backgroundColor: '#666',
  },
  tagIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  selectedTagsContainer: {
    marginTop: 16,
  },
  selectedTagsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  selectedTagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  selectedTagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 4,
  },
  selectedTagIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  selectedTagText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    marginRight: 4,
  },
  removeTagButton: {
    padding: 2,
  },
  removeTagText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#999',
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    maxWidth: 400,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  iconSelector: {
    marginBottom: 8,
  },
  iconOption: {
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  selectedIconOption: {
    backgroundColor: '#007AFF',
  },
  iconOptionText: {
    fontSize: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  colorSelector: {
    marginBottom: 16,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveModalButton: {
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  saveModalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  categoryOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  categoryOption: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    marginVertical: 4,
    marginHorizontal: 2,
  },
  selectedCategoryOption: {
    borderWidth: 3,
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  categoryLabel: {
    color: '#333',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  photoButton: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedImagesContainer: {
    marginTop: 16,
  },
  selectedImagesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  imagesScrollView: {
    marginHorizontal: -4,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    overflow: 'hidden',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4757',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  removeImageText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    lineHeight: 12,
  },
});

export default WriteEntryScreen;
