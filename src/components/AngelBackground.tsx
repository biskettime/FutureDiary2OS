import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import angelBg from '../images/angel_bg.jpg';

const {width, height} = Dimensions.get('window');

interface AngelBackgroundProps {
  children: React.ReactNode;
}

const AngelBackground: React.FC<AngelBackgroundProps> = ({children}) => {
  const {currentTheme} = useTheme();

  // 천사 테마가 아닌 경우 일반 배경 반환
  if (currentTheme.id !== 'angel') {
    return <>{children}</>;
  }

  return (
    <ImageBackground
      source={angelBg}
      style={styles.container}
      imageStyle={{opacity: 0.18, resizeMode: 'cover'}}>
      {/* 천사 배경 요소들 */}
      <View style={styles.angelElements}>
        {/* 상단 천사 */}
        <View style={styles.topAngel}>
          <Text style={styles.angelEmoji}>👼</Text>
        </View>

        {/* 좌상단 천사 */}
        <View style={styles.leftTopAngel}>
          <Text style={styles.smallAngelEmoji}>👼</Text>
        </View>

        {/* 우상단 천사 */}
        <View style={styles.rightTopAngel}>
          <Text style={styles.smallAngelEmoji}>👼</Text>
        </View>

        {/* 중앙 상단 천사 */}
        <View style={styles.centerTopAngel}>
          <Text style={styles.mediumAngelEmoji}>👼</Text>
        </View>

        {/* 좌측 천사들 */}
        <View style={styles.leftAngels}>
          <Text style={styles.smallAngelEmoji}>👼</Text>
          <Text style={styles.smallAngelEmoji}>👼</Text>
        </View>

        {/* 우측 천사들 */}
        <View style={styles.rightAngels}>
          <Text style={styles.smallAngelEmoji}>👼</Text>
          <Text style={styles.smallAngelEmoji}>👼</Text>
        </View>

        {/* 하단 천사들 */}
        <View style={styles.bottomAngels}>
          <Text style={styles.smallAngelEmoji}>👼</Text>
          <Text style={styles.smallAngelEmoji}>👼</Text>
          <Text style={styles.smallAngelEmoji}>👼</Text>
        </View>

        {/* 반짝이는 효과 */}
        <View style={styles.sparkles}>
          <Text style={[styles.sparkleEmoji, {top: 100, left: 50}]}>✨</Text>
          <Text style={[styles.sparkleEmoji, {top: 150, right: 80}]}>✨</Text>
          <Text style={[styles.sparkleEmoji, {top: 200, left: 100}]}>✨</Text>
          <Text style={[styles.sparkleEmoji, {top: 250, right: 120}]}>✨</Text>
          <Text style={[styles.sparkleEmoji, {top: 300, left: 150}]}>✨</Text>
          <Text style={[styles.sparkleEmoji, {top: 350, right: 60}]}>✨</Text>
          <Text style={[styles.sparkleEmoji, {top: 400, left: 80}]}>✨</Text>
          <Text style={[styles.sparkleEmoji, {top: 450, right: 100}]}>✨</Text>
          <Text style={[styles.sparkleEmoji, {top: 500, left: 120}]}>✨</Text>
          <Text style={[styles.sparkleEmoji, {top: 550, right: 140}]}>✨</Text>
        </View>

        {/* 황금빛 효과 */}
        <View style={styles.goldenGlow}>
          <Text style={[styles.goldenEmoji, {top: 80, left: width / 2 - 20}]}>
            🌟
          </Text>
          <Text style={[styles.goldenEmoji, {top: 200, left: 60}]}>🌟</Text>
          <Text style={[styles.goldenEmoji, {top: 350, right: 80}]}>🌟</Text>
        </View>
      </View>

      {/* 메인 콘텐츠 */}
      <View style={styles.content}>{children}</View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  angelElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  topAngel: {
    position: 'absolute',
    top: 80,
    left: width / 2 - 30,
    zIndex: 2,
  },
  leftTopAngel: {
    position: 'absolute',
    top: 120,
    left: 40,
    zIndex: 2,
  },
  rightTopAngel: {
    position: 'absolute',
    top: 120,
    right: 40,
    zIndex: 2,
  },
  centerTopAngel: {
    position: 'absolute',
    top: 160,
    left: width / 2 - 20,
    zIndex: 2,
  },
  leftAngels: {
    position: 'absolute',
    top: height / 2 - 100,
    left: 20,
    zIndex: 2,
  },
  rightAngels: {
    position: 'absolute',
    top: height / 2 - 100,
    right: 20,
    zIndex: 2,
  },
  bottomAngels: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    zIndex: 2,
  },
  sparkles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  goldenGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  angelEmoji: {
    fontSize: 40,
    opacity: 0.3,
  },
  mediumAngelEmoji: {
    fontSize: 30,
    opacity: 0.25,
  },
  smallAngelEmoji: {
    fontSize: 24,
    opacity: 0.2,
  },
  sparkleEmoji: {
    position: 'absolute',
    fontSize: 16,
    opacity: 0.4,
  },
  goldenEmoji: {
    position: 'absolute',
    fontSize: 20,
    opacity: 0.3,
  },
  content: {
    flex: 1,
    zIndex: 3,
  },
});

export default AngelBackground;
