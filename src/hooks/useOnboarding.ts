import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import supabaseAuthService from '../services/SupabaseAuthService';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

const ONBOARDING_KEY = 'onboarding_completed';

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSupabaseAuth();

  useEffect(() => {
    console.log('🎯 useOnboarding useEffect 호출됨');
    console.log(
      '🎯 현재 사용자 상태:',
      user ? { uid: user.uid, email: user.email } : '로그아웃됨',
    );
    checkOnboardingStatus();
  }, [user]); // user 상태 변화를 감지

  const checkOnboardingStatus = async () => {
    try {
      console.log('🎯 온보딩 상태 확인 시작');
      console.log('🎯 현재 showOnboarding 상태:', showOnboarding);
      console.log('🎯 현재 isLoading 상태:', isLoading);

      // user prop을 사용하여 현재 로그인된 사용자 확인
      if (!user) {
        console.log('🎯 로그인되지 않은 사용자 - 온보딩 표시 안함');
        setShowOnboarding(false);
        setIsLoading(false);
        return;
      }

      console.log('🎯 현재 사용자:', user);

      // 테스트 계정 확인
      const isTestAccount = user.email === 'test@example.com';
      console.log('🎯 테스트 계정 여부:', isTestAccount);

      // 테스트 계정은 항상 온보딩 표시 (매번 새로운 사용자처럼)
      if (isTestAccount) {
        console.log('🎯 테스트 계정 - 온보딩 표시 설정');
        console.log('🎯 showOnboarding 상태 변경: false -> true');
        setShowOnboarding(true);
        setIsLoading(false);
        console.log('🎯 isLoading 상태 변경: true -> false');
        console.log('🎯 테스트 계정 온보딩 설정 완료');
        return;
      }

      // 일반 사용자: 사용자별 온보딩 키 생성 (사용자 ID 포함)
      const userSpecificKey = `${ONBOARDING_KEY}_${user.uid}`;
      console.log('🎯 사용자별 온보딩 키:', userSpecificKey);

      const onboardingCompleted = await AsyncStorage.getItem(userSpecificKey);
      console.log('🎯 온보딩 완료 상태:', onboardingCompleted);

      if (!onboardingCompleted) {
        console.log('🎯 온보딩 표시 설정');
        setShowOnboarding(true);
      } else {
        console.log('🎯 온보딩 이미 완료됨');
      }
    } catch (error) {
      console.error('온보딩 상태 확인 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      if (!user) {
        console.error('온보딩 완료 저장 실패: 사용자 정보 없음');
        return;
      }

      // 테스트 계정은 온보딩 완료 상태를 저장하지 않음 (매번 새로 표시)
      const isTestAccount = user.email === 'test@example.com';
      if (isTestAccount) {
        console.log('🎯 테스트 계정 - 온보딩 완료 (상태 저장 안함)');
        setShowOnboarding(false);
        return;
      }

      const userSpecificKey = `${ONBOARDING_KEY}_${user.uid}`;
      await AsyncStorage.setItem(userSpecificKey, 'true');
      console.log('🎯 온보딩 완료 저장:', userSpecificKey);
      setShowOnboarding(false);
    } catch (error) {
      console.error('온보딩 완료 저장 실패:', error);
    }
  };

  const resetOnboarding = async () => {
    try {
      if (!user) {
        console.error('온보딩 초기화 실패: 사용자 정보 없음');
        return;
      }

      const userSpecificKey = `${ONBOARDING_KEY}_${user.uid}`;
      await AsyncStorage.removeItem(userSpecificKey);
      console.log('🎯 온보딩 초기화:', userSpecificKey);
      setShowOnboarding(true);
    } catch (error) {
      console.error('온보딩 초기화 실패:', error);
    }
  };

  return {
    showOnboarding,
    isLoading,
    completeOnboarding,
    resetOnboarding,
  };
};
