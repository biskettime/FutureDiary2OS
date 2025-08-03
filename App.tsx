/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

// Supabase 초기화 및 연결 테스트
import './src/services/SupabaseConfig';
import { checkSupabaseConnection } from './src/services/SupabaseConfig';

import { RootStackParamList, TabParamList } from './src/types';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import {
  SupabaseAuthProvider,
  useSupabaseAuth,
} from './src/contexts/SupabaseAuthContext';
import TimelineScreen from './src/screens/TimelineScreen';
import HomeScreen from './src/screens/HomeScreen';
import WriteEntryScreen from './src/screens/WriteEntryScreen';
import ViewEntryScreen from './src/screens/ViewEntryScreen';
import SearchScreen from './src/screens/SearchScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import MyDiaryScreen from './src/screens/MyDiaryScreen';
import LoginScreen from './src/screens/LoginScreen';
import ThemeStoreScreen from './src/screens/ThemeStoreScreen';
import SecretStoreScreen from './src/screens/SecretStoreScreen';
import HowToUseScreen from './src/screens/HowToUseScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const MainTabs = () => {
  const { currentTheme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: currentTheme.colors.surface,
          borderTopColor: currentTheme.colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: currentTheme.colors.primary,
        tabBarInactiveTintColor: currentTheme.colors.textSecondary,
      }}
    >
      <Tab.Screen
        name="Timeline"
        component={TimelineScreen}
        options={{
          tabBarLabel: '타임라인',
          tabBarIcon: ({ color, size }) => (
            <Icon name="activity" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '일기쓰기',
          tabBarIcon: ({ color, size }) => (
            <Icon name="edit-3" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={MyDiaryScreen}
        options={{
          tabBarLabel: '나의 일기장',
          tabBarIcon: ({ color, size }) => (
            <Icon name="book-open" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: '일기 찾기',
          tabBarIcon: ({ color, size }) => (
            <Icon name="search" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: '설정',
          tabBarIcon: ({ color, size }) => (
            <Icon name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppContent: React.FC = () => {
  const themeContext = useTheme();
  const { isAuthenticated, loading } = useSupabaseAuth();

  // 테마가 로딩 중일 때는 기본값 사용
  const currentTheme = themeContext?.currentTheme || {
    colors: {
      text: '#000000',
      background: '#FFFFFF',
      surface: '#F2F2F7',
      border: '#C6C6C8',
    },
  };

  console.log('🔍 앱 상태 체크:', { isAuthenticated, loading });

  // 인증 상태 확인 중일 때는 로딩 화면을 보여줄 수 있음
  if (loading) {
    // 간단한 로딩 화면 (선택사항)
    return (
      <>
        <StatusBar
          barStyle={
            currentTheme.colors.text === '#000000'
              ? 'dark-content'
              : 'light-content'
          }
          backgroundColor={currentTheme.colors.background}
        />
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </>
    );
  }

  return (
    <>
      <StatusBar
        barStyle={
          currentTheme.colors.text === '#000000'
            ? 'dark-content'
            : 'light-content'
        }
        backgroundColor={currentTheme.colors.background}
      />
      <NavigationContainer>
        {!isAuthenticated ? (
          // 🔐 로그인되지 않은 경우: 로그인 화면만 표시
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Navigator>
        ) : (
          // ✅ 로그인된 경우: 전체 앱 네비게이션
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: currentTheme.colors.surface,
                borderBottomColor: currentTheme.colors.border,
                borderBottomWidth: 1,
              },
              headerTintColor: currentTheme.colors.text,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              headerBackTitle: '돌아가기',
            }}
          >
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="WriteEntry"
              component={WriteEntryScreen}
              options={{
                presentation: 'modal',
                headerTitle: '새 일기',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="ViewEntry"
              component={ViewEntryScreen}
              options={{
                headerTitle: '일기 보기',
              }}
            />
            <Stack.Screen
              name="ThemeStore"
              component={ThemeStoreScreen}
              options={{
                headerTitle: '테마 스토어',
              }}
            />
            <Stack.Screen
              name="SecretStore"
              component={SecretStoreScreen}
              options={{
                headerTitle: '비밀 일기 스토어',
              }}
            />
            <Stack.Screen
              name="HowToUse"
              component={HowToUseScreen}
              options={{
                headerShown: false,
              }}
            />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    // Supabase 연결 확인
    checkSupabaseConnection().then(isConnected => {
      if (isConnected) {
        console.log('✅ Supabase 연결 성공!');
      } else {
        console.error('❌ Supabase 연결 실패! 설정을 확인해주세요.');
      }
    });
  }, []);

  return (
    <ThemeProvider>
      <SupabaseAuthProvider>
        <AppContent />
      </SupabaseAuthProvider>
    </ThemeProvider>
  );
};

export default App;
