import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Ellipse, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface AnimatedEyeProps {
  size?: 'small' | 'large';
}

export default function AnimatedEye({ size = 'large' }: AnimatedEyeProps) {
  const pupilX = useRef(new Animated.Value(0)).current;
  const pupilY = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const glossAnim = useRef(new Animated.Value(0.3)).current;

  const dimensions = size === 'large' ? { width: 280, height: 120 } : { width: 140, height: 60 };
  const eyeWidth = size === 'large' ? 50 : 25;
  const eyeHeight = size === 'large' ? 35 : 17.5;
  const pupilRadius = size === 'large' ? 12 : 6;
  const glossRadius = size === 'large' ? 6 : 3;
  const eyeSpacing = size === 'large' ? 160 : 80;
  const leftEyeX = size === 'large' ? 90 : 45;
  const rightEyeX = leftEyeX + eyeSpacing;
  const eyeY = size === 'large' ? 60 : 30;
  const moveRange = size === 'large' ? 8 : 4;

  useEffect(() => {
    // Blink animation - every 4 seconds
    const blink = Animated.loop(
      Animated.sequence([
        Animated.delay(4000),
        Animated.timing(blinkAnim, {
          toValue: 0.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ])
    );

    // Look around animation - every 8 seconds
    const lookAround = Animated.loop(
      Animated.sequence([
        Animated.delay(2000),
        // Look left
        Animated.timing(pupilX, {
          toValue: -moveRange,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(800),
        // Look right
        Animated.timing(pupilX, {
          toValue: moveRange,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(800),
        // Look up
        Animated.parallel([
          Animated.timing(pupilX, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(pupilY, {
            toValue: -moveRange,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(800),
        // Back to center
        Animated.timing(pupilY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
      ])
    );

    // Gloss shine animation
    const gloss = Animated.loop(
      Animated.sequence([
        Animated.timing(glossAnim, {
          toValue: 0.6,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glossAnim, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    blink.start();
    lookAround.start();
    gloss.start();

    return () => {
      blink.stop();
      lookAround.stop();
      gloss.stop();
    };
  }, [blinkAnim, pupilX, pupilY, glossAnim, moveRange]);

  return (
    <View style={[styles.container, { width: dimensions.width, height: dimensions.height }]}>
      <Svg width={dimensions.width} height={dimensions.height} viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}>
        <Defs>
          <RadialGradient id="eyeGradient" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="100%" stopColor="#F0F9FF" stopOpacity="1" />
          </RadialGradient>
        </Defs>

        {/* Left Eye */}
        <Ellipse
          cx={leftEyeX}
          cy={eyeY}
          rx={eyeWidth}
          ry={eyeHeight}
          fill="url(#eyeGradient)"
          stroke="#0891B2"
          strokeWidth={size === 'large' ? 2 : 1}
        />

        {/* Left Pupil */}
        <AnimatedCircle
          cx={leftEyeX}
          cy={eyeY}
          r={pupilRadius}
          fill="#1F2937"
          translateX={pupilX}
          translateY={pupilY}
        />

        {/* Left Gloss */}
        <AnimatedCircle
          cx={leftEyeX - (size === 'large' ? 4 : 2)}
          cy={eyeY - (size === 'large' ? 4 : 2)}
          r={glossRadius}
          fill="#FFFFFF"
          opacity={glossAnim}
          translateX={pupilX}
          translateY={pupilY}
        />

        {/* Right Eye */}
        <Ellipse
          cx={rightEyeX}
          cy={eyeY}
          rx={eyeWidth}
          ry={eyeHeight}
          fill="url(#eyeGradient)"
          stroke="#0891B2"
          strokeWidth={size === 'large' ? 2 : 1}
        />

        {/* Right Pupil */}
        <AnimatedCircle
          cx={rightEyeX}
          cy={eyeY}
          r={pupilRadius}
          fill="#1F2937"
          translateX={pupilX}
          translateY={pupilY}
        />

        {/* Right Gloss */}
        <AnimatedCircle
          cx={rightEyeX - (size === 'large' ? 4 : 2)}
          cy={eyeY - (size === 'large' ? 4 : 2)}
          r={glossRadius}
          fill="#FFFFFF"
          opacity={glossAnim}
          translateX={pupilX}
          translateY={pupilY}
        />
      </Svg>

      {/* Blink overlay - top eyelid */}
      <Animated.View
        style={[
          styles.eyelid,
          {
            height: dimensions.height / 2,
            transform: [{ scaleY: blinkAnim }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F0F9FF',
  },
  eyelid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#06B6D4',
    opacity: 0,
  },
});
