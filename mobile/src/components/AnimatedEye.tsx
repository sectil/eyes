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
    const irisPatternLines = 80; // Daha fazla radyal çizgi (gerçekçi iris fiber'ları)

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

        {/* Kan damarları - Daha gerçekçi */}
        {size === 'large' && (
          <>
            <Line x1={eyeX - 38} y1={eyeY - 10} x2={eyeX - 22} y2={eyeY - 6} stroke="rgba(180,50,60,0.15)" strokeWidth="0.6" />
            <Line x1={eyeX - 35} y1={eyeY - 8} x2={eyeX - 24} y2={eyeY - 5} stroke="rgba(180,50,60,0.12)" strokeWidth="0.5" />
            <Line x1={eyeX + 38} y1={eyeY + 10} x2={eyeX + 22} y2={eyeY + 6} stroke="rgba(180,50,60,0.15)" strokeWidth="0.6" />
            <Line x1={eyeX + 35} y1={eyeY + 8} x2={eyeX + 24} y2={eyeY + 5} stroke="rgba(180,50,60,0.12)" strokeWidth="0.5" />
            <Line x1={eyeX - 30} y1={eyeY + 12} x2={eyeX - 20} y2={eyeY + 9} stroke="rgba(180,50,60,0.1)" strokeWidth="0.5" />
            <Line x1={eyeX + 30} y1={eyeY - 12} x2={eyeX + 20} y2={eyeY - 9} stroke="rgba(180,50,60,0.1)" strokeWidth="0.5" />
            <Path d={`M ${eyeX - 32} ${eyeY - 6} Q ${eyeX - 26} ${eyeY - 4} ${eyeX - 22} ${eyeY - 3}`} stroke="rgba(180,50,60,0.08)" strokeWidth="0.4" fill="none" />
            <Path d={`M ${eyeX + 32} ${eyeY + 6} Q ${eyeX + 26} ${eyeY + 4} ${eyeX + 22} ${eyeY + 3}`} stroke="rgba(180,50,60,0.08)" strokeWidth="0.4" fill="none" />
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

          {/* Iris depth overlay - 3D effect */}
          <Circle
            cx={eyeX}
            cy={eyeY}
            r={irisRadius}
            fill="url(#irisDepth)"
          />

          {/* Radial pattern lines (iris fibers) - Çok daha fazla detay */}
          {[...Array(irisPatternLines)].map((_, i) => {
            const angle = (i * 360) / irisPatternLines;
            const rad = (angle * Math.PI) / 180;

            // Her çizgiye farklı uzunluk ve kalınlık
            const startRadius = pupilRadius + (Math.sin(i * 0.5) * 2);
            const endRadius = irisRadius - 2 - (Math.sin(i * 0.3) * 3);

            const x1 = eyeX + Math.cos(rad) * startRadius;
            const y1 = eyeY + Math.sin(rad) * startRadius;
            const x2 = eyeX + Math.cos(rad) * endRadius;
            const y2 = eyeY + Math.sin(rad) * endRadius;

            // Opacity varyasyonu
            const opacity = 0.08 + (Math.sin(i * 0.7) * 0.1);
            const strokeWidth = i % 3 === 0 ? 0.6 : 0.3;

            return (
              <Line
                key={`fiber-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={`rgba(0,0,0,${opacity})`}
                strokeWidth={strokeWidth}
              />
            );
          })}

          {/* Organic noise pattern - Texture simulation */}
          {size === 'large' && [...Array(150)].map((_, i) => {
            const angle = (Math.random() * 360) * (Math.PI / 180);
            const distance = pupilRadius + Math.random() * (irisRadius - pupilRadius);
            const dotX = eyeX + Math.cos(angle) * distance;
            const dotY = eyeY + Math.sin(angle) * distance;
            const dotSize = 0.3 + Math.random() * 0.4;
            const dotOpacity = 0.05 + Math.random() * 0.1;

            return (
              <Circle
                key={`noise-${i}`}
                cx={dotX}
                cy={dotY}
                r={dotSize}
                fill={`rgba(0,0,0,${dotOpacity})`}
              />
            );
          })}

          {/* Fuchs Crypts - Elmas şeklindeki iris açıklıkları */}
          {size === 'large' && [...Array(12)].map((_, i) => {
            const angle = (i * 30 + 15 + Math.random() * 10) * (Math.PI / 180);
            const distance = irisRadius * (0.65 + Math.random() * 0.2);
            const cryptX = eyeX + Math.cos(angle) * distance;
            const cryptY = eyeY + Math.sin(angle) * distance;
            const cryptSize = 1.5 + Math.random() * 2;

            return (
              <Ellipse
                key={`crypt-${i}`}
                cx={cryptX}
                cy={cryptY}
                rx={cryptSize}
                ry={cryptSize * 1.6}
                fill="rgba(0,0,0,0.15)"
                rotation={angle * (180 / Math.PI)}
              />
            );
          })}

          {/* Multiple concentric circles - Iris depth */}
          {[0.4, 0.5, 0.55, 0.62, 0.68, 0.75, 0.82, 0.88, 0.93, 0.97].map((ratio, i) => (
            <Circle
              key={`circle-${i}`}
              cx={eyeX}
              cy={eyeY}
              r={irisRadius * ratio}
              fill="none"
              stroke={`rgba(0,0,0,${0.04 + (i % 2) * 0.04})`}
              strokeWidth={i % 3 === 0 ? 0.6 : 0.3}
              strokeDasharray={i % 4 === 0 ? "1,0.5" : undefined}
            />
          ))}

          {/* Collarette (wavy pattern) - Daha belirgin */}
          <Circle
            cx={eyeX}
            cy={eyeY}
            r={irisRadius * 0.65}
            fill="none"
            stroke="rgba(0,0,0,0.25)"
            strokeWidth="1.2"
            strokeDasharray="3,1.5"
          />

          <Circle
            cx={eyeX}
            cy={eyeY}
            r={irisRadius * 0.67}
            fill="none"
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="0.8"
            strokeDasharray="2,1"
          />

          {/* Limbus darkening */}
          <Circle
            cx={eyeX}
            cy={eyeY}
            r={irisRadius}
            fill="url(#limbusDark)"
          />

          {/* Limbus ring - Güçlendirilmiş (genç ve sağlıklı göz) */}
          <Circle
            cx={eyeX}
            cy={eyeY}
            r={irisRadius + 0.3}
            fill="none"
            stroke="rgba(15,35,45,0.75)"
            strokeWidth="2.2"
          />

          {/* Limbus outer edge */}
          <Circle
            cx={eyeX}
            cy={eyeY}
            r={irisRadius + 1.2}
            fill="none"
            stroke="rgba(10,25,35,0.45)"
            strokeWidth="1.0"
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
          {/* Sclera gradient - Gerçekçi göz beyazı (hafif krem tonu) */}
          <RadialGradient id="scleraGradient" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="#FBF8F3" stopOpacity="1" />
            <Stop offset="40%" stopColor="#F8F5F0" stopOpacity="1" />
            <Stop offset="70%" stopColor="#F2EDE8" stopOpacity="1" />
            <Stop offset="100%" stopColor="#E8E3DC" stopOpacity="1" />
          </RadialGradient>

          <RadialGradient id="scleraShadow" cx="50%" cy="50%">
            <Stop offset="0%" stopColor="rgba(255,250,245,0)" />
            <Stop offset="80%" stopColor="rgba(230,210,190,0.03)" />
            <Stop offset="100%" stopColor="rgba(200,180,160,0.1)" />
          </RadialGradient>

          {/* Iris gradients - Çok katmanlı gerçekçi renk */}
          <RadialGradient id="irisBase" cx="42%" cy="43%">
            <Stop offset="0%" stopColor="#D4B870" stopOpacity="1" />
            <Stop offset="10%" stopColor="#B8A05F" stopOpacity="1" />
            <Stop offset="20%" stopColor="#8FAA78" stopOpacity="1" />
            <Stop offset="30%" stopColor="#6F9B7A" stopOpacity="1" />
            <Stop offset="42%" stopColor="#52887C" stopOpacity="1" />
            <Stop offset="55%" stopColor="#3F7670" stopOpacity="1" />
            <Stop offset="68%" stopColor="#2E6663" stopOpacity="1" />
            <Stop offset="78%" stopColor="#235551" stopOpacity="1" />
            <Stop offset="88%" stopColor="#1A4540" stopOpacity="1" />
            <Stop offset="95%" stopColor="#123832" stopOpacity="1" />
            <Stop offset="100%" stopColor="#0A2B28" stopOpacity="1" />
          </RadialGradient>

          <RadialGradient id="irisPattern" cx="48%" cy="48%">
            <Stop offset="0%" stopColor="rgba(255,250,230,0.5)" />
            <Stop offset="15%" stopColor="rgba(230,240,210,0.35)" />
            <Stop offset="30%" stopColor="rgba(180,220,180,0.25)" />
            <Stop offset="50%" stopColor="rgba(100,160,140,0.2)" />
            <Stop offset="70%" stopColor="rgba(60,120,110,0.18)" />
            <Stop offset="85%" stopColor="rgba(30,80,75,0.22)" />
            <Stop offset="100%" stopColor="rgba(0,0,0,0.35)" />
          </RadialGradient>

          {/* Iris secondary overlay - 3D depth */}
          <RadialGradient id="irisDepth" cx="55%" cy="55%">
            <Stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
            <Stop offset="40%" stopColor="rgba(0,0,0,0)" />
            <Stop offset="70%" stopColor="rgba(0,0,0,0.15)" />
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
