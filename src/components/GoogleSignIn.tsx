import React, { useState, useCallback } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { supabase } from '../services/SupabaseConfig';

interface GoogleSignInProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  onError: (error: string) => void;
}

const GoogleSignIn: React.FC<GoogleSignInProps> = ({
  visible,
  onClose,
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(false);

  const signIn = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 Google Sign-In 시작...');

      // Google Sign-In 설정
      GoogleSignin.configure({
        webClientId:
          '179993011809-ek5ukf33irn0galn755mrhcka8n67jr4.apps.googleusercontent.com', // Android client ID (type 1)
        iosClientId:
          '179993011809-ek5ukf33irn0galn755mrhcka8n67jr4.apps.googleusercontent.com', // Android client ID for iOS
        offlineAccess: true,
        hostedDomain: '',
        forceCodeForRefreshToken: true,
        scopes: ['profile', 'email'],
      });

      // Google Sign-In 실행
      const userInfo = (await GoogleSignin.signIn()) as any;

      console.log('✅ Google Sign-In 성공:', userInfo);
      console.log('🔍 userInfo 구조:', JSON.stringify(userInfo, null, 2));

      // ID 토큰 확인
      if (!userInfo.idToken) {
        console.error('❌ ID 토큰이 없습니다.');
        console.log('🔍 userInfo 키들:', Object.keys(userInfo));

        // ID 토큰을 명시적으로 요청
        try {
          const tokens = await GoogleSignin.getTokens();
          console.log('🔍 명시적 토큰 요청 결과:', tokens);

          if (tokens.idToken) {
            console.log('✅ 명시적 ID 토큰 획득 성공');
            userInfo.idToken = tokens.idToken;
          } else {
            onError('Google ID 토큰을 받을 수 없습니다.');
            return;
          }
        } catch (tokenError) {
          console.error('❌ 명시적 토큰 요청 실패:', tokenError);
          onError('Google ID 토큰을 받을 수 없습니다.');
          return;
        }
      }

      // ID 토큰을 Supabase에 전송
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: userInfo.idToken,
      });

      if (error) {
        console.error('❌ Supabase ID 토큰 로그인 실패:', error);
        onError('Supabase 로그인에 실패했습니다.');
        return;
      }

      if (data.user) {
        console.log('✅ Supabase 로그인 성공:', data.user.email);
        onSuccess(data.user);
      } else {
        console.log('❌ Supabase 사용자 정보가 없습니다.');
        onError('로그인 완료 후 사용자 정보를 받을 수 없습니다.');
      }
    } catch (error: any) {
      console.error('❌ Google Sign-In 실패:', error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        onError('Google 로그인이 취소되었습니다.');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        onError('Google 로그인이 이미 진행 중입니다.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        onError('Google Play Services를 사용할 수 없습니다.');
      } else {
        onError(error.message || 'Google 로그인에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, [onError, onSuccess]);

  const handleClose = () => {
    onClose();
  };

  React.useEffect(() => {
    if (visible) {
      signIn();
    }
  }, [visible, signIn]);

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
              <Text style={styles.loadingText}>Google 로그인 중...</Text>
            </>
          ) : (
            <>
              <Text style={styles.title}>Google 로그인</Text>
              <Text style={styles.message}>Google 계정으로 로그인합니다.</Text>
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

export default GoogleSignIn;
