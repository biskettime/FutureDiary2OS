import React, { useState, useCallback } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import { supabase } from '../services/SupabaseConfig';
import supabaseAuthService from '../services/SupabaseAuthService';

interface GoogleLoginInAppBrowserProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  onError: (error: string) => void;
}

const GoogleLoginInAppBrowser: React.FC<GoogleLoginInAppBrowserProps> = ({
  visible,
  onClose,
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(false);

  const startGoogleLogin = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 Google OAuth URL 생성 중...');

      // SupabaseAuthService를 통해 OAuth URL 생성
      const user = await supabaseAuthService.signInWithGoogle();

      if (!user || !(user as any).oauthUrl) {
        onError('OAuth URL을 생성할 수 없습니다.');
        return;
      }

      const oauthUrl = (user as any).oauthUrl;
      console.log('✅ OAuth URL 생성 성공:', oauthUrl);

      // In-App Browser로 URL 열기
      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.openAuth(
          oauthUrl,
          'com.futurediary://auth',
          {
            // iOS 설정
            preferredBarTintColor: '#FFFFFF',
            preferredControlTintColor: '#007AFF',
            readerMode: false,
            animated: true,
            modalPresentationStyle: 'fullScreen',
            // Android 설정
            showTitle: true,
            enableUrlBarHiding: true,
            enableDefaultShare: false,
            forceCloseOnRedirection: false,
          },
        );

        console.log('🔍 In-App Browser 결과:', result);

        if (result.type === 'success' && result.url) {
          console.log('🔍 OAuth 결과 URL:', result.url);

          try {
            // URL에서 액세스 토큰 추출
            const url = new URL(result.url);
            const accessToken = url.searchParams.get('access_token');
            const refreshToken = url.searchParams.get('refresh_token');
            const error = url.searchParams.get('error');
            const errorDescription = url.searchParams.get('error_description');

            console.log('🔍 URL 파라미터:', {
              accessToken: accessToken ? '있음' : '없음',
              refreshToken: refreshToken ? '있음' : '없음',
              error,
              errorDescription,
            });

            if (error) {
              console.error('❌ OAuth 에러:', error, errorDescription);
              onError(`OAuth 에러: ${errorDescription || error}`);
              return;
            }

            if (accessToken) {
              console.log('✅ 액세스 토큰 발견, 세션 설정 중...');

              // 세션 설정
              const {
                data: { session },
                error: sessionError,
              } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || '',
              });

              if (sessionError) {
                console.error('❌ 세션 설정 실패:', sessionError);
                onError('로그인 세션을 설정할 수 없습니다.');
                return;
              }

              if (session?.user) {
                console.log('✅ Google 로그인 성공:', session.user.email);
                onSuccess(session.user);
              } else {
                console.log('❌ 세션이 없습니다.');
                onError('로그인이 완료되지 않았습니다.');
              }
            } else {
              console.log('❌ 액세스 토큰을 찾을 수 없습니다.');
              console.log('🔍 전체 URL:', result.url);
              onError('로그인 토큰을 받을 수 없습니다. URL을 확인해주세요.');
            }
          } catch (urlError) {
            console.error('❌ URL 파싱 오류:', urlError);
            console.log('🔍 원본 URL:', result.url);
            onError('OAuth 응답을 처리할 수 없습니다.');
          }
        } else {
          console.log('❌ In-App Browser 취소됨');
          onError('Google 로그인이 취소되었습니다.');
        }
      } else {
        console.log('❌ In-App Browser를 사용할 수 없습니다.');
        onError('In-App Browser를 사용할 수 없습니다.');
      }
    } catch (error: any) {
      console.error('❌ Google 로그인 시작 실패:', error);
      onError(error.message || 'Google 로그인을 시작할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [onError, onSuccess]);

  const handleClose = () => {
    onClose();
  };

  React.useEffect(() => {
    if (visible) {
      startGoogleLogin();
    }
  }, [visible, startGoogleLogin]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          {loading ? (
            <>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Google 로그인 준비 중...</Text>
            </>
          ) : (
            <>
              <Text style={styles.title}>Google 로그인</Text>
              <Text style={styles.message}>
                Google 로그인이 시작됩니다. 브라우저가 열리면 Google 계정을
                선택해주세요.
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>닫기</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    minWidth: 280,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoogleLoginInAppBrowser;
