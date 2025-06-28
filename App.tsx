/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import {RootStackParamList, TabParamList} from './src/types';
import {ThemeProvider, useTheme} from './src/contexts/ThemeContext';
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

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const MainTabs = () => {
  const {currentTheme} = useTheme();

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
      }}>
      <Tab.Screen
        name="Timeline"
        component={TimelineScreen}
        options={{
          tabBarLabel: '타임라인',
          tabBarIcon: ({color, size}) => (
            <Icon name="activity" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '일기쓰기',
          tabBarIcon: ({color, size}) => (
            <Icon name="edit-3" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={MyDiaryScreen}
        options={{
          tabBarLabel: '나의 일기장',
          tabBarIcon: ({color, size}) => (
            <Icon name="book-open" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: '일기 찾기',
          tabBarIcon: ({color, size}) => (
            <Icon name="search" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: '설정',
          tabBarIcon: ({color, size}) => (
            <Icon name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppContent: React.FC = () => {
  const {currentTheme} = useTheme();

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
          }}>
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="WriteEntry"
            component={WriteEntryScreen}
            options={{
              presentation: 'modal',
              headerTitle: '새 일기',
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
            name="Login"
            component={LoginScreen}
            options={{
              presentation: 'modal',
              headerTitle: '로그인',
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
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
