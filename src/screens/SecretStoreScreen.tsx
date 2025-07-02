import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import ThemeBackground from '../components/ThemeBackground';

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
  const { currentTheme } = useTheme();

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
    <ThemeBackground>
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
            프리미엄 기능을 구매하세요
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
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
    </ThemeBackground>
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
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 28,
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
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 20,
  },
  storeItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  purchaseButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
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
