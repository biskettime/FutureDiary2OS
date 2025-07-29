import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/Feather';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  details: string[];
  tips?: string[];
}

const HowToUseScreen: React.FC = () => {
  const navigation = useNavigation();
  const safeAreaInsets = useSafeAreaInsets();
  const { currentTheme } = useTheme();
  const [selectedStep, setSelectedStep] = useState<GuideStep | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const guideSteps: GuideStep[] = [
    {
      id: 'write',
      title: '미래일기 작성하기',
      description: '미래에 일어날 일을 상상하여 작성해보세요',
      icon: '✏️',
      details: [
        '홈 화면의 "+" 버튼을 눌러 새 일기를 작성하세요',
        '미래의 날짜를 선택하고 제목을 입력하세요',
        '어떤 일이 일어날지 자세히 상상해서 적어보세요',
        '기분, 날씨, 태그 등을 추가해서 더 생생하게 만들어보세요',
        '사진을 추가하면 더욱 특별한 일기가 됩니다',
      ],
      tips: [
        '구체적이고 긍정적인 내용으로 작성하면 더 좋아요!',
        '작은 일상부터 큰 꿈까지 다양하게 써보세요',
      ],
    },
    {
      id: 'timeline',
      title: '타임라인 확인하기',
      description: '과거와 미래의 일기들을 시간순으로 확인하세요',
      icon: '⏰',
      details: [
        '타임라인 탭에서 모든 일기를 시간순으로 볼 수 있어요',
        '오늘 일어날 예정인 일기들이 상단에 표시됩니다',
        '미래 일기들은 가로 스크롤로 확인할 수 있어요',
        '각 카드를 터치하면 상세 내용을 볼 수 있습니다',
      ],
      tips: [
        '오늘 일어날 일이 있다면 "어떻게 되었나요?" 버튼을 눌러 결과를 기록해보세요',
      ],
    },
    {
      id: 'result',
      title: '실제 결과 기록하기',
      description: '예상했던 일이 실제로 어떻게 되었는지 기록하세요',
      icon: '✅',
      details: [
        '타임라인에서 오늘 날짜의 일기를 확인하세요',
        '"어떻게 되었나요?" 버튼을 눌러 결과를 기록하세요',
        '이루어졌는지, 아직 실현되지 않았는지 선택하세요',
        '자세한 내용을 추가로 적을 수 있어요',
        '나중에 결과를 수정할 수도 있습니다',
      ],
      tips: ['실현되지 않은 일도 괜찮아요. 다시 도전해보면 됩니다!'],
    },
    {
      id: 'search',
      title: '일기 검색하기',
      description: '원하는 일기를 빠르게 찾아보세요',
      icon: '🔍',
      details: [
        '검색 탭에서 키워드를 입력해 일기를 찾을 수 있어요',
        '제목, 내용, 태그 등으로 검색할 수 있습니다',
        '날짜별로 필터링도 가능해요',
        '기분이나 카테고리로도 찾을 수 있어요',
      ],
      tips: ['태그를 많이 활용하면 검색이 더 쉬워져요'],
    },
    {
      id: 'themes',
      title: '테마 꾸미기',
      description: '다양한 테마로 앱을 개성있게 꾸며보세요',
      icon: '🎨',
      details: [
        '설정 > 테마 상점에서 다양한 테마를 확인하세요',
        '천사, 은하수, 로즈골드 등 아름다운 테마들이 있어요',
        '각 테마마다 고유한 배경과 색상을 제공합니다',
        '기분에 따라 테마를 바꿔보세요',
      ],
      tips: ['테마는 언제든지 변경할 수 있어요'],
    },
    {
      id: 'secret',
      title: '비밀 보관함',
      description: '특별한 일기를 안전하게 보관하세요',
      icon: '🔒',
      details: [
        '일기 작성 시 "비밀 보관함에 저장" 옵션을 선택하세요',
        '비밀 보관함의 일기는 별도로 관리됩니다',
        '설정 > 비밀 보관함에서 확인할 수 있어요',
        '개인적이고 소중한 일기를 안전하게 보관하세요',
      ],
      tips: ['비밀 보관함은 개인적인 꿈과 목표를 적기에 좋아요'],
    },
  ];

  const handleStepPress = (step: GuideStep) => {
    setSelectedStep(step);
    setShowDetailModal(true);
  };

  const renderGuideStep = (step: GuideStep, index: number) => (
    <TouchableOpacity
      key={step.id}
      style={[
        styles.stepCard,
        {
          backgroundColor: currentTheme.colors.surface,
          borderLeftColor: currentTheme.colors.primary,
        },
      ]}
      onPress={() => handleStepPress(step)}
      activeOpacity={0.7}
    >
      <View style={styles.stepContent}>
        <View style={styles.stepNumber}>
          <Text
            style={[
              styles.stepNumberText,
              { color: currentTheme.colors.primary },
            ]}
          >
            {index + 1}
          </Text>
        </View>
        <View style={styles.stepIcon}>
          <Text style={styles.stepIconText}>{step.icon}</Text>
        </View>
        <View style={styles.stepText}>
          <Text style={[styles.stepTitle, { color: currentTheme.colors.text }]}>
            {step.title}
          </Text>
          <Text
            style={[
              styles.stepDescription,
              { color: currentTheme.colors.textSecondary },
            ]}
          >
            {step.description}
          </Text>
        </View>
        <Icon
          name="chevron-right"
          size={20}
          color={currentTheme.colors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: currentTheme.colors.background },
      ]}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: safeAreaInsets.top + 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={currentTheme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text
            style={[styles.headerTitle, { color: currentTheme.colors.text }]}
          >
            사용방법
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: currentTheme.colors.textSecondary },
            ]}
          >
            미래일기를 더 잘 활용해보세요
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.introSection}>
          <Text
            style={[styles.introTitle, { color: currentTheme.colors.text }]}
          >
            🌟 미래일기와 함께하는 여행
          </Text>
          <Text
            style={[
              styles.introText,
              { color: currentTheme.colors.textSecondary },
            ]}
          >
            미래를 상상하고, 기록하고, 돌아보는 특별한 경험을 시작해보세요. 각
            단계를 따라하면 더욱 의미있는 일기를 작성할 수 있어요.
          </Text>
        </View>

        <View style={styles.stepsContainer}>
          {guideSteps.map((step, index) => renderGuideStep(step, index))}
        </View>

        <View style={styles.tipSection}>
          <Text style={[styles.tipTitle, { color: currentTheme.colors.text }]}>
            💡 미래일기 꿀팁
          </Text>
          <View
            style={[
              styles.tipCard,
              { backgroundColor: currentTheme.colors.surface },
            ]}
          >
            <Text
              style={[
                styles.tipText,
                { color: currentTheme.colors.textSecondary },
              ]}
            >
              • 매일 조금씩이라도 미래를 상상해보세요{'\n'}• 작은 목표부터 큰
              꿈까지 다양하게 적어보세요{'\n'}• 긍정적인 마음가짐으로 작성하면
              더 좋아요{'\n'}• 실현된 일기를 다시 읽어보며 성취감을 느껴보세요
              {'\n'}• 친구들과 함께 미래 계획을 공유해보세요
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: currentTheme.colors.surface },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalIcon}>{selectedStep?.icon}</Text>
                <Text
                  style={[
                    styles.modalTitle,
                    { color: currentTheme.colors.text },
                  ]}
                >
                  {selectedStep?.title}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowDetailModal(false)}
                style={styles.closeButton}
              >
                <Icon
                  name="x"
                  size={24}
                  color={currentTheme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text
                style={[
                  styles.modalDescription,
                  { color: currentTheme.colors.textSecondary },
                ]}
              >
                {selectedStep?.description}
              </Text>

              <View style={styles.detailsSection}>
                <Text
                  style={[
                    styles.detailsTitle,
                    { color: currentTheme.colors.text },
                  ]}
                >
                  상세 방법:
                </Text>
                {selectedStep?.details.map((detail, index) => (
                  <View key={index} style={styles.detailItem}>
                    <Text
                      style={[
                        styles.detailBullet,
                        { color: currentTheme.colors.primary },
                      ]}
                    >
                      •
                    </Text>
                    <Text
                      style={[
                        styles.detailText,
                        { color: currentTheme.colors.textSecondary },
                      ]}
                    >
                      {detail}
                    </Text>
                  </View>
                ))}
              </View>

              {selectedStep?.tips && selectedStep.tips.length > 0 && (
                <View style={styles.tipsSection}>
                  <Text
                    style={[
                      styles.tipsTitle,
                      { color: currentTheme.colors.text },
                    ]}
                  >
                    💡 팁:
                  </Text>
                  {selectedStep.tips.map((tip, index) => (
                    <View
                      key={index}
                      style={[
                        styles.tipItem,
                        { backgroundColor: currentTheme.colors.background },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tipItemText,
                          { color: currentTheme.colors.textSecondary },
                        ]}
                      >
                        {tip}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  introSection: {
    marginBottom: 32,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    opacity: 0.8,
  },
  stepsContainer: {
    marginBottom: 32,
  },
  stepCard: {
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepIcon: {
    marginRight: 12,
  },
  stepIconText: {
    fontSize: 24,
  },
  stepText: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  tipSection: {
    marginBottom: 20,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tipCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    paddingHorizontal: 20,
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    opacity: 0.8,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingRight: 16,
  },
  detailBullet: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  detailText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
    opacity: 0.8,
  },
  tipsSection: {
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipItem: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  tipItemText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});

export default HowToUseScreen;
