import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Ellipse, Circle, Defs, RadialGradient, Stop, Path, G } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

interface AnimatedEyeProps {
  size?: 'small' | 'large';
}

export default function AnimatedEye({ size = 'large' }: AnimatedEyeProps) {
  const pupilX = useRef(new Animated.Value(0)).current;
  const pupilY = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const glossAnim = useRef(new Animated.Value(0.3)).current;

  const dimensions = size === 'large' ? { width: 240, height: 100 } : { width: 140, height: 60 };
  const eyeWidth = size === 'large' ? 45 : 25;
  const eyeHeight = size === 'large' ? 30 : 17.5;
  const pupilRadius = size === 'large' ? 10 : 6;
  const glossRadius = size === 'large' ? 5 : 3;
  const eyeSpacing = size === 'large' ? 130 : 80;
  const leftEyeX = size === 'large' ? 70 : 45;
  const rightEyeX = leftEyeX + eyeSpacing;
  const eyeY = size === 'large' ? 50 : 30;
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
          {/* Sclera (Eye white) gradient */}
          <RadialGradient id="scleraGradient" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="70%" stopColor="#F8FAFC" stopOpacity="1" />
            <Stop offset="100%" stopColor="#E2E8F0" stopOpacity="1" />
          </RadialGradient>

          {/* Iris (Colored part) gradient - Blue/Teal */}
          <RadialGradient id="irisGradient" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#0EA5E9" stopOpacity="1" />
            <Stop offset="30%" stopColor="#0891B2" stopOpacity="1" />
            <Stop offset="60%" stopColor="#0E7490" stopOpacity="1" />
            <Stop offset="100%" stopColor="#155E75" stopOpacity="1" />
          </RadialGradient>

          {/* Pupil gradient */}
          <RadialGradient id="pupilGradient" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#000000" stopOpacity="1" />
            <Stop offset="100%" stopColor="#1F2937" stopOpacity="1" />
          </RadialGradient>

          {/* Cornea reflection gradient */}
          <RadialGradient id="corneaGradient" cx="30%" cy="30%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* LEFT EYE */}
        <G>
          {/* Sclera (white part) */}
          <Ellipse
            cx={leftEyeX}
            cy={eyeY}
            rx={eyeWidth}
            ry={eyeHeight}
            fill="url(#scleraGradient)"
          />

          {/* Eye shadow (inner) */}
          <Ellipse
            cx={leftEyeX}
            cy={eyeY - 2}
            rx={eyeWidth - 2}
            ry={eyeHeight - 2}
            fill="rgba(0, 0, 0, 0.05)"
          />

          {/* Iris group (animated) */}
          <AnimatedG translateX={pupilX} translateY={pupilY}>
            {/* Iris base */}
            <Circle
              cx={leftEyeX}
              cy={eyeY}
              r={pupilRadius * 2}
              fill="url(#irisGradient)"
            />

            {/* Iris pattern lines */}
            <Circle
              cx={leftEyeX}
              cy={eyeY}
              r={pupilRadius * 1.8}
              fill="none"
              stroke="rgba(0, 0, 0, 0.15)"
              strokeWidth="0.5"
            />
            <Circle
              cx={leftEyeX}
              cy={eyeY}
              r={pupilRadius * 1.5}
              fill="none"
              stroke="rgba(0, 0, 0, 0.1)"
              strokeWidth="0.5"
            />

            {/* Pupil */}
            <Circle
              cx={leftEyeX}
              cy={eyeY}
              r={pupilRadius}
              fill="url(#pupilGradient)"
            />

            {/* Main highlight */}
            <Circle
              cx={leftEyeX - pupilRadius * 0.5}
              cy={eyeY - pupilRadius * 0.5}
              r={pupilRadius * 0.7}
              fill="url(#corneaGradient)"
              opacity={0.9}
            />

            {/* Secondary highlight */}
            <AnimatedCircle
              cx={leftEyeX + pupilRadius * 0.8}
              cy={eyeY + pupilRadius * 0.8}
              r={pupilRadius * 0.3}
              fill="#FFFFFF"
              opacity={glossAnim}
            />
          </AnimatedG>

          {/* Limbus (dark ring around iris) */}
          <Circle
            cx={leftEyeX}
            cy={eyeY}
            r={pupilRadius * 2.1}
            fill="none"
            stroke="rgba(0, 0, 0, 0.3)"
            strokeWidth="1"
          />
        </G>

        {/* RIGHT EYE */}
        <G>
          {/* Sclera (white part) */}
          <Ellipse
            cx={rightEyeX}
            cy={eyeY}
            rx={eyeWidth}
            ry={eyeHeight}
            fill="url(#scleraGradient)"
          />

          {/* Eye shadow (inner) */}
          <Ellipse
            cx={rightEyeX}
            cy={eyeY - 2}
            rx={eyeWidth - 2}
            ry={eyeHeight - 2}
            fill="rgba(0, 0, 0, 0.05)"
          />

          {/* Iris group (animated) */}
          <AnimatedG translateX={pupilX} translateY={pupilY}>
            {/* Iris base */}
            <Circle
              cx={rightEyeX}
              cy={eyeY}
              r={pupilRadius * 2}
              fill="url(#irisGradient)"
            />

            {/* Iris pattern lines */}
            <Circle
              cx={rightEyeX}
              cy={eyeY}
              r={pupilRadius * 1.8}
              fill="none"
              stroke="rgba(0, 0, 0, 0.15)"
              strokeWidth="0.5"
            />
            <Circle
              cx={rightEyeX}
              cy={eyeY}
              r={pupilRadius * 1.5}
              fill="none"
              stroke="rgba(0, 0, 0, 0.1)"
              strokeWidth="0.5"
            />

            {/* Pupil */}
            <Circle
              cx={rightEyeX}
              cy={eyeY}
              r={pupilRadius}
              fill="url(#pupilGradient)"
            />

            {/* Main highlight */}
            <Circle
              cx={rightEyeX - pupilRadius * 0.5}
              cy={eyeY - pupilRadius * 0.5}
              r={pupilRadius * 0.7}
              fill="url(#corneaGradient)"
              opacity={0.9}
            />

            {/* Secondary highlight */}
            <AnimatedCircle
              cx={rightEyeX + pupilRadius * 0.8}
              cy={eyeY + pupilRadius * 0.8}
              r={pupilRadius * 0.3}
              fill="#FFFFFF"
              opacity={glossAnim}
            />
          </AnimatedG>

          {/* Limbus (dark ring around iris) */}
          <Circle
            cx={rightEyeX}
            cy={eyeY}
            r={pupilRadius * 2.1}
            fill="none"
            stroke="rgba(0, 0, 0, 0.3)"
            strokeWidth="1"
          />
        </G>
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
    overflow: 'visible',
    backgroundColor: 'transparent',
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
