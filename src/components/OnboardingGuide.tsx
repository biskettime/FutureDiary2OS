import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  position: 'top' | 'bottom' | 'center';
  target?: string; // 가이드할 요소의 ID
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: '위시어리에 오신 것을 환영합니다! 🌟',
    description: '간단한 가이드로 앱 사용법을 알아보세요.',
    icon: 'heart',
    position: 'center',
  },
  {
    id: 'write',
    title: '일기 작성하기 ✍️',
    description: '하단의 + 버튼을 눌러서 새로운 일기를 작성할 수 있어요.',
    icon: 'edit-3',
    position: 'bottom',
    target: 'write-button',
  },
  {
    id: 'timeline',
    title: '타임라인 보기 📅',
    description: '작성한 일기들을 시간순으로 확인할 수 있어요.',
    icon: 'calendar',
    position: 'top',
    target: 'timeline-tab',
  },
  {
    id: 'search',
    title: '일기 검색하기 🔍',
    description: '키워드나 날짜로 원하는 일기를 찾을 수 있어요.',
    icon: 'search',
    position: 'top',
    target: 'search-tab',
  },
  {
    id: 'settings',
    title: '설정 및 테마 변경 🎨',
    description: '다양한 테마로 앱을 꾸밀 수 있어요.',
    icon: 'settings',
    position: 'top',
    target: 'settings-tab',
  },
  {
    id: 'complete',
    title: '가이드 완료! 🎉',
    description: '이제 위시어리를 자유롭게 사용해보세요.',
    icon: 'check-circle',
    position: 'center',
  },
];

interface OnboardingGuideProps {
  visible: boolean;
  onComplete: () => void;
}

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({
  visible,
  onComplete,
}) => {
  const { currentTheme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));

  console.log('🎯 OnboardingGuide 렌더링:', {
    visible,
    currentStep,
    props: { visible, onComplete },
    modalVisible: visible,
  });

  React.useEffect(() => {
    console.log('🎯 OnboardingGuide useEffect 호출:', { visible });
    if (visible) {
      console.log('🎯 OnboardingGuide 표시 시작');
      console.log('🎯 currentStep 초기화: 0으로 설정');
      setCurrentStep(0); // 항상 첫 번째 단계부터 시작
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      console.log('🎯 OnboardingGuide 숨김');
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentStepData = onboardingSteps[currentStep];

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleSkip}
    >
      <Animated.View
        style={[
          styles.overlay,
          { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
          { opacity: fadeAnim },
        ]}
      >
        <View style={styles.container}>
          {/* 가이드 말풍선 */}
          <View
            style={[
              styles.tooltip,
              { backgroundColor: currentTheme.colors.surface },
              currentStepData.position === 'top' && styles.tooltipTop,
              currentStepData.position === 'bottom' && styles.tooltipBottom,
              currentStepData.position === 'center' && styles.tooltipCenter,
            ]}
          >
            {/* 아이콘 */}
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: currentTheme.colors.primary },
              ]}
            >
              <Icon name={currentStepData.icon} size={24} color="#FFFFFF" />
            </View>

            {/* 제목 */}
            <Text style={[styles.title, { color: currentTheme.colors.text }]}>
              {currentStepData.title}
            </Text>

            {/* 설명 */}
            <Text
              style={[
                styles.description,
                { color: currentTheme.colors.textSecondary },
              ]}
            >
              {currentStepData.description}
            </Text>

            {/* 진행 표시 */}
            <View style={styles.progressContainer}>
              {onboardingSteps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    {
                      backgroundColor:
                        index === currentStep
                          ? currentTheme.colors.primary
                          : currentTheme.colors.border,
                    },
                  ]}
                />
              ))}
            </View>

            {/* 버튼들 */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text
                  style={[
                    styles.skipButtonText,
                    { color: currentTheme.colors.textSecondary },
                  ]}
                >
                  건너뛰기
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.nextButton,
                  { backgroundColor: currentTheme.colors.primary },
                ]}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>
                  {currentStep === onboardingSteps.length - 1
                    ? '시작하기'
                    : '다음'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tooltip: {
    borderRadius: 16,
    padding: 24,
    maxWidth: width * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  tooltipTop: {
    marginBottom: 100,
  },
  tooltipBottom: {
    marginTop: 100,
  },
  tooltipCenter: {
    // 중앙에 위치
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingGuide;
