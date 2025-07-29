import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/AuthService';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  onPress: () => void;
  showArrow?: boolean;
}

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { currentTheme } = useTheme();
  const { user } = useAuth();

  const handleSecretStore = () => {
    navigation.navigate('SecretStore');
  };

  const handleThemeStore = () => {
    navigation.navigate('ThemeStore');
  };

  const handleHowToUse = () => {
    navigation.navigate('HowToUse');
  };

  const handleAbout = () => {
    Alert.alert(
      '미래일기 정보',
      '버전: 1.0.0\n개발자: 미래일기 팀\n\n더 나은 일기 경험을 위해 계속 업데이트됩니다.',
      [{ text: '확인' }],
    );
  };

  const handleLogout = () => {
    const userName = user?.displayName || user?.email || '사용자';

    Alert.alert('로그아웃', `${userName}님, 정말 로그아웃하시겠습니까?`, [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          try {
            await authService.signOut();
            console.log('✅ 로그아웃 완료');
          } catch (error) {
            console.error('❌ 로그아웃 실패:', error);
            Alert.alert('오류', '로그아웃에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.settingItem,
        { borderBottomColor: currentTheme.colors.border },
      ]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingItemLeft}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: currentTheme.colors.secondary },
          ]}
        >
          <Text style={styles.iconText}>{item.icon}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text
            style={[styles.settingTitle, { color: currentTheme.colors.text }]}
          >
            {item.title}
          </Text>
          {item.subtitle && (
            <Text
              style={[
                styles.settingSubtitle,
                { color: currentTheme.colors.textSecondary },
              ]}
            >
              {item.subtitle}
            </Text>
          )}
        </View>
      </View>
      {item.showArrow !== false && (
        <Text
          style={[
            styles.arrowText,
            { color: currentTheme.colors.textSecondary },
          ]}
        >
          ›
        </Text>
      )}
    </TouchableOpacity>
  );

  const settingSections = [
    {
      title: '🎨 개인화',
      items: [
        {
          id: 'theme-store',
          title: '테마 상점',
          subtitle: '다양한 테마로 앱을 꾸며보세요',
          icon: '🎨',
          onPress: handleThemeStore,
        },
        {
          id: 'secret-store',
          title: '비밀 보관함',
          subtitle: '특별한 일기를 안전하게 보관하세요',
          icon: '🔒',
          onPress: handleSecretStore,
        },
      ],
    },
    {
      title: '📚 도움말',
      items: [
        {
          id: 'how-to-use',
          title: '사용방법',
          subtitle: '미래일기를 더 잘 활용하는 방법을 알아보세요',
          icon: '📖',
          onPress: handleHowToUse,
        },
      ],
    },
    {
      title: '📱 정보',
      items: [
        {
          id: 'about',
          title: '앱 정보',
          subtitle: '버전 및 개발자 정보',
          icon: 'ℹ️',
          onPress: handleAbout,
        },
      ],
    },
    {
      title: '🔐 계정',
      items: [
        {
          id: 'user-info',
          title: user?.displayName || user?.email || '익명 사용자',
          subtitle: user?.isAnonymous ? '익명 계정' : '로그인된 계정',
          icon: user?.isAnonymous ? '👤' : '👨‍💻',
          onPress: () => {},
          showArrow: false,
        },
        {
          id: 'logout',
          title: '로그아웃',
          subtitle: '현재 계정에서 로그아웃합니다',
          icon: '🚪',
          onPress: handleLogout,
        },
      ],
    },
  ];

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: currentTheme.colors.background },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: currentTheme.colors.surface },
        ]}
      >
        <Text style={[styles.headerTitle, { color: currentTheme.colors.text }]}>
          설정
        </Text>
        <Text
          style={[
            styles.headerSubtitle,
            { color: currentTheme.colors.textSecondary },
          ]}
        >
          앱 설정 및 개인화
        </Text>
      </View>

      {settingSections.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: currentTheme.colors.text }]}
          >
            {section.title}
          </Text>
          <View
            style={[
              styles.sectionContent,
              { backgroundColor: currentTheme.colors.surface },
            ]}
          >
            {section.items.map(renderSettingItem)}
          </View>
        </View>
      ))}

      <View style={styles.footer}>
        <Text
          style={[
            styles.footerText,
            { color: currentTheme.colors.textSecondary },
          ]}
        >
          미래 일기 v1.0.0
        </Text>
        <Text
          style={[
            styles.footerSubtext,
            { color: currentTheme.colors.textSecondary },
          ]}
        >
          더 나은 일기 경험을 위해 계속 업데이트됩니다.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  arrowText: {
    fontSize: 18,
    fontWeight: '300',
  },
  footer: {
    alignItems: 'center',
    padding: 32,
    marginTop: 24,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default SettingsScreen;
