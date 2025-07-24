import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Animated,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface ThemeBackgroundProps {
  children: React.ReactNode;
}

// ⭐ 범용 애니메이션 파티클 인터페이스
interface AnimatedParticle {
  id: number;
  translateY: Animated.Value;
  translateX: Animated.Value;
  rotate?: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  initialX: number;
  color?: string;
  emoji: string;
}

const ThemeBackground: React.FC<ThemeBackgroundProps> = ({ children }) => {
  const { currentTheme } = useTheme();

  // 🔍 테마 상태 디버깅 로그
  console.log('🎨 현재 테마:', currentTheme.id, currentTheme.name);

  // ✨ 범용 파티클 애니메이션 상태
  const [animatedParticles, setAnimatedParticles] = useState<
    AnimatedParticle[]
  >([]);

  const animationRefs = useRef<Animated.CompositeAnimation[]>([]);

  // 범용 파티클 생성 함수
  const createAnimatedParticle = (
    id: number,
    emoji: string,
    color?: string,
  ): AnimatedParticle => {
    const initialX = Math.random() * (width - 50);
    return {
      id,
      translateY: new Animated.Value(-100 - Math.random() * 200),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(0.7 + Math.random() * 0.3),
      scale: new Animated.Value(0.5 + Math.random() * 0.5),
      initialX,
      color,
      emoji,
    };
  };

  // 범용 파티클 애니메이션 시작
  const startParticleAnimation = (
    particle: AnimatedParticle,
    themeId: string,
  ) => {
    let duration = 5000 + Math.random() * 3000; // 5-8초
    let swayDistance = 50 + Math.random() * 50; // 좌우 흔들림

    // 테마별 특별 효과
    if (themeId === 'galaxy-dream') {
      duration = 3000 + Math.random() * 2000; // 별똥별은 빠르게
      swayDistance = 200 + Math.random() * 100; // 크게 휩쓸림
    }

    const animations = Animated.parallel([
      // 떨어지는 애니메이션
      Animated.timing(particle.translateY, {
        toValue: height + 100,
        duration,
        useNativeDriver: true,
      }),
      // 좌우 움직임
      Animated.sequence([
        Animated.timing(particle.translateX, {
          toValue: swayDistance,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(particle.translateX, {
          toValue: -swayDistance / 3,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ]),
      // 회전 (필요한 경우)
      ...(particle.rotate
        ? [
            Animated.timing(particle.rotate, {
              toValue: 180 + Math.random() * 180,
              duration,
              useNativeDriver: true,
            }),
          ]
        : []),
      // 투명도 변화
      Animated.sequence([
        Animated.timing(particle.opacity, {
          toValue: 1,
          duration: duration * 0.2,
          useNativeDriver: true,
        }),
        Animated.timing(particle.opacity, {
          toValue: 0.8,
          duration: duration * 0.6,
          useNativeDriver: true,
        }),
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: duration * 0.2,
          useNativeDriver: true,
        }),
      ]),
    ]);

    return animations;
  };

  // ✨ 단순하고 안정적인 파티클 애니메이션 시작
  const startParticleAnimations = useCallback(
    (
      themeId: string,
      particleConfigs: Array<{ emoji: string; color?: string }>,
    ) => {
      // 기존 애니메이션 정리
      animationRefs.current.forEach(animation => animation.stop());
      animationRefs.current = [];

      // 새로운 파티클들 생성 (각 타입당 6개로 최적화)
      const newParticles: AnimatedParticle[] = [];
      particleConfigs.forEach((config, configIndex) => {
        for (let i = 0; i < 6; i++) {
          newParticles.push(
            createAnimatedParticle(
              configIndex * 6 + i,
              config.emoji,
              config.color,
            ),
          );
        }
      });

      setAnimatedParticles(newParticles);

      // 🔄 각 파티클의 무한 애니메이션 시작
      const startParticleLoop = (particle: AnimatedParticle, index: number) => {
        const runAnimation = () => {
          // 애니메이션 시작 전 위치 초기화
          particle.translateY.setValue(-100 - Math.random() * 200);
          particle.translateX.setValue(0);
          if (particle.rotate) particle.rotate.setValue(0);
          particle.opacity.setValue(0.7 + Math.random() * 0.3);
          particle.initialX = Math.random() * (width - 50);

          const animation = startParticleAnimation(particle, themeId);

          animation.start(({ finished }) => {
            if (finished) {
              // 🔄 애니메이션 완료 후 즉시 다시 시작 (무한 루프)
              setTimeout(() => runAnimation(), 300 + Math.random() * 500);
            }
          });
        };

        // 시간차를 두고 시작
        setTimeout(() => runAnimation(), index * 200);
      };

      // 모든 파티클 애니메이션 시작
      newParticles.forEach((particle, index) => {
        startParticleLoop(particle, index);
      });
    },
    [],
  );

  useEffect(() => {
    console.log('🎨 현재 테마:', currentTheme.id);

    // 모든 애니메이션 정리
    animationRefs.current.forEach(animation => animation.stop());
    animationRefs.current = [];
    setAnimatedParticles([]);

    // 테마별 특별 효과 시작
    switch (currentTheme.id) {
      case 'angel':
        console.log('👼 천사의 일기 테마 - 천상의 효과 시작!');
        startParticleAnimations('angel', [
          { emoji: '🤍', color: '#FFFFFF' },
          { emoji: '✨', color: '#FFF8DC' },
          { emoji: '🌟', color: '#FFD700' },
          { emoji: '⭐', color: '#F0F8FF' },
        ]);
        break;

      case 'galaxy-dream':
        console.log('🌌 은하수 꿈 테마 - 별똥별 효과 시작!');
        startParticleAnimations('galaxy-dream', [
          { emoji: '⭐', color: '#FFD700' },
          { emoji: '✨', color: '#E6E6FA' },
          { emoji: '💫', color: '#B19CD9' },
          { emoji: '🌟', color: '#DDA0DD' },
        ]);
        break;

      case 'rosegold-love':
        console.log('💖 로즈골드 러브 테마 - 하트 효과 시작!');
        startParticleAnimations('rosegold-love', [
          { emoji: '💖', color: '#FF69B4' },
          { emoji: '💕', color: '#FFB6C1' },
          { emoji: '✨', color: '#F8BBD9' },
          { emoji: '💗', color: '#FF1493' },
        ]);
        break;

      case 'moonlight-serenade':
        console.log('🌙 달빛 세레나데 테마 - 달빛 입자 효과 시작!');
        startParticleAnimations('moonlight-serenade', [
          { emoji: '🌙', color: '#C0C0C0' },
          { emoji: '⭐', color: '#E6E6FA' },
          { emoji: '✨', color: '#D3D3D3' },
          { emoji: '💫', color: '#B6B6B6' },
        ]);
        break;

      default:
        console.log('기본 테마 - 특별 효과 없음');
        break;
    }

    // 클린업 (테마 변경시에만)
    return () => {
      console.log('🧹 테마 변경으로 인한 애니메이션 정리');
      animationRefs.current.forEach(animation => animation.stop());
      animationRefs.current = [];
    };
  }, [currentTheme.id, startParticleAnimations]);

  // 천사 테마 렌더링
  const renderAngelTheme = () => (
    <ImageBackground
      source={require('../images/angel_bg.jpg')}
      style={styles.container}
      imageStyle={{ opacity: 0.18, resizeMode: 'cover' }}
    >
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
          <Text style={[styles.sparkleEmoji, { top: 100, left: 50 }]}>✨</Text>
          <Text style={[styles.sparkleEmoji, { top: 150, right: 80 }]}>✨</Text>
          <Text style={[styles.sparkleEmoji, { top: 200, left: 100 }]}>✨</Text>
          <Text style={[styles.sparkleEmoji, { top: 250, right: 120 }]}>
            ✨
          </Text>
          <Text style={[styles.sparkleEmoji, { top: 300, left: 150 }]}>✨</Text>
          <Text style={[styles.sparkleEmoji, { top: 350, right: 60 }]}>✨</Text>
          <Text style={[styles.sparkleEmoji, { top: 400, left: 80 }]}>✨</Text>
          <Text style={[styles.sparkleEmoji, { top: 450, right: 100 }]}>
            ✨
          </Text>
          <Text style={[styles.sparkleEmoji, { top: 500, left: 120 }]}>✨</Text>
          <Text style={[styles.sparkleEmoji, { top: 550, right: 140 }]}>
            ✨
          </Text>
        </View>

        {/* 황금빛 효과 */}
        <View style={styles.goldenGlow}>
          <Text style={[styles.goldenEmoji, { top: 80, left: width / 2 - 20 }]}>
            🌟
          </Text>
          <Text style={[styles.goldenEmoji, { top: 200, left: 60 }]}>🌟</Text>
          <Text style={[styles.goldenEmoji, { top: 350, right: 80 }]}>🌟</Text>
        </View>
      </View>

      {/* 👼 천상의 애니메이션 파티클들! */}
      {animatedParticles.map((particle, index) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.animatedParticle,
            {
              left: particle.initialX,
              transform: [
                { translateY: particle.translateY },
                { translateX: particle.translateX },
                ...(particle.rotate
                  ? [
                      {
                        rotate: particle.rotate.interpolate({
                          inputRange: [0, 360],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ]
                  : []),
                { scale: particle.scale },
              ],
              opacity: particle.opacity,
            },
          ]}
        >
          <Text
            style={[
              styles.particleEmoji,
              {
                fontSize: 20 + (index % 3) * 6,
                color: particle.color || '#FFD700',
              },
            ]}
          >
            {particle.emoji}
          </Text>
        </Animated.View>
      ))}

      <View style={styles.content}>{children}</View>
    </ImageBackground>
  );

  // 🌟 범용 테마 렌더링 (파티클 효과 포함)
  const renderThemeWithParticles = (backgroundColor: string) => {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        {/* 🎆 범용 파티클 애니메이션들 */}
        {animatedParticles.map((particle, index) => (
          <Animated.View
            key={particle.id}
            style={[
              styles.animatedParticle,
              {
                left: particle.initialX,
                transform: [
                  { translateY: particle.translateY },
                  { translateX: particle.translateX },
                  ...(particle.rotate
                    ? [
                        {
                          rotate: particle.rotate.interpolate({
                            inputRange: [0, 180],
                            outputRange: ['0deg', '180deg'],
                          }),
                        },
                      ]
                    : []),
                  { scale: particle.scale },
                ],
                opacity: particle.opacity,
              },
            ]}
          >
            <Text
              style={[
                styles.particleEmoji,
                {
                  fontSize: 20 + (index % 3) * 6,
                  color: particle.color || '#FFFFFF',
                },
              ]}
            >
              {particle.emoji}
            </Text>
          </Animated.View>
        ))}

        <View style={styles.content}>{children}</View>
      </View>
    );
  };

  // 테마별 렌더링
  switch (currentTheme.id) {
    case 'angel':
      return renderAngelTheme();
    case 'galaxy-dream':
      return renderThemeWithParticles(currentTheme.colors.background);
    case 'rosegold-love':
      return renderThemeWithParticles(currentTheme.colors.background);
    case 'moonlight-serenade':
      return renderThemeWithParticles(currentTheme.colors.background);
    default:
      return (
        <View
          style={[
            styles.defaultContainer,
            { backgroundColor: currentTheme.colors.background },
          ]}
        >
          {children}
        </View>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  defaultContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    zIndex: 3,
  },

  // 천사 테마 스타일들
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

  // ✨ 범용 파티클 애니메이션 스타일들
  animatedParticle: {
    position: 'absolute',
    zIndex: 10,
  },
  particleEmoji: {
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

export default ThemeBackground;
