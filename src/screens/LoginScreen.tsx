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
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../contexts/ThemeContext';
import authService from '../services/AuthService';
import firestoreService from '../services/FirestoreService';
import { loadDiaryEntries } from '../utils/storage';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({
  navigation: _navigation,
}) => {
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
    // AuthContext가 이미 로그인 상태를 관리하므로
    // 여기서는 별도의 상태 체크가 필요하지 않음
    console.log('🔐 LoginScreen 마운트됨');
  }, []);

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
            // AuthContext가 자동으로 MainTabs로 전환함
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
          // AuthContext가 자동으로 MainTabs로 전환함
        },
      ]);
    } catch (error: any) {
      console.error('❌ Google 로그인 실패:', error);
      Alert.alert('Google 로그인 실패', error.toString());
    } finally {
      setLoading(false);
    }
  };

  // 애플 로그인 (Apple Sign-In)
  const handleAppleLogin = async () => {
    Alert.alert(
      '🍎 Apple로 로그인',
      'Apple Sign-In 기능은 현재 개발 중입니다.\n곧 업데이트 예정입니다!',
      [{ text: '확인' }],
    );
    // TODO: Apple Sign-In 구현
    // setLoading(true);
    // try {
    //   console.log('🍎 Apple 로그인 시도...');
    //   const user = await authService.signInWithApple();
    //   await firestoreService.saveUserProfile(user);
    //   await migrateLocalData();
    //   console.log('✅ Apple 로그인 성공:', user.displayName || user.email);
    //   Alert.alert('성공!', 'Apple 로그인이 완료되었습니다!', [{ text: '확인' }]);
    // } catch (error: any) {
    //   console.error('❌ Apple 로그인 실패:', error);
    //   Alert.alert('Apple 로그인 실패', error.toString());
    // } finally {
    //   setLoading(false);
    // }
  };

  // 페이스북 로그인 (Facebook Login)
  const handleFacebookLogin = async () => {
    Alert.alert(
      '📘 Facebook으로 로그인',
      'Facebook 로그인 기능은 현재 개발 중입니다.\n곧 업데이트 예정입니다!',
      [{ text: '확인' }],
    );
    // TODO: Facebook Login 구현
    // setLoading(true);
    // try {
    //   console.log('📘 Facebook 로그인 시도...');
    //   const user = await authService.signInWithFacebook();
    //   await firestoreService.saveUserProfile(user);
    //   await migrateLocalData();
    //   console.log('✅ Facebook 로그인 성공:', user.displayName || user.email);
    //   Alert.alert('성공!', 'Facebook 로그인이 완료되었습니다!', [{ text: '확인' }]);
    // } catch (error: any) {
    //   console.error('❌ Facebook 로그인 실패:', error);
    //   Alert.alert('Facebook 로그인 실패', error.toString());
    // } finally {
    //   setLoading(false);
    // }
  };

  // 익명 로그인
  const handleAnonymousLogin = async () => {
    setLoading(true);
    try {
      console.log('👤 익명 로그인 시도...');
      await authService.signInAnonymously();

      // 익명 사용자는 Firestore에 프로필을 저장하지 않음 (로컬에서만 관리)
      console.log('🎨 익명 사용자 - 로컬에서만 관리');

      // 로컬 데이터는 유지 (마이그레이션 불필요)
      console.log('💾 익명 사용자 - 로컬 데이터 유지');

      console.log('✅ 익명 로그인 성공');

      Alert.alert(
        '🎉 익명 로그인 성공!',
        '익명으로 미래일기를 시작합니다!\n\n💡 팁:\n• 기본 테마 사용 가능\n• 이메일 가입 시 프리미엄 테마 구매 가능\n• 데이터는 로컬에만 저장됩니다',
        [
          {
            text: '시작하기',
            // AuthContext가 자동으로 MainTabs로 전환함
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
        { backgroundColor: '#FFFEF7' }, // 천사의 일기 테마 아이보리 배경색 고정
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
            { backgroundColor: '#FEFEFE' }, // 천사의 일기 테마 순백 색상 고정
          ]}
        >
          <TouchableOpacity
            style={[
              styles.tab,
              isLogin && { backgroundColor: '#FFD700' }, // 천사의 일기 테마 골드 색상 고정
            ]}
            onPress={() => setIsLogin(true)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: isLogin
                    ? '#FFFFFF'
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
              !isLogin && { backgroundColor: '#FFD700' }, // 천사의 일기 테마 골드 색상 고정
            ]}
            onPress={() => setIsLogin(false)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: !isLogin
                    ? '#FFFFFF'
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
            { backgroundColor: '#FEFEFE' }, // 천사의 일기 테마 순백 색상 고정
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
                  { color: '#FFD700' }, // 천사의 일기 테마 골드 색상 고정
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
              { backgroundColor: '#FFD700' }, // 천사의 일기 테마 골드 색상 고정
              loading && styles.disabledButton,
            ]}
            onPress={handleEmailAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={[styles.emailButtonText, { color: '#FFFFFF' }]}>
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
                { backgroundColor: '#E6E6FA' }, // 천사의 일기 테마 라벤더 테두리 색상 고정
              ]}
            />
            <Text
              style={[
                styles.dividerText,
                { color: '#8B7355' }, // 천사의 일기 테마 브론즈 색상 고정
              ]}
            >
              또는
            </Text>
            <View
              style={[
                styles.divider,
                { backgroundColor: '#E6E6FA' }, // 천사의 일기 테마 라벤더 테두리 색상 고정
              ]}
            />
          </View>

          {/* 구글 로그인 */}
          <TouchableOpacity
            style={[
              styles.socialButton,
              styles.googleButton,
              { borderColor: '#E6E6FA' }, // 천사의 일기 테마 라벤더 테두리 색상 고정
            ]}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <FontAwesome
              name="google"
              size={20}
              color="#4285F4"
              style={styles.socialIcon}
            />
            <Text
              style={[
                styles.socialButtonText,
                { color: currentTheme.colors.text },
              ]}
            >
              Google로 계속하기
            </Text>
          </TouchableOpacity>

          {/* 애플 로그인 */}
          <TouchableOpacity
            style={[
              styles.socialButton,
              styles.appleButton,
              { borderColor: '#E6E6FA' }, // 천사의 일기 테마 라벤더 테두리 색상 고정
            ]}
            onPress={handleAppleLogin}
            disabled={loading}
          >
            <FontAwesome
              name="apple"
              size={20}
              color="#FFFFFF"
              style={styles.socialIcon}
            />
            <Text style={[styles.socialButtonText, { color: '#FFFFFF' }]}>
              Apple로 계속하기
            </Text>
          </TouchableOpacity>

          {/* 페이스북 로그인 */}
          <TouchableOpacity
            style={[
              styles.socialButton,
              styles.facebookButton,
              { borderColor: '#E6E6FA' }, // 천사의 일기 테마 라벤더 테두리 색상 고정
            ]}
            onPress={handleFacebookLogin}
            disabled={loading}
          >
            <FontAwesome
              name="facebook"
              size={20}
              color="#FFFFFF"
              style={styles.socialIcon}
            />
            <Text style={[styles.socialButtonText, { color: '#FFFFFF' }]}>
              Facebook으로 계속하기
            </Text>
          </TouchableOpacity>

          {/* 익명 로그인 */}
          <TouchableOpacity
            style={[
              styles.socialButton,
              styles.anonymousButton,
              { borderColor: '#E6E6FA' }, // 천사의 일기 테마 라벤더 테두리 색상 고정
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
  appleButton: {
    backgroundColor: '#000',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  anonymousButton: {
    backgroundColor: 'transparent',
  },
  socialIcon: {
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
