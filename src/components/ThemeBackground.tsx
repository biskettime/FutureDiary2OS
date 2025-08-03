import React from 'react';
import { View, StyleSheet, ImageBackground, Image } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeBackgroundProps {
  children: React.ReactNode;
  hideCharacter?: boolean;
}

const ThemeBackground: React.FC<ThemeBackgroundProps> = ({
  children,
  hideCharacter = false,
}) => {
  const { currentTheme } = useTheme();

  // 기본 배경 렌더링
  const renderDefaultBackground = () => (
    <View
      style={[
        styles.container,
        { backgroundColor: currentTheme.colors.background },
      ]}
    >
      {children}
    </View>
  );

  // 천사 테마 렌더링
  const renderAngelTheme = () => (
    <ImageBackground
      source={require('../images/angel_bg.jpg')}
      style={styles.container}
      imageStyle={{ opacity: 0.18, resizeMode: 'cover' }}
    >
      {/* 천사 캐릭터 */}
      {!hideCharacter && (
        <View style={styles.characterContainer}>
          <Image
            source={require('../images/angel01.png')}
            style={styles.characterImage}
            resizeMode="contain"
          />
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </ImageBackground>
  );

  // 은하수 테마 렌더링
  const renderGalaxyDreamTheme = () => (
    <ImageBackground
      source={require('../images/galaxy_dream_bg.jpg')}
      style={styles.container}
      imageStyle={{ opacity: 0.6, resizeMode: 'cover' }}
    >
      {/* 은하수 캐릭터 */}
      {!hideCharacter && (
        <View style={styles.characterContainer}>
          <Image
            source={require('../images/enhasu.png')}
            style={styles.characterImage}
            resizeMode="contain"
          />
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </ImageBackground>
  );

  // 로즈골드 러브 테마 렌더링
  const renderRosegoldLoveTheme = () => (
    <ImageBackground
      source={require('../images/rosegold_love_bg.jpg')}
      style={styles.container}
      imageStyle={{ opacity: 0.5, resizeMode: 'cover' }}
    >
      {/* 로즈골드 캐릭터 */}
      {!hideCharacter && (
        <View style={styles.characterContainer}>
          <Image
            source={require('../images/romance.png')}
            style={styles.characterImage}
            resizeMode="contain"
          />
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </ImageBackground>
  );

  // 문라이트 세레나데 테마 렌더링
  const renderMoonlightSerenadeTheme = () => (
    <ImageBackground
      source={require('../images/moonlight_serenade_bg.jpg')}
      style={styles.container}
      imageStyle={{ opacity: 0.55, resizeMode: 'cover' }}
    >
      {/* 문라이트 캐릭터 */}
      <View style={styles.characterContainer}>
        <Image
          source={require('../images/moonra.png')}
          style={styles.characterImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.content}>{children}</View>
    </ImageBackground>
  );

  // 테마별 렌더링 함수 선택
  const renderTheme = () => {
    switch (currentTheme.id) {
      case 'angel':
        return renderAngelTheme();
      case 'galaxy-dream':
        return renderGalaxyDreamTheme();
      case 'rosegold-love':
        return renderRosegoldLoveTheme();
      case 'moonlight-serenade':
        return renderMoonlightSerenadeTheme();
      default:
        return renderDefaultBackground();
    }
  };

  return renderTheme();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  characterContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 120,
    height: 120,
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
});

export default ThemeBackground;
