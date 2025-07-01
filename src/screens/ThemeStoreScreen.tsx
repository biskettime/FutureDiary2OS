import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../types';

const ThemeStoreScreen: React.FC = () => {
  const { currentTheme, allThemes, applyTheme, purchaseTheme } = useTheme();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (theme: Theme) => {
    if (theme.category === 'free') {
      Alert.alert('알림', '이미 무료 테마입니다.');
      return;
    }

    Alert.alert(
      '테마 구매',
      `${
        theme.name
      } 테마를 ${theme.price?.toLocaleString()}원에 구매하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '구매',
          onPress: async () => {
            setLoading(theme.id);
            try {
              await purchaseTheme(theme.id);
              Alert.alert('성공', '테마가 성공적으로 구매되었습니다!');
            } catch (error) {
              Alert.alert('오류', '구매 중 오류가 발생했습니다.');
            } finally {
              setLoading(null);
            }
          },
        },
      ],
    );
  };

  const handleApply = async (theme: Theme) => {
    if (theme.category === 'premium') {
      Alert.alert('알림', '먼저 테마를 구매해주세요.');
      return;
    }

    setLoading(theme.id);
    try {
      await applyTheme(theme.id);
      Alert.alert('성공', '테마가 적용되었습니다!');
    } catch (error) {
      Alert.alert('오류', '테마 적용 중 오류가 발생했습니다.');
    } finally {
      setLoading(null);
    }
  };

  const renderThemeCard = (theme: Theme) => {
    const isCurrentTheme = currentTheme.id === theme.id;
    const isPurchased = theme.category === 'free';
    const isPremium = theme.category === 'premium';

    return (
      <View
        key={theme.id}
        style={[
          styles.themeCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: isCurrentTheme
              ? theme.colors.primary
              : theme.colors.border,
            borderWidth: isCurrentTheme ? 2 : 1,
          },
        ]}
      >
        {/* 테마 미리보기 - 타임라인 */}
        <View
          style={[
            styles.themePreview,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.previewHeader}>
            <Text style={[styles.previewTitle, { color: theme.colors.text }]}>
              {theme.icons.diary} 타임라인 미리보기
            </Text>
          </View>
          <View style={styles.timelineContainer}>
            {/* 오늘 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineDate}>
                <Text
                  style={[
                    styles.timelineDateText,
                    { color: theme.colors.primary },
                  ]}
                >
                  오늘
                </Text>
                <Text
                  style={[styles.timelineDateNum, { color: theme.colors.text }]}
                >
                  12/25
                </Text>
              </View>
              <View
                style={[
                  styles.timelineContent,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <Text
                  style={[styles.timelineTitle, { color: theme.colors.text }]}
                >
                  크리스마스 파티 {theme.icons.heart}
                </Text>
                <Text
                  style={[
                    styles.timelineText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  친구들과 즐거운 시간을 보내고...
                </Text>
                <View style={styles.timelineTags}>
                  <View
                    style={[
                      styles.timelineTag,
                      { backgroundColor: theme.colors.accent },
                    ]}
                  >
                    <Text
                      style={[
                        styles.timelineTagText,
                        { color: theme.colors.background },
                      ]}
                    >
                      친구
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 내일 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineDate}>
                <Text
                  style={[
                    styles.timelineDateText,
                    { color: theme.colors.secondary },
                  ]}
                >
                  내일
                </Text>
                <Text
                  style={[styles.timelineDateNum, { color: theme.colors.text }]}
                >
                  12/26
                </Text>
              </View>
              <View
                style={[
                  styles.timelineContent,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <Text
                  style={[styles.timelineTitle, { color: theme.colors.text }]}
                >
                  새로운 프로젝트 시작 {theme.icons.star}
                </Text>
                <Text
                  style={[
                    styles.timelineText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  새로운 도전이 기다리고 있어...
                </Text>
                <View style={styles.timelineTags}>
                  <View
                    style={[
                      styles.timelineTag,
                      { backgroundColor: theme.colors.success },
                    ]}
                  >
                    <Text
                      style={[
                        styles.timelineTagText,
                        { color: theme.colors.background },
                      ]}
                    >
                      회사
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 다음 주 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineDate}>
                <Text
                  style={[
                    styles.timelineDateText,
                    { color: theme.colors.warning },
                  ]}
                >
                  1/2
                </Text>
                <Text
                  style={[styles.timelineDateNum, { color: theme.colors.text }]}
                >
                  목표
                </Text>
              </View>
              <View
                style={[
                  styles.timelineContent,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <Text
                  style={[styles.timelineTitle, { color: theme.colors.text }]}
                >
                  새해 결심 실천하기 {theme.icons.sun}
                </Text>
                <Text
                  style={[
                    styles.timelineText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  올해는 정말 달라질 거야...
                </Text>
                <View style={styles.timelineTags}>
                  <View
                    style={[
                      styles.timelineTag,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  >
                    <Text
                      style={[
                        styles.timelineTagText,
                        { color: theme.colors.background },
                      ]}
                    >
                      개인
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 테마 정보 */}
        <View style={styles.themeInfo}>
          <Text style={[styles.themeName, { color: theme.colors.text }]}>
            {theme.name}
          </Text>
          <Text
            style={[
              styles.themeDescription,
              { color: theme.colors.textSecondary },
            ]}
          >
            {theme.description}
          </Text>

          {/* 가격 정보 */}
          <View style={styles.priceContainer}>
            {isPremium ? (
              <Text style={[styles.price, { color: theme.colors.accent }]}>
                {theme.price?.toLocaleString()}원
              </Text>
            ) : (
              <Text style={[styles.free, { color: theme.colors.success }]}>
                무료
              </Text>
            )}
          </View>

          {/* 상태 표시 */}
          {isCurrentTheme && (
            <View
              style={[
                styles.currentBadge,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text
                style={[styles.currentText, { color: theme.colors.background }]}
              >
                현재 적용됨
              </Text>
            </View>
          )}

          {/* 액션 버튼 */}
          <View style={styles.actionButtons}>
            {isCurrentTheme ? (
              <View
                style={[
                  styles.appliedButton,
                  { backgroundColor: theme.colors.success },
                ]}
              >
                <Text
                  style={[
                    styles.appliedText,
                    { color: theme.colors.background },
                  ]}
                >
                  적용됨
                </Text>
              </View>
            ) : (
              <>
                {isPremium && (
                  <TouchableOpacity
                    style={[
                      styles.purchaseButton,
                      { backgroundColor: theme.colors.accent },
                    ]}
                    onPress={() => handlePurchase(theme)}
                    disabled={loading === theme.id}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        { color: theme.colors.background },
                      ]}
                    >
                      {loading === theme.id ? '구매 중...' : '구매'}
                    </Text>
                  </TouchableOpacity>
                )}
                {isPurchased && (
                  <TouchableOpacity
                    style={[
                      styles.applyButton,
                      { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={() => handleApply(theme)}
                    disabled={loading === theme.id}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        { color: theme.colors.background },
                      ]}
                    >
                      {loading === theme.id ? '적용 중...' : '적용'}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: currentTheme.colors.background },
      ]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: currentTheme.colors.surface },
        ]}
      >
        <Text style={[styles.headerTitle, { color: currentTheme.colors.text }]}>
          {currentTheme.icons.settings} 테마 스토어
        </Text>
        <Text
          style={[
            styles.headerSubtitle,
            { color: currentTheme.colors.textSecondary },
          ]}
        >
          나만의 특별한 일기 테마를 선택하세요
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.themesContainer}>
          {allThemes.map(renderThemeCard)}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  themesContainer: {
    padding: 16,
  },
  themeCard: {
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  themePreview: {
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  previewHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  timelineContainer: {
    flex: 1,
    padding: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  timelineDate: {
    width: 50,
    alignItems: 'center',
    marginRight: 8,
  },
  timelineDateText: {
    fontSize: 10,
    fontWeight: '600',
  },
  timelineDateNum: {
    fontSize: 8,
    marginTop: 2,
  },
  timelineContent: {
    flex: 1,
    borderRadius: 8,
    padding: 8,
  },
  timelineTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  timelineText: {
    fontSize: 9,
    marginBottom: 4,
  },
  timelineTags: {
    flexDirection: 'row',
  },
  timelineTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  timelineTagText: {
    fontSize: 8,
    fontWeight: '500',
  },
  themeInfo: {
    gap: 8,
  },
  themeName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  themeDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  priceContainer: {
    marginTop: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  free: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  currentBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  currentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  purchaseButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  appliedButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  appliedText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ThemeStoreScreen;
