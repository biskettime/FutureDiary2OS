import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../contexts/ThemeContext';
import authService from '../services/AuthService';
import firestoreService from '../services/FirestoreService';
import { loadDiaryEntries } from '../utils/storage';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { currentTheme } = useTheme();
  const safeAreaInsets = useSafeAreaInsets();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // 이미 로그인된 상태인지 확인
    const unsubscribe = authService.onAuthStateChanged(user => {
      if (user) {
        console.log('✅ 이미 로그인된 사용자:', user.displayName || user.email);
        navigation.replace('MainTabs');
      }
    });

    return unsubscribe;
  }, [navigation]);

  // 로컬 데이터를 Firebase로 마이그레이션
  const migrateLocalData = async () => {
    try {
      console.log('🔄 로컬 데이터 마이그레이션 시작...');
      const localEntries = await loadDiaryEntries();

      if (localEntries.length > 0) {
        await firestoreService.migrateLocalDataToFirebase(localEntries);
        console.log('✅ 로컬 데이터 마이그레이션 완료');
      }
    } catch (error) {
      console.error('❌ 로컬 데이터 마이그레이션 실패:', error);
      // 마이그레이션 실패해도 로그인은 계속 진행
    }
  };

  // 이메일 로그인/회원가입
  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    if (!isLogin) {
      if (password !== confirmPassword) {
        Alert.alert('비밀번호 오류', '비밀번호가 일치하지 않습니다.');
        return;
      }

      if (password.length < 6) {
        Alert.alert('비밀번호 오류', '비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }

      if (!displayName.trim()) {
        Alert.alert('입력 오류', '사용자 이름을 입력해주세요.');
        return;
      }
    }

    setLoading(true);
    try {
      let user;

      if (isLogin) {
        console.log('📧 이메일 로그인 시도...');
        user = await authService.signInWithEmail(email, password);
      } else {
        console.log('📧 이메일 회원가입 시도...');
        user = await authService.signUpWithEmail(email, password, displayName);
      }

      // 사용자 프로필 저장
      await firestoreService.saveUserProfile(user);

      // 로컬 데이터 마이그레이션 (회원가입/첫 로그인 시)
      await migrateLocalData();

      console.log('✅ 인증 성공:', user.displayName || user.email);

      Alert.alert(
        '성공!',
        isLogin ? '로그인되었습니다!' : '회원가입이 완료되었습니다!',
        [
          {
            text: '확인',
            onPress: () => navigation.replace('MainTabs'),
          },
        ],
      );
    } catch (error: any) {
      console.error('❌ 인증 실패:', error);
      Alert.alert('인증 실패', error.toString());
    } finally {
      setLoading(false);
    }
  };

  // 구글 로그인
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      console.log('🔍 Google 로그인 시도...');
      const user = await authService.signInWithGoogle();

      // 사용자 프로필 저장
      await firestoreService.saveUserProfile(user);

      // 로컬 데이터 마이그레이션
      await migrateLocalData();

      console.log('✅ Google 로그인 성공:', user.displayName || user.email);

      Alert.alert('성공!', 'Google 로그인이 완료되었습니다!', [
        {
          text: '확인',
          onPress: () => navigation.replace('MainTabs'),
        },
      ]);
    } catch (error: any) {
      console.error('❌ Google 로그인 실패:', error);
      Alert.alert('Google 로그인 실패', error.toString());
    } finally {
      setLoading(false);
    }
  };

  // 익명 로그인
  const handleAnonymousLogin = async () => {
    setLoading(true);
    try {
      console.log('👤 익명 로그인 시도...');
      const user = await authService.signInAnonymously();

      // 사용자 프로필 저장
      await firestoreService.saveUserProfile(user);

      // 로컬 데이터 마이그레이션
      await migrateLocalData();

      console.log('✅ 익명 로그인 성공');

      Alert.alert(
        '성공!',
        '익명 로그인이 완료되었습니다!\n나중에 계정을 생성하여 데이터를 보존할 수 있습니다.',
        [
          {
            text: '확인',
            onPress: () => navigation.replace('MainTabs'),
          },
        ],
      );
    } catch (error: any) {
      console.error('❌ 익명 로그인 실패:', error);
      Alert.alert('익명 로그인 실패', error.toString());
    } finally {
      setLoading(false);
    }
  };

  // 비밀번호 재설정
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('이메일 입력', '비밀번호를 재설정할 이메일을 입력해주세요.');
      return;
    }

    try {
      await authService.sendPasswordResetEmail(email);
      Alert.alert(
        '이메일 전송 완료',
        '비밀번호 재설정 이메일이 전송되었습니다. 이메일을 확인해주세요.',
      );
    } catch (error: any) {
      Alert.alert('이메일 전송 실패', error.toString());
    }
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: currentTheme.colors.background },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ height: safeAreaInsets.top }} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text
            style={[styles.appTitle, { color: currentTheme.colors.primary }]}
          >
            🌟 위시어리
          </Text>
          <Text
            style={[
              styles.appSubtitle,
              { color: currentTheme.colors.textSecondary },
            ]}
          >
            미래를 기록하고 꿈을 현실로
          </Text>
        </View>

        {/* 로그인/회원가입 탭 */}
        <View
          style={[
            styles.tabContainer,
            { backgroundColor: currentTheme.colors.surface },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.tab,
              isLogin && { backgroundColor: currentTheme.colors.primary },
            ]}
            onPress={() => setIsLogin(true)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: isLogin
                    ? currentTheme.colors.background
                    : currentTheme.colors.textSecondary,
                },
              ]}
            >
              로그인
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              !isLogin && { backgroundColor: currentTheme.colors.primary },
            ]}
            onPress={() => setIsLogin(false)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: !isLogin
                    ? currentTheme.colors.background
                    : currentTheme.colors.textSecondary,
                },
              ]}
            >
              회원가입
            </Text>
          </TouchableOpacity>
        </View>

        {/* 폼 */}
        <View
          style={[
            styles.formContainer,
            { backgroundColor: currentTheme.colors.surface },
          ]}
        >
          {/* 이메일 입력 */}
          <View style={styles.inputContainer}>
            <Text
              style={[styles.inputLabel, { color: currentTheme.colors.text }]}
            >
              이메일
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { borderColor: currentTheme.colors.border },
              ]}
            >
              <Icon
                name="mail"
                size={20}
                color={currentTheme.colors.textSecondary}
              />
              <TextInput
                style={[styles.textInput, { color: currentTheme.colors.text }]}
                value={email}
                onChangeText={setEmail}
                placeholder="이메일을 입력하세요"
                placeholderTextColor={currentTheme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* 회원가입 시 사용자 이름 */}
          {!isLogin && (
            <View style={styles.inputContainer}>
              <Text
                style={[styles.inputLabel, { color: currentTheme.colors.text }]}
              >
                사용자 이름
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  { borderColor: currentTheme.colors.border },
                ]}
              >
                <Icon
                  name="user"
                  size={20}
                  color={currentTheme.colors.textSecondary}
                />
                <TextInput
                  style={[
                    styles.textInput,
                    { color: currentTheme.colors.text },
                  ]}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="사용자 이름을 입력하세요"
                  placeholderTextColor={currentTheme.colors.textSecondary}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            </View>
          )}

          {/* 비밀번호 입력 */}
          <View style={styles.inputContainer}>
            <Text
              style={[styles.inputLabel, { color: currentTheme.colors.text }]}
            >
              비밀번호
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { borderColor: currentTheme.colors.border },
              ]}
            >
              <Icon
                name="lock"
                size={20}
                color={currentTheme.colors.textSecondary}
              />
              <TextInput
                style={[styles.textInput, { color: currentTheme.colors.text }]}
                value={password}
                onChangeText={setPassword}
                placeholder="비밀번호를 입력하세요"
                placeholderTextColor={currentTheme.colors.textSecondary}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={currentTheme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* 회원가입 시 비밀번호 확인 */}
          {!isLogin && (
            <View style={styles.inputContainer}>
              <Text
                style={[styles.inputLabel, { color: currentTheme.colors.text }]}
              >
                비밀번호 확인
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  { borderColor: currentTheme.colors.border },
                ]}
              >
                <Icon
                  name="lock"
                  size={20}
                  color={currentTheme.colors.textSecondary}
                />
                <TextInput
                  style={[
                    styles.textInput,
                    { color: currentTheme.colors.text },
                  ]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="비밀번호를 다시 입력하세요"
                  placeholderTextColor={currentTheme.colors.textSecondary}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Icon
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={currentTheme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 비밀번호 찾기 (로그인 모드에서만) */}
          {isLogin && (
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
            >
              <Text
                style={[
                  styles.forgotPasswordText,
                  { color: currentTheme.colors.primary },
                ]}
              >
                비밀번호를 잊으셨나요?
              </Text>
            </TouchableOpacity>
          )}

          {/* 이메일 로그인/회원가입 버튼 */}
          <TouchableOpacity
            style={[
              styles.emailButton,
              { backgroundColor: currentTheme.colors.primary },
              loading && styles.disabledButton,
            ]}
            onPress={handleEmailAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color={currentTheme.colors.background}
              />
            ) : (
              <Text
                style={[
                  styles.emailButtonText,
                  { color: currentTheme.colors.background },
                ]}
              >
                {isLogin ? '로그인' : '회원가입'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 소셜 로그인 */}
        <View style={styles.socialContainer}>
          <View style={styles.dividerContainer}>
            <View
              style={[
                styles.divider,
                { backgroundColor: currentTheme.colors.border },
              ]}
            />
            <Text
              style={[
                styles.dividerText,
                { color: currentTheme.colors.textSecondary },
              ]}
            >
              또는
            </Text>
            <View
              style={[
                styles.divider,
                { backgroundColor: currentTheme.colors.border },
              ]}
            />
          </View>

          {/* 구글 로그인 */}
          <TouchableOpacity
            style={[
              styles.socialButton,
              styles.googleButton,
              { borderColor: currentTheme.colors.border },
            ]}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Text style={styles.googleIcon}>🔍</Text>
            <Text
              style={[
                styles.socialButtonText,
                { color: currentTheme.colors.text },
              ]}
            >
              Google로 계속하기
            </Text>
          </TouchableOpacity>

          {/* 익명 로그인 */}
          <TouchableOpacity
            style={[
              styles.socialButton,
              styles.anonymousButton,
              { borderColor: currentTheme.colors.border },
            ]}
            onPress={handleAnonymousLogin}
            disabled={loading}
          >
            <Text style={styles.anonymousIcon}>👤</Text>
            <Text
              style={[
                styles.socialButtonText,
                { color: currentTheme.colors.text },
              ]}
            >
              익명으로 시작하기
            </Text>
          </TouchableOpacity>
        </View>

        {/* 안내 메시지 */}
        <View style={styles.infoContainer}>
          <Text
            style={[
              styles.infoText,
              { color: currentTheme.colors.textSecondary },
            ]}
          >
            💡 익명 로그인 시에도 나중에 계정을 생성하여{'\n'}
            데이터를 안전하게 보존할 수 있습니다.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emailButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  socialContainer: {
    marginBottom: 24,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
    marginHorizontal: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  googleButton: {
    backgroundColor: '#fff',
  },
  anonymousButton: {
    backgroundColor: 'transparent',
  },
  googleIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  anonymousIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LoginScreen;
