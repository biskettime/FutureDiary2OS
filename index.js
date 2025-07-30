/**
 * @format
 */

// React Native Polyfills (Supabase 호환성을 위해 필요)
import 'react-native-get-random-values'; // crypto polyfill
import 'react-native-url-polyfill/auto'; // URL polyfill

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
