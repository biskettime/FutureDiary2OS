import React, {useState} from 'react';
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
import authService, {User} from '../services/authService';

interface LoginScreenProps {
  navigation: any;
  onAuthSuccess?: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({
  navigation,
  onAuthSuccess,
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert('비밀번호 오류', '비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!isLogin && password.length < 6) {
      Alert.alert('비밀번호 오류', '비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      let user: User | null = null;

      if (isLogin) {
        user = await authService.signInWithEmail(email, password);
      } else {
        user = await authService.signUpWithEmail(email, password);
      }

      if (user) {
        Alert.alert(
          '로그인 성공',
          `환영합니다, ${user.displayName || user.email}님!`,
          [
            {
              text: '확인',
              onPress: () => {
                if (onAuthSuccess) {
                  onAuthSuccess(user);
                }
                navigation.goBack();
              },
            },
          ],
        );
      }
    } catch (error) {
      console.error('Email auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const user = await authService.signInWithGoogle();

      if (user) {
        Alert.alert(
          '로그인 성공',
          `환영합니다, ${user.displayName || user.email}님!`,
          [
            {
              text: '확인',
              onPress: () => {
                if (onAuthSuccess) {
                  onAuthSuccess(user);
                }
                navigation.goBack();
              },
            },
          ],
        );
      }
    } catch (error) {
      console.error('Google auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('이메일 입력', '비밀번호를 재설정할 이메일을 입력해주세요.');
      return;
    }

    const success = await authService.resetPassword(email);
    if (success) {
      Alert.alert(
        '비밀번호 재설정',
        '비밀번호 재설정 이메일을 발송했습니다. 이메일을 확인해주세요.',
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>{isLogin ? '로그인' : '회원가입'}</Text>
          <Text style={styles.subtitle}>미래 일기에 오신 것을 환영합니다</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Google 로그인 버튼 */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleAuth}
            disabled={loading}>
            <Text style={styles.googleButtonText}>🔍</Text>
            <Text style={styles.googleButtonLabel}>Google로 계속하기</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>또는</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* 이메일 입력 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>이메일</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="이메일을 입력하세요"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* 비밀번호 입력 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>비밀번호</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호를 입력하세요"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          {/* 비밀번호 확인 (회원가입 시에만) */}
          {!isLogin && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>비밀번호 확인</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="비밀번호를 다시 입력하세요"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>
          )}

          {/* 로그인/회원가입 버튼 */}
          <TouchableOpacity
            style={[styles.authButton, loading && styles.disabledButton]}
            onPress={handleEmailAuth}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.authButtonText}>
                {isLogin ? '로그인' : '회원가입'}
              </Text>
            )}
          </TouchableOpacity>

          {/* 비밀번호 재설정 (로그인 시에만) */}
          {isLogin && (
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
              disabled={loading}>
              <Text style={styles.forgotPasswordText}>
                비밀번호를 잊으셨나요?
              </Text>
            </TouchableOpacity>
          )}

          {/* 로그인/회원가입 전환 */}
          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>
              {isLogin ? '계정이 없으신가요? ' : '이미 계정이 있으신가요? '}
            </Text>
            <TouchableOpacity
              onPress={() => setIsLogin(!isLogin)}
              disabled={loading}>
              <Text style={styles.switchButton}>
                {isLogin ? '회원가입' : '로그인'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  googleButtonText: {
    fontSize: 20,
    marginRight: 12,
  },
  googleButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#999999',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  authButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    color: '#666666',
  },
  switchButton: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default LoginScreen;
