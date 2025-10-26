import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Ellipse, Circle, Defs, RadialGradient, LinearGradient, Stop, Path, G, Line } from 'react-native-svg';

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
  // Pupil dilation: 1.0 = normal (11px), 0.7 = bright light (7.7px), 1.4 = darkness (15.4px)
  const pupilScale = useRef(new Animated.Value(1.0)).current;

  const dimensions = size === 'large' ? { width: 260, height: 110 } : { width: 140, height: 60 };
  const eyeWidth = size === 'large' ? 48 : 25;
  const eyeHeight = size === 'large' ? 32 : 17.5;
  const pupilRadius = size === 'large' ? 11 : 6;
  const irisRadius = size === 'large' ? 22 : 12;
  const glossRadius = size === 'large' ? 5 : 3;
  const eyeSpacing = size === 'large' ? 140 : 80;
  const leftEyeX = size === 'large' ? 75 : 45;
  const rightEyeX = leftEyeX + eyeSpacing;
  const eyeY = size === 'large' ? 55 : 30;
  const moveRange = size === 'large' ? 6 : 4;

  useEffect(() => {
    // Blink animation - Anatomik zamanlamalar (45ms kapanma, 15ms kapalı, 90ms açılma)
    const blink = Animated.loop(
      Animated.sequence([
        Animated.delay(4000),
        // Kapanma fazı (40-50ms)
        Animated.timing(blinkAnim, {
          toValue: 0.1,
          duration: 45,
          useNativeDriver: true,
        }),
        // Kapalı kalma (10-20ms)
        Animated.delay(15),
        // Açılma fazı (90ms)
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 90,
          useNativeDriver: true,
        }),
      ])
    );

    // Look around animation
    const lookAround = Animated.loop(
      Animated.sequence([
        Animated.delay(2000),
        Animated.timing(pupilX, {
          toValue: -moveRange,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(800),
        Animated.timing(pupilX, {
          toValue: moveRange,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(800),
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
        Animated.timing(pupilY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
      ])
    );

    // Gloss animation
    const gloss = Animated.loop(
      Animated.sequence([
        Animated.timing(glossAnim, {
          toValue: 0.7,
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

    // Pupil dilation animation (1.5-8mm range simulation)
    const dilation = Animated.loop(
      Animated.sequence([
        Animated.delay(3000),
        // Işık artınca pupil daralır (miosis)
        Animated.timing(pupilScale, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.delay(2500),
        // Karanlıkta pupil genişler (mydriasis)
        Animated.timing(pupilScale, {
          toValue: 1.4,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.delay(2500),
        // Normal duruma dön
        Animated.timing(pupilScale, {
          toValue: 1.0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    blink.start();
    lookAround.start();
    gloss.start();
    dilation.start();

    return () => {
      blink.stop();
      lookAround.stop();
      gloss.stop();
      dilation.stop();
    };
  }, [blinkAnim, pupilX, pupilY, glossAnim, pupilScale, moveRange]);

  // Function to render a single realistic eye
  const renderEye = (eyeX: number) => {
    const irisPatternLines = 16; // Number of radial lines in iris

    return (
      <G>
        {/* Sclera (white part) with gradient */}
        <Ellipse
          cx={eyeX}
          cy={eyeY}
          rx={eyeWidth}
          ry={eyeHeight}
          fill="url(#scleraGradient)"
        />

        {/* Sclera shadow/veins for realism */}
        <Ellipse
          cx={eyeX}
          cy={eyeY}
          rx={eyeWidth - 1}
          ry={eyeHeight - 1}
          fill="url(#scleraShadow)"
        />

        {/* Subtle veins */}
        {size === 'large' && (
          <>
            <Line x1={eyeX - 35} y1={eyeY - 8} x2={eyeX - 20} y2={eyeY - 5} stroke="rgba(220,53,69,0.08)" strokeWidth="0.5" />
            <Line x1={eyeX + 35} y1={eyeY + 8} x2={eyeX + 20} y2={eyeY + 5} stroke="rgba(220,53,69,0.08)" strokeWidth="0.5" />
            <Line x1={eyeX - 30} y1={eyeY + 10} x2={eyeX - 18} y2={eyeY + 8} stroke="rgba(220,53,69,0.06)" strokeWidth="0.5" />
          </>
        )}

        {/* Animated iris group */}
        <AnimatedG translateX={pupilX} translateY={pupilY}>
          {/* Iris base with gradient */}
          <Circle
            cx={eyeX}
            cy={eyeY}
            r={irisRadius}
            fill="url(#irisBase)"
          />

          {/* Iris pattern overlay */}
          <Circle
            cx={eyeX}
            cy={eyeY}
            r={irisRadius}
            fill="url(#irisPattern)"
          />

          {/* Radial pattern lines (crypts) */}
          {[...Array(irisPatternLines)].map((_, i) => {
            const angle = (i * 360) / irisPatternLines;
            const rad = (angle * Math.PI) / 180;
            const x1 = eyeX + Math.cos(rad) * pupilRadius;
            const y1 = eyeY + Math.sin(rad) * pupilRadius;
            const x2 = eyeX + Math.cos(rad) * (irisRadius - 2);
            const y2 = eyeY + Math.sin(rad) * (irisRadius - 2);

            return (
              <Line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(0,0,0,0.15)"
                strokeWidth="0.5"
              />
            );
          })}

          {/* Fuchs Crypts - Elmas şeklindeki iris açıklıkları */}
          {size === 'large' && [...Array(6)].map((_, i) => {
            const angle = (i * 60 + 30) * (Math.PI / 180);
            const distance = irisRadius * 0.75;
            const cryptX = eyeX + Math.cos(angle) * distance;
            const cryptY = eyeY + Math.sin(angle) * distance;
            const cryptSize = 2 + Math.random() * 1.5;

            return (
              <Ellipse
                key={`crypt-${i}`}
                cx={cryptX}
                cy={cryptY}
                rx={cryptSize}
                ry={cryptSize * 1.4}
                fill="rgba(0,0,0,0.12)"
                rotation={angle * (180 / Math.PI)}
              />
            );
          })}

          {/* Collarette (wavy pattern) */}
          <Circle
            cx={eyeX}
            cy={eyeY}
            r={irisRadius * 0.65}
            fill="none"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="0.8"
            strokeDasharray="2,1"
          />

          {/* Inner iris rings */}
          <Circle
            cx={eyeX}
            cy={eyeY}
            r={irisRadius * 0.8}
            fill="none"
            stroke="rgba(0,0,0,0.12)"
            strokeWidth="0.5"
          />

          <Circle
            cx={eyeX}
            cy={eyeY}
            r={irisRadius * 0.9}
            fill="none"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth="0.5"
          />

          {/* Limbus darkening */}
          <Circle
            cx={eyeX}
            cy={eyeY}
            r={irisRadius}
            fill="url(#limbusDark)"
          />

          {/* Limbus ring */}
          <Circle
            cx={eyeX}
            cy={eyeY}
            r={irisRadius + 0.5}
            fill="none"
            stroke="rgba(0,0,0,0.4)"
            strokeWidth="1.5"
          />

          {/* Pupil with gradient - Animated dilation */}
          <AnimatedCircle
            cx={eyeX}
            cy={eyeY}
            r={pupilRadius}
            fill="url(#pupilGradient)"
            scale={pupilScale}
            origin={`${eyeX}, ${eyeY}`}
          />

          {/* Pupil edge - Animated */}
          <AnimatedCircle
            cx={eyeX}
            cy={eyeY}
            r={pupilRadius + 0.5}
            fill="none"
            stroke="rgba(0,0,0,0.8)"
            strokeWidth="0.5"
            scale={pupilScale}
            origin={`${eyeX}, ${eyeY}`}
          />

          {/* Main cornea highlight (wetness) */}
          <Circle
            cx={eyeX - pupilRadius * 0.6}
            cy={eyeY - pupilRadius * 0.6}
            r={pupilRadius * 0.9}
            fill="url(#corneaMain)"
          />

          {/* Secondary highlight */}
          <AnimatedCircle
            cx={eyeX + pupilRadius * 0.7}
            cy={eyeY + pupilRadius * 0.9}
            r={pupilRadius * 0.35}
            fill="url(#corneaSecondary)"
            opacity={glossAnim}
          />

          {/* Small sparkle */}
          <Circle
            cx={eyeX - pupilRadius * 0.3}
            cy={eyeY - pupilRadius * 0.9}
            r={pupilRadius * 0.15}
            fill="#FFFFFF"
            opacity={0.9}
          />

          {/* Kornea refraction overlay - Tüm iris üzerinde */}
          <Circle
            cx={eyeX}
            cy={eyeY}
            r={irisRadius + 2}
            fill="url(#corneaRefraction)"
          />
        </AnimatedG>
      </G>
    );
  };

  return (
    <View style={[styles.container, { width: dimensions.width, height: dimensions.height }]}>
      <Svg width={dimensions.width} height={dimensions.height} viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}>
        <Defs>
          {/* Sclera gradient */}
          <RadialGradient id="scleraGradient" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#FEFEFE" stopOpacity="1" />
            <Stop offset="40%" stopColor="#FCFDFD" stopOpacity="1" />
            <Stop offset="70%" stopColor="#F5F8FA" stopOpacity="1" />
            <Stop offset="100%" stopColor="#E8EDEF" stopOpacity="1" />
          </RadialGradient>

          <RadialGradient id="scleraShadow" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <Stop offset="85%" stopColor="rgba(0,0,0,0.02)" />
            <Stop offset="100%" stopColor="rgba(0,0,0,0.08)" />
          </RadialGradient>

          {/* Iris gradients - Kahverengi (dünya nüfusunun %70-80'i) */}
          <RadialGradient id="irisBase" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#A67C52" stopOpacity="1" />
            <Stop offset="25%" stopColor="#8C5933" stopOpacity="1" />
            <Stop offset="50%" stopColor="#6B4423" stopOpacity="1" />
            <Stop offset="75%" stopColor="#4A2F18" stopOpacity="1" />
            <Stop offset="100%" stopColor="#2D1B0E" stopOpacity="1" />
          </RadialGradient>

          <RadialGradient id="irisPattern" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
            <Stop offset="40%" stopColor="rgba(0,0,0,0.1)" />
            <Stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
          </RadialGradient>

          <RadialGradient id="pupilGradient" cx="40%" cy="40%">
            <Stop offset="0%" stopColor="#1A1A1A" stopOpacity="1" />
            <Stop offset="50%" stopColor="#0A0A0A" stopOpacity="1" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="1" />
          </RadialGradient>

          <RadialGradient id="corneaMain" cx="35%" cy="35%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <Stop offset="60%" stopColor="#F0F9FF" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </RadialGradient>

          <RadialGradient id="corneaSecondary" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </RadialGradient>

          <RadialGradient id="limbusDark" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="rgba(0,0,0,0)" />
            <Stop offset="85%" stopColor="rgba(0,0,0,0.1)" />
            <Stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
          </RadialGradient>

          {/* Kornea refraction katmanı - Islaklık ve derinlik */}
          <RadialGradient id="corneaRefraction" cx="50%" cy="45%">
            <Stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
            <Stop offset="30%" stopColor="rgba(255,255,255,0.08)" />
            <Stop offset="60%" stopColor="rgba(255,255,255,0.03)" />
            <Stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </RadialGradient>
        </Defs>

        {/* Left Eye */}
        {renderEye(leftEyeX)}

        {/* Right Eye */}
        {renderEye(rightEyeX)}
      </Svg>

      {/* Blink overlay */}
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
    backgroundColor: '#0F172A',
    opacity: 0,
  },
});
