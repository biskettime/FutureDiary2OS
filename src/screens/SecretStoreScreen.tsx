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
import AngelBackground from '../components/AngelBackground';

interface StoreItem {
  id: string;
  title: string;
  description: string;
  price: number;
  icon: string;
  category: 'theme' | 'feature' | 'security';
  isPurchased?: boolean;
  onPurchase: () => void;
}

const SecretStoreScreen: React.FC = () => {
  const { currentTheme, allThemes, applyTheme, purchaseTheme } = useTheme();
  const [loading, setLoading] = useState<string | null>(null);

  const handleThemePurchase = async (theme: Theme) => {
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

  const handleThemeApply = async (theme: Theme) => {
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

  const handleFeaturePurchase = (item: StoreItem) => {
    Alert.alert(
      '기능 구매',
      `${item.title}을 ${item.price.toLocaleString()}원에 구매하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '구매',
          onPress: () => {
            Alert.alert('준비 중', '이 기능은 곧 출시될 예정입니다!');
          },
        },
      ],
    );
  };

  const renderThemeSection = () => {
    const premiumThemes = allThemes.filter(
      theme => theme.category === 'premium',
    );
    const freeThemes = allThemes.filter(theme => theme.category === 'free');

    return (
      <View style={styles.section}>
        <Text
          style={[styles.sectionTitle, { color: currentTheme.colors.text }]}
        >
          🎨 프리미엄 테마
        </Text>
        <Text
          style={[
            styles.sectionDescription,
            { color: currentTheme.colors.textSecondary },
          ]}
        >
          특별한 분위기의 일기 테마를 구매하세요
        </Text>

        {premiumThemes.map(theme => (
          <View
            key={theme.id}
            style={[
              styles.storeItem,
              {
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.border,
              },
            ]}
          >
            <View style={styles.itemHeader}>
              <Text style={styles.itemIcon}>{theme.icons.diary}</Text>
              <View style={styles.itemInfo}>
                <Text
                  style={[
                    styles.itemTitle,
                    { color: currentTheme.colors.text },
                  ]}
                >
                  {theme.name}
                </Text>
                <Text
                  style={[
                    styles.itemDescription,
                    { color: currentTheme.colors.textSecondary },
                  ]}
                >
                  {theme.description}
                </Text>
              </View>
              <Text
                style={[
                  styles.itemPrice,
                  { color: currentTheme.colors.accent },
                ]}
              >
                {theme.price?.toLocaleString()}원
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.purchaseButton,
                { backgroundColor: currentTheme.colors.accent },
              ]}
              onPress={() => handleThemePurchase(theme)}
              disabled={loading === theme.id}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: currentTheme.colors.background },
                ]}
              >
                {loading === theme.id ? '구매 중...' : '구매'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        <Text
          style={[
            styles.sectionTitle,
            { color: currentTheme.colors.text, marginTop: 24 },
          ]}
        >
          🎨 무료 테마
        </Text>
        <Text
          style={[
            styles.sectionDescription,
            { color: currentTheme.colors.textSecondary },
          ]}
        >
          기본 제공되는 테마들
        </Text>

        {freeThemes.map(theme => (
          <View
            key={theme.id}
            style={[
              styles.storeItem,
              {
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.border,
              },
            ]}
          >
            <View style={styles.itemHeader}>
              <Text style={styles.itemIcon}>{theme.icons.diary}</Text>
              <View style={styles.itemInfo}>
                <Text
                  style={[
                    styles.itemTitle,
                    { color: currentTheme.colors.text },
                  ]}
                >
                  {theme.name}
                </Text>
                <Text
                  style={[
                    styles.itemDescription,
                    { color: currentTheme.colors.textSecondary },
                  ]}
                >
                  {theme.description}
                </Text>
              </View>
              <Text
                style={[
                  styles.itemPrice,
                  { color: currentTheme.colors.success },
                ]}
              >
                무료
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.purchaseButton,
                { backgroundColor: currentTheme.colors.primary },
              ]}
              onPress={() => handleThemeApply(theme)}
              disabled={loading === theme.id}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: currentTheme.colors.background },
                ]}
              >
                {loading === theme.id ? '적용 중...' : '적용'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const renderFeatureSection = () => {
    const features: StoreItem[] = [
      {
        id: 'export',
        title: '고급 내보내기',
        description: 'PDF, Word 등 다양한 형식으로 내보내기',
        price: 1900,
        icon: '📄',
        category: 'feature',
        onPurchase: () => handleFeaturePurchase,
      },
    ];

    return (
      <View style={styles.section}>
        <Text
          style={[styles.sectionTitle, { color: currentTheme.colors.text }]}
        >
          ⚡ 프리미엄 기능
        </Text>
        <Text
          style={[
            styles.sectionDescription,
            { color: currentTheme.colors.textSecondary },
          ]}
        >
          더욱 편리한 일기 작성 기능
        </Text>

        {features
          .filter(f => f.category === 'feature')
          .map(item => (
            <View
              key={item.id}
              style={[
                styles.storeItem,
                {
                  backgroundColor: currentTheme.colors.surface,
                  borderColor: currentTheme.colors.border,
                },
              ]}
            >
              <View style={styles.itemHeader}>
                <Text style={styles.itemIcon}>{item.icon}</Text>
                <View style={styles.itemInfo}>
                  <Text
                    style={[
                      styles.itemTitle,
                      { color: currentTheme.colors.text },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.itemDescription,
                      { color: currentTheme.colors.textSecondary },
                    ]}
                  >
                    {item.description}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.itemPrice,
                    { color: currentTheme.colors.accent },
                  ]}
                >
                  {item.price.toLocaleString()}원
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.purchaseButton,
                  { backgroundColor: currentTheme.colors.accent },
                ]}
                onPress={() => handleFeaturePurchase(item)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: currentTheme.colors.background },
                  ]}
                >
                  구매
                </Text>
              </TouchableOpacity>
            </View>
          ))}
      </View>
    );
  };

  return (
    <AngelBackground>
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
          <Text
            style={[styles.headerTitle, { color: currentTheme.colors.text }]}
          >
            🔒 비밀 일기 스토어
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: currentTheme.colors.textSecondary },
            ]}
          >
            프리미엄 기능과 테마를 구매하세요
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {renderThemeSection()}
          {renderFeatureSection()}

          <View style={styles.footer}>
            <Text
              style={[
                styles.footerText,
                { color: currentTheme.colors.textSecondary },
              ]}
            >
              모든 구매는 영구적으로 적용됩니다
            </Text>
          </View>
        </ScrollView>
      </View>
    </AngelBackground>
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  storeItem: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  purchaseButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default SecretStoreScreen;
