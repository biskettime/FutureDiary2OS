import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../types';

const ThemeStoreScreen: React.FC = () => {
  const { currentTheme, allThemes, applyTheme, purchaseTheme, refreshThemes } =
    useTheme();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (theme: Theme) => {
    // 구매 확인 다이얼로그
    Alert.alert(
      '💰 테마 구매',
      `"${theme.name}" 테마를 ${theme.price}원에 구매하시겠습니까?\n\n💡 구매 후 바로 적용됩니다!`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: `${theme.price}원 결제`,
          onPress: async () => {
            setLoading(theme.id);
            try {
              // 실제 결제 로직은 여기에 구현
              await new Promise(resolve => setTimeout(resolve, 1500)); // 결제 시뮬레이션

              // 테마 구매 처리 (구매 후 바로 적용)
              await purchaseTheme(theme.id);

              // 테마 목록 새로고침
              await refreshThemes();

              Alert.alert(
                '🎉 구매 완료!',
                `"${theme.name}" 테마가 성공적으로 구매되어 적용되었습니다!\n\n이제 언제든지 이 테마를 사용할 수 있습니다! 💖`,
                [{ text: '확인' }],
              );
            } catch (error: any) {
              console.error('테마 구매 중 오류:', error);
              Alert.alert(
                '💸 구매 실패',
                error.message ||
                  '테마 구매 중 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.',
                [{ text: '확인' }],
              );
            } finally {
              setLoading(null);
            }
          },
        },
      ],
    );
  };

  const handleApply = async (theme: Theme) => {
    console.log(
      '🎨 ThemeStore: 테마 적용 시도 - 테마 ID:',
      theme.id,
      '카테고리:',
      theme.category,
    );

    if (theme.category === 'premium') {
      console.log('🔒 ThemeStore: 프리미엄 테마 - 구매 필요');
      Alert.alert(
        '🔒 구매 필요',
        `"${theme.name}" 테마는 프리미엄 테마입니다.\n먼저 구매해주세요!`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '구매하기',
            onPress: () => handlePurchase(theme),
          },
        ],
      );
      return;
    }

    console.log('✅ ThemeStore: 무료 테마 - 적용 시작');
    setLoading(theme.id);
    try {
      console.log('🎨 ThemeStore: applyTheme 호출 중...');
      await applyTheme(theme.id);
      console.log('✅ ThemeStore: 테마 적용 완료');
      Alert.alert('🎨 적용 완료!', `"${theme.name}" 테마가 적용되었습니다!`);
      // 테마 목록 새로고침
      console.log('🔄 ThemeStore: 테마 목록 새로고침 중...');
      await refreshThemes();
      console.log('✅ ThemeStore: 테마 목록 새로고침 완료');
    } catch (error: any) {
      console.error('❌ ThemeStore: 테마 적용 실패:', error);
      Alert.alert(
        '적용 실패',
        error.message || '테마 적용 중 오류가 발생했습니다.',
      );
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
          {/* 테마별 특별 이미지 - 우측상단 */}
          {theme.id === 'angel' && (
            <Image
              source={require('../images/angel01.png')}
              style={styles.previewSpecialImage}
              resizeMode="contain"
            />
          )}
          {theme.id === 'galaxy-dream' && (
            <Image
              source={require('../images/enhasu.png')}
              style={styles.previewSpecialImage}
              resizeMode="contain"
            />
          )}
          {theme.id === 'rosegold-love' && (
            <Image
              source={require('../images/romance.png')}
              style={styles.previewSpecialImage}
              resizeMode="contain"
            />
          )}
          {theme.id === 'moonlight-serenade' && (
            <Image
              source={require('../images/moonra.png')}
              style={styles.previewSpecialImage}
              resizeMode="contain"
            />
          )}
          {/* 헤더 */}
          <View style={styles.previewHeader}>
            <Text
              style={[styles.previewTitle, { color: theme.colors.text }]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.8}
            >
              {theme.icons.star} 미래일기 타임라인
            </Text>
            <Text
              style={[
                styles.previewSubtitle,
                { color: theme.colors.textSecondary },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.8}
            >
              오늘부터 시작되는 나의 미래 여행
            </Text>
          </View>

          {/* 오늘 일어날 일 섹션 */}
          <View
            style={[
              styles.todaySection,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View style={styles.todayHeaderRow}>
              <Text style={[styles.todayTitle, { color: theme.colors.text }]}>
                ☀️ 오늘 일어날 일!
              </Text>
              <Text
                style={[
                  styles.todayBadge,
                  {
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.background,
                  },
                ]}
              >
                Today
              </Text>
            </View>

            {/* 오늘 카드 */}
            <View
              style={[
                styles.todayCard,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <View style={styles.todayCardHeader}>
                <Text style={styles.todayCardEmoji}>📝</Text>
                <Text
                  style={[styles.todayCardTitle, { color: theme.colors.text }]}
                  numberOfLines={1}
                >
                  특별한 하루
                </Text>
              </View>
              <Text
                style={[
                  styles.todayCardContent,
                  { color: theme.colors.textSecondary },
                ]}
                numberOfLines={1}
              >
                today.
              </Text>
              <View style={styles.todayCardStatus}>
                <Text
                  style={[
                    styles.todayCardStatusText,
                    { color: theme.colors.success },
                  ]}
                >
                  ✅ 이루어졌어요! 😊
                </Text>
              </View>
            </View>
          </View>

          {/* 미래 일기 섹션 */}
          <View style={styles.futureSection}>
            <View style={styles.futureCardsRow}>
              <View style={styles.futureCardContainer}>
                <Text
                  style={[
                    styles.futureLabel,
                    {
                      backgroundColor: theme.colors.secondary,
                      color: theme.colors.background,
                    },
                  ]}
                >
                  Future
                </Text>
                <Text
                  style={[
                    styles.futureDateText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  2월 후 • 7월 26일 (토)
                </Text>
                <View
                  style={[
                    styles.futureCard,
                    { backgroundColor: theme.colors.surface },
                  ]}
                >
                  <Text style={styles.futureCardEmoji}>📝</Text>
                  <Text
                    style={[
                      styles.futureCardNumber,
                      { color: theme.colors.text },
                    ]}
                  >
                    26
                  </Text>
                  <Text
                    style={[
                      styles.futureCardDesc,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    the day
                  </Text>
                </View>
              </View>

              <View style={styles.futureCardContainer}>
                <Text
                  style={[
                    styles.futureLabel,
                    {
                      backgroundColor: theme.colors.secondary,
                      color: theme.colors.background,
                    },
                  ]}
                >
                  Future
                </Text>
                <Text
                  style={[
                    styles.futureDateText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  6월 후 • 7월 30일 (목)
                </Text>
                <View
                  style={[
                    styles.futureCard,
                    { backgroundColor: theme.colors.surface },
                  ]}
                >
                  <Text style={styles.futureCardEmoji}>😊</Text>
                  <Text
                    style={[
                      styles.futureCardNumber,
                      { color: theme.colors.text },
                    ]}
                  >
                    2
                  </Text>
                  <Text
                    style={[
                      styles.futureCardDesc,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    2222
                  </Text>
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
    marginBottom: 2,
  },
  previewSubtitle: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineTagText: {
    fontSize: 8,
    fontWeight: '500',
  },
  // 새로운 타임라인 스타일들
  timelineIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  timelineIconText: {
    fontSize: 10,
  },
  timelineRightSection: {
    flex: 1,
  },
  titleEmojiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  entryEmoji: {
    fontSize: 12,
    marginRight: 6,
  },
  tagEmoji: {
    fontSize: 6,
    marginRight: 2,
  },
  // 새로운 타임라인 스타일들 (실제 구조에 맞게)
  todaySection: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  todayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  todayTitle: {
    fontSize: 10,
    fontWeight: '600',
  },
  todayBadge: {
    fontSize: 7,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  todayCard: {
    padding: 8,
    borderRadius: 8,
    marginTop: 2,
  },
  todayCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  todayCardEmoji: {
    fontSize: 10,
    marginRight: 4,
  },
  todayCardTitle: {
    fontSize: 9,
    fontWeight: '600',
  },
  todayCardContent: {
    fontSize: 7,
    marginBottom: 4,
  },
  todayCardStatus: {
    alignSelf: 'flex-start',
  },
  todayCardStatusText: {
    fontSize: 6,
    fontWeight: '500',
  },
  futureSection: {
    marginTop: 6,
    paddingHorizontal: 8,
  },
  futureCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  futureCardContainer: {
    flex: 0.48,
  },
  futureLabel: {
    fontSize: 6,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  futureDateText: {
    fontSize: 5,
    marginBottom: 3,
  },
  futureCard: {
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  futureCardEmoji: {
    fontSize: 8,
    marginBottom: 2,
  },
  futureCardNumber: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  futureCardDesc: {
    fontSize: 6,
    textAlign: 'center',
  },
  // 특별 이미지 스타일
  previewSpecialImage: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    zIndex: 10,
    opacity: 0.7,
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
