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
import supabaseService from '../services/SupabaseService';
import supabaseAuthService from '../services/SupabaseAuthService';
import { loadDiaryEntries, clearLocalStorage } from '../utils/storage';

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

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // AuthContext가 이미 로그인 상태를 관리하므로
    // 여기서는 별도의 상태 체크가 필요하지 않음
    console.log('🔐 LoginScreen 마운트됨');
  }, []);

  // 로컬 데이터를 Supabase로 마이그레이션
  const migrateLocalData = async () => {
    try {
      console.log('🔄 로컬 데이터 Supabase 마이그레이션 시작...');
      const localEntries = await loadDiaryEntries();

      if (localEntries.length > 0) {
        await supabaseService.migrateLocalDataToSupabase(localEntries);
        console.log('✅ 로컬 데이터 Supabase 마이그레이션 완료');
      }
    } catch (error) {
      console.error('❌ 로컬 데이터 Supabase 마이그레이션 실패:', error);
      // 마이그레이션 실패해도 로그인은 계속 진행
    }
  };

  // 닉네임 로그인/회원가입 모달 열기

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
    }

    setLoading(true);
    try {
      if (isLogin) {
        console.log('📧 Supabase 이메일 로그인 시도...');
        const user = await supabaseAuthService.signInWithEmail(email, password);

        if (user) {
          console.log('✅ 로그인 성공 - 사용자 정보:', {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            isAnonymous: user.isAnonymous,
          });

          // 사용자 프로필 저장
          await supabaseService.saveUserProfile(user);

          // 로그인 성공 후 로컬 데이터 마이그레이션
          await migrateLocalData();
        }
      } else {
        console.log('📧 Supabase 이메일 회원가입 시도...');
        const user = await supabaseAuthService.signUpWithEmail(email, password);

        if (user) {
          console.log('✅ 회원가입 성공 - 사용자 정보:', {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            isAnonymous: user.isAnonymous,
          });
        }

        if (user) {
          // 사용자 프로필 저장
          await supabaseService.saveUserProfile(user);

          Alert.alert(
            '회원가입 완료',
            '회원가입이 완료되었습니다. 이메일을 확인해주세요.',
            [{ text: '확인' }],
          );
        }
      }

      console.log('✅ Supabase 인증 성공!');
    } catch (error: any) {
      console.error('❌ Supabase 인증 실패:', error);
      Alert.alert('오류', error.message || '로그인/회원가입에 실패했습니다.');
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
      await supabaseAuthService.sendPasswordResetEmail(email);
      Alert.alert(
        '이메일 전송 완료',
        '비밀번호 재설정 이메일이 전송되었습니다. 이메일을 확인해주세요.',
      );
    } catch (error: any) {
      Alert.alert('이메일 전송 실패', error.toString());
    }
  };

  // 테스트 로그인 함수
  const handleTestLogin = async () => {
    setLoading(true);
    try {
      console.log('🧪 테스트 로그인 시도...');

      // 테스트 계정으로 로그인
      const testEmail = 'test@example.com';
      const testPassword = 'test123456';

      try {
        // 먼저 로그인 시도
        const user = await supabaseAuthService.signInWithEmail(
          testEmail,
          testPassword,
        );

        if (user) {
          console.log('✅ 테스트 로그인 성공:', user.email);

          // 테스트 계정 데이터 초기화
          await initializeTestAccountData(user);

          // 사용자 프로필 저장
          await supabaseService.saveUserProfile(user);

          // 로컬 데이터 마이그레이션
          await migrateLocalData();

          Alert.alert(
            '✅ 테스트 로그인 성공',
            '테스트 계정으로 로그인되었습니다.\n모든 데이터가 초기화되었습니다.',
            [{ text: '확인' }],
          );
        }
      } catch (loginError: any) {
        console.log('⚠️ 테스트 계정 로그인 실패, 회원가입 시도...');

        // 로그인 실패 시 회원가입 시도
        try {
          const user = await supabaseAuthService.signUpWithEmail(
            testEmail,
            testPassword,
            '테스트 사용자',
          );

          if (user) {
            console.log('✅ 테스트 계정 생성 성공');

            // 회원가입 후 바로 로그인 시도
            const loginUser = await supabaseAuthService.signInWithEmail(
              testEmail,
              testPassword,
            );

            if (loginUser) {
              // 테스트 계정 데이터 초기화
              await initializeTestAccountData(loginUser);

              // 사용자 프로필 저장
              await supabaseService.saveUserProfile(loginUser);

              // 로컬 데이터 마이그레이션
              await migrateLocalData();

              Alert.alert(
                '✅ 테스트 계정 생성 완료',
                '테스트 계정이 생성되고 로그인되었습니다.\n모든 데이터가 초기화되었습니다.',
                [{ text: '확인' }],
              );
            }
          }
        } catch (signUpError: any) {
          console.error('❌ 테스트 계정 생성 실패:', signUpError);

          // 이메일 확인이 필요한 경우
          if (signUpError.message?.includes('이메일')) {
            Alert.alert(
              '⚠️ 이메일 확인 필요',
              '일반 계정으로 회원가입하시거나 Google 로그인을 사용해주세요.',
              [{ text: '확인' }],
            );
          } else {
            Alert.alert(
              '❌ 테스트 로그인 실패',
              '테스트 계정 접속에 문제가 발생했습니다.\n일반 계정으로 회원가입하시거나 Google 로그인을 사용해주세요.',
              [{ text: '확인' }],
            );
          }
        }
      }
    } catch (error: any) {
      console.error('❌ 테스트 로그인 오류:', error);
      Alert.alert(
        '오류',
        '테스트 로그인 중 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.',
        [{ text: '확인' }],
      );
    } finally {
      setLoading(false);
    }
  };

  // 테스트 계정 데이터 초기화 함수
  const initializeTestAccountData = async (user: any) => {
    try {
      console.log('🧪 테스트 계정 데이터 초기화 시작...');

      // 테스트 계정인지 확인 (test@example.com)
      if (user.email === 'test@example.com') {
        console.log('🗑️ 테스트 계정 로컬 스토리지 초기화 중...');
        try {
          await clearLocalStorage();
          console.log('✅ 테스트 계정 로컬 스토리지 초기화 완료');
        } catch (localError) {
          console.error('❌ 로컬 스토리지 초기화 실패:', localError);
        }
      } else {
        console.log('ℹ️ 일반 계정이므로 초기화를 건너뜁니다.');
      }

      console.log('✅ 테스트 계정 데이터 초기화 완료');
    } catch (error) {
      console.error('❌ 테스트 계정 데이터 초기화 실패:', error);
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

          {/* 테스트 로그인 */}
          <TouchableOpacity
            style={[
              styles.socialButton,
              styles.testButton,
              { borderColor: '#E6E6FA' }, // 천사의 일기 테마 라벤더 테두리 색상 고정
            ]}
            onPress={handleTestLogin}
            disabled={loading}
          >
            <Icon
              name="user-check"
              size={20}
              color="#FFFFFF"
              style={styles.socialIcon}
            />
            <Text style={[styles.socialButtonText, { color: '#FFFFFF' }]}>
              🧪 테스트 로그인
            </Text>
          </TouchableOpacity>
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
  testButton: {
    backgroundColor: '#FF6B35', // 주황색 테스트 버튼
  },
  anonymousButton: {
    backgroundColor: 'transparent', // 투명 배경
  },

  socialIcon: {
    marginRight: 12,
  },

  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    gap: 16,
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LoginScreen;
