import React, { useState, useRef } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { supabase } from '../services/SupabaseConfig';

interface GoogleLoginWebViewProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  onError: (error: string) => void;
}

const GoogleLoginWebView: React.FC<GoogleLoginWebViewProps> = ({
  visible,
  onClose,
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(false);
  const [oauthUrl, setOauthUrl] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  const startGoogleLogin = async () => {
    try {
      setLoading(true);
      console.log('🔍 Google OAuth URL 생성 중...');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'com.futurediary://auth',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('❌ OAuth URL 생성 실패:', error);
        onError('Google 로그인 설정을 확인해주세요.');
        return;
      }

      if (!data.url) {
        onError('OAuth URL을 생성할 수 없습니다.');
        return;
      }

      console.log('✅ OAuth URL 생성 성공:', data.url);
      setOauthUrl(data.url);
    } catch (error: any) {
      console.error('❌ Google 로그인 시작 실패:', error);
      onError(error.message || 'Google 로그인을 시작할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    console.log('🌐 웹뷰 URL 변경:', url);

    // OAuth 완료 후 리다이렉트 URL 확인
    if (url.includes('com.futurediary://auth')) {
      console.log('✅ OAuth 완료 감지');
      onClose();
      // 세션 확인
      checkSession();
    }
  };

  const checkSession = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('❌ 세션 확인 실패:', error);
        onError('로그인 세션을 확인할 수 없습니다.');
        return;
      }

      if (session?.user) {
        console.log('✅ Google 로그인 성공:', session.user.email);
        onSuccess(session.user);
      } else {
        console.log('❌ 세션이 없습니다.');
        onError('로그인이 완료되지 않았습니다.');
      }
    } catch (error: any) {
      console.error('❌ 세션 확인 중 오류:', error);
      onError('로그인 상태를 확인할 수 없습니다.');
    }
  };

  const handleClose = () => {
    setOauthUrl(null);
    onClose();
  };

  React.useEffect(() => {
    if (visible && !oauthUrl) {
      startGoogleLogin();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Google 로그인</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Google 로그인 준비 중...</Text>
          </View>
        ) : oauthUrl ? (
          <WebView
            ref={webViewRef}
            source={{ uri: oauthUrl }}
            style={styles.webview}
            onNavigationStateChange={handleNavigationStateChange}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>
                  Google 로그인 페이지 로딩 중...
                </Text>
              </View>
            )}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Google 로그인을 시작할 수 없습니다.
            </Text>
            <TouchableOpacity
              onPress={startGoogleLogin}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#007AFF',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginRight: 36, // closeButton 너비만큼 오프셋
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoogleLoginWebView;
