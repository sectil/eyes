import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, Button, Surface, IconButton, ProgressBar, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { trpc } from '@/utils/trpc';
import Svg, { Circle } from 'react-native-svg';

// Ishihara-like color blindness test plates
// Each plate has a number hidden in colored dots
const COLOR_PLATES = [
  {
    id: 1,
    correctAnswer: '12',
    difficulty: 'control',
    description: 'Herkes bu sayıyı görmeli',
    foregroundColors: ['#E74C3C', '#C0392B'],
    backgroundColors: ['#2ECC71', '#27AE60'],
  },
  {
    id: 2,
    correctAnswer: '8',
    difficulty: 'red-green',
    description: 'Kırmızı-Yeşil renk körlüğü testi',
    foregroundColors: ['#E74C3C', '#EC7063'],
    backgroundColors: ['#82E0AA', '#58D68D'],
  },
  {
    id: 3,
    correctAnswer: '6',
    difficulty: 'red-green',
    description: 'Kırmızı-Yeşil renk körlüğü testi',
    foregroundColors: ['#E67E22', '#D68910'],
    backgroundColors: ['#7DCEA0', '#52BE80'],
  },
  {
    id: 4,
    correctAnswer: '29',
    difficulty: 'red-green',
    description: 'Kırmızı-Yeşil renk körlüğü testi (zor)',
    foregroundColors: ['#CB4335', '#B03A2E'],
    backgroundColors: ['#76D7C4', '#48C9B0'],
  },
  {
    id: 5,
    correctAnswer: '5',
    difficulty: 'protanopia',
    description: 'Protanopia (Kırmızı körlüğü) testi',
    foregroundColors: ['#922B21', '#78281F'],
    backgroundColors: ['#85C1E2', '#5DADE2'],
  },
  {
    id: 6,
    correctAnswer: '3',
    difficulty: 'deuteranopia',
    description: 'Deuteranopia (Yeşil körlüğü) testi',
    foregroundColors: ['#D35400', '#BA4A00'],
    backgroundColors: ['#AED6F1', '#85C1E9'],
  },
  {
    id: 7,
    correctAnswer: '15',
    difficulty: 'blue-yellow',
    description: 'Mavi-Sarı renk körlüğü testi (nadir)',
    foregroundColors: ['#3498DB', '#2E86C1'],
    backgroundColors: ['#F4D03F', '#F1C40F'],
  },
  {
    id: 8,
    correctAnswer: '74',
    difficulty: 'red-green',
    description: 'Kırmızı-Yeşil renk körlüğü testi (zor)',
    foregroundColors: ['#E74C3C', '#CB4335'],
    backgroundColors: ['#7DCEA0', '#58D68D'],
  },
];

interface ColorPlateProps {
  foregroundColors: string[];
  backgroundColors: string[];
  number: string;
}

// Simple color plate visualization
function ColorPlate({ foregroundColors, backgroundColors, number }: ColorPlateProps) {
  const dots: { cx: number; cy: number; r: number; color: string }[] = [];
  const size = 250;
  const centerX = size / 2;
  const centerY = size / 2;

  // Generate random dots
  const seed = parseInt(number);
  const random = (index: number) => {
    const x = Math.sin(seed * index * 9999) * 10000;
    return x - Math.floor(x);
  };

  // Create background dots
  for (let i = 0; i < 400; i++) {
    const angle = random(i) * Math.PI * 2;
    const distance = random(i + 1000) * (size / 2 - 10);
    const cx = centerX + Math.cos(angle) * distance;
    const cy = centerY + Math.sin(angle) * distance;
    const r = 3 + random(i + 2000) * 5;
    const color = backgroundColors[Math.floor(random(i + 3000) * backgroundColors.length)];

    dots.push({ cx, cy, r, color });
  }

  // Create number shape (simplified - just using different colored dots)
  // In real Ishihara plates, the number would be formed by specific dot patterns
  const numberDigits = number.split('');
  numberDigits.forEach((digit, digitIndex) => {
    const digitX = centerX + (digitIndex - numberDigits.length / 2 + 0.5) * 40;

    // Simple digit patterns
    const digitDots = getDigitPattern(parseInt(digit), digitX, centerY);
    digitDots.forEach((dot, i) => {
      const color = foregroundColors[Math.floor(random(i + parseInt(digit) * 100) * foregroundColors.length)];
      dots.push({ ...dot, color, r: dot.r + 2 });
    });
  });

  return (
    <Svg width={size} height={size} style={styles.plateSvg}>
      <Circle cx={centerX} cy={centerY} r={size / 2 - 5} fill="#F5F5F5" />
      {dots.map((dot, i) => (
        <Circle key={i} cx={dot.cx} cy={dot.cy} r={dot.r} fill={dot.color} />
      ))}
    </Svg>
  );
}

function getDigitPattern(digit: number, centerX: number, centerY: number) {
  const dots: { cx: number; cy: number; r: number }[] = [];
  const scale = 15;

  // Simple dot patterns for each digit (0-9)
  const patterns: Record<number, Array<[number, number]>> = {
    0: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]],
    1: [[0, -1], [0, 0], [0, 1]],
    2: [[-1, -1], [0, -1], [1, -1], [1, 0], [0, 0], [-1, 1], [0, 1], [1, 1]],
    3: [[-1, -1], [0, -1], [1, -1], [1, 0], [0, 0], [1, 1], [0, 1], [-1, 1]],
    4: [[-1, -1], [-1, 0], [0, 0], [1, 0], [1, -1], [1, 1]],
    5: [[1, -1], [0, -1], [-1, -1], [-1, 0], [0, 0], [1, 0], [1, 1], [0, 1], [-1, 1]],
    6: [[-1, -1], [0, -1], [1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0]],
    7: [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1]],
    8: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [0, 0], [-1, 1], [0, 1], [1, 1]],
    9: [[-1, -1], [0, -1], [1, -1], [-1, 0], [0, 0], [1, 0], [1, 1], [0, 1]],
  };

  const pattern = patterns[digit] || patterns[0];
  pattern.forEach(([x, y]) => {
    dots.push({
      cx: centerX + x * scale,
      cy: centerY + y * scale,
      r: 5,
    });
  });

  return dots;
}

export default function ColorBlindnessTestScreen() {
  const navigation = useNavigation();
  const [currentPlate, setCurrentPlate] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [answers, setAnswers] = useState<{ plateId: number; userAnswer: string; correct: boolean }[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [testStartTime] = useState(Date.now());

  const saveTestMutation = trpc.tests.saveTestResult.useMutation();

  const currentPlateData = COLOR_PLATES[currentPlate];

  const handleSubmitAnswer = () => {
    const isCorrect = userAnswer.trim() === currentPlateData.correctAnswer;

    const newAnswer = {
      plateId: currentPlateData.id,
      userAnswer: userAnswer.trim(),
      correct: isCorrect,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    setUserAnswer('');

    // Move to next plate or finish
    if (currentPlate < COLOR_PLATES.length - 1) {
      setCurrentPlate(currentPlate + 1);
    } else {
      finishTest(updatedAnswers);
    }
  };

  const finishTest = async (finalAnswers: typeof answers) => {
    const duration = Math.floor((Date.now() - testStartTime) / 1000);

    // Analyze results
    const totalCorrect = finalAnswers.filter((a) => a.correct).length;
    const percentage = (totalCorrect / COLOR_PLATES.length) * 100;

    // Determine color blindness type
    let diagnosis = 'Normal';
    const redGreenErrors = finalAnswers.filter(
      (a, i) => !a.correct && ['red-green', 'protanopia', 'deuteranopia'].includes(COLOR_PLATES[i].difficulty)
    ).length;
    const blueYellowErrors = finalAnswers.filter(
      (a, i) => !a.correct && COLOR_PLATES[i].difficulty === 'blue-yellow'
    ).length;

    if (totalCorrect === COLOR_PLATES.length) {
      diagnosis = 'Normal - Renk görme yeteneği normal';
    } else if (redGreenErrors >= 3) {
      diagnosis = 'Olası Kırmızı-Yeşil Renk Körlüğü';
    } else if (blueYellowErrors >= 1) {
      diagnosis = 'Olası Mavi-Sarı Renk Körlüğü (nadir)';
    } else if (percentage < 75) {
      diagnosis = 'Hafif Renk Görme Bozukluğu';
    } else {
      diagnosis = 'Normal - Küçük farklılıklar';
    }

    try {
      await saveTestMutation.mutateAsync({
        testType: 'color',
        rightEyeScore: `${totalCorrect}/${COLOR_PLATES.length}`,
        leftEyeScore: `${percentage.toFixed(0)}%`,
        binocularScore: diagnosis,
        duration,
        rawData: {
          answers: finalAnswers,
          diagnosis,
          percentage,
          redGreenErrors,
          blueYellowErrors,
        },
      });
    } catch (error) {
      console.error('Failed to save color test:', error);
    }

    setIsComplete(true);
  };

  const skipTest = () => {
    finishTest(answers);
  };

  if (isComplete) {
    const totalCorrect = answers.filter((a) => a.correct).length;
    const percentage = (totalCorrect / COLOR_PLATES.length) * 100;

    const redGreenErrors = answers.filter(
      (a, i) => !a.correct && ['red-green', 'protanopia', 'deuteranopia'].includes(COLOR_PLATES[i].difficulty)
    ).length;

    let diagnosis = 'Normal';
    let diagnosisColor = '#4CAF50';
    let recommendation = 'Renk görme yeteneğiniz normaldir.';

    if (totalCorrect === COLOR_PLATES.length) {
      diagnosis = 'Normal Renk Görme';
      diagnosisColor = '#4CAF50';
      recommendation = 'Harika! Tüm renkleri doğru ayırt edebiliyorsunuz.';
    } else if (redGreenErrors >= 3) {
      diagnosis = 'Olası Kırmızı-Yeşil Renk Körlüğü';
      diagnosisColor = '#f44336';
      recommendation = 'Kırmızı ve yeşil tonlarını ayırt etmekte zorlanıyor olabilirsiniz. Bir göz doktoru ile görüşmenizi öneririz.';
    } else if (percentage < 75) {
      diagnosis = 'Hafif Renk Görme Bozukluğu';
      diagnosisColor = '#FF9800';
      recommendation = 'Bazı renk tonlarında hafif zorluk yaşıyor olabilirsiniz. Göz doktorunuza danışın.';
    } else {
      diagnosis = 'Normal';
      diagnosisColor = '#4CAF50';
      recommendation = 'Renk görme yeteneğiniz genel olarak iyidir.';
    }

    return (
      <View style={styles.container}>
        <Surface style={styles.header} elevation={2}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} iconColor="#fff" />
          <Text variant="headlineSmall" style={styles.title}>
            Test Tamamlandı
          </Text>
          <View style={{ width: 40 }} />
        </Surface>

        <ScrollView style={styles.content}>
          <Surface style={styles.resultCard} elevation={3}>
            <Text variant="headlineMedium" style={styles.resultTitle}>
              Renk Körlüğü Testi Sonuçları
            </Text>

            <View style={styles.scoreDisplay}>
              <Text variant="displayMedium" style={styles.scoreNumber}>
                {totalCorrect}/{COLOR_PLATES.length}
              </Text>
              <Text variant="titleMedium" style={styles.scorePercentage}>
                %{percentage.toFixed(0)} Doğru
              </Text>
            </View>

            <View style={[styles.diagnosisBox, { borderColor: diagnosisColor }]}>
              <Text variant="titleLarge" style={[styles.diagnosis, { color: diagnosisColor }]}>
                {diagnosis}
              </Text>
              <Text variant="bodyMedium" style={styles.recommendation}>
                {recommendation}
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text variant="titleMedium" style={styles.infoTitle}>
                Renk Körlüğü Hakkında
              </Text>
              <Text variant="bodyMedium" style={styles.infoText}>
                • Renk körlüğü genetik bir durumdur ve erkeklerde daha yaygındır
              </Text>
              <Text variant="bodyMedium" style={styles.infoText}>
                • En yaygın türü Kırmızı-Yeşil renk körlüğüdür (%8 erkek, %0.5 kadın)
              </Text>
              <Text variant="bodyMedium" style={styles.infoText}>
                • Tedavi yoktur ama özel lensler ve uygulamalar yardımcı olabilir
              </Text>
              <Text variant="bodyMedium" style={styles.infoText}>
                • Bu test tarama amaçlıdır, kesin teşhis için göz doktoruna başvurun
              </Text>
            </View>

            <View style={styles.answersSection}>
              <Text variant="titleMedium" style={styles.answersTitle}>
                Cevaplarınız:
              </Text>
              {answers.map((answer, index) => (
                <View key={index} style={styles.answerRow}>
                  <Text style={styles.answerIndex}>Plaka {index + 1}:</Text>
                  <Text style={styles.answerText}>
                    Sizin: {answer.userAnswer || '(boş)'} - Doğru: {COLOR_PLATES[index].correctAnswer}
                  </Text>
                  <Text style={answer.correct ? styles.correctIcon : styles.wrongIcon}>
                    {answer.correct ? '✓' : '✗'}
                  </Text>
                </View>
              ))}
            </View>

            <Button
              mode="contained"
              onPress={() => navigation.goBack()}
              style={styles.doneButton}
              icon="check"
            >
              Tamamlandı
            </Button>
          </Surface>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} iconColor="#fff" />
        <Text variant="headlineSmall" style={styles.title}>
          Renk Körlüğü Testi
        </Text>
        <View style={{ width: 40 }} />
      </Surface>

      <View style={styles.progressContainer}>
        <Text variant="bodyMedium" style={styles.progressText}>
          Plaka {currentPlate + 1} / {COLOR_PLATES.length}
        </Text>
        <ProgressBar
          progress={(currentPlate + 1) / COLOR_PLATES.length}
          color="#6200ee"
          style={styles.progress}
        />
      </View>

      <ScrollView style={styles.testContent}>
        <View style={styles.instructionBox}>
          <Text variant="titleMedium" style={styles.instructionTitle}>
            Talimatlar:
          </Text>
          <Text variant="bodyMedium" style={styles.instructionText}>
            Aşağıdaki renkli daireler içinde gördüğünüz sayıyı yazın.
          </Text>
          <Text variant="bodySmall" style={styles.instructionNote}>
            {currentPlateData.description}
          </Text>
        </View>

        <View style={styles.plateContainer}>
          <ColorPlate
            foregroundColors={currentPlateData.foregroundColors}
            backgroundColors={currentPlateData.backgroundColors}
            number={currentPlateData.correctAnswer}
          />
        </View>

        <View style={styles.answerSection}>
          <Text variant="titleMedium" style={styles.answerLabel}>
            Gördüğünüz sayıyı yazın:
          </Text>
          <TextInput
            mode="outlined"
            value={userAnswer}
            onChangeText={setUserAnswer}
            keyboardType="number-pad"
            placeholder="örn: 12"
            style={styles.answerInput}
            maxLength={3}
          />
        </View>

        <Button
          mode="contained"
          onPress={handleSubmitAnswer}
          disabled={!userAnswer.trim()}
          style={styles.submitButton}
          icon="arrow-right"
        >
          {currentPlate < COLOR_PLATES.length - 1 ? 'Sonraki Plaka' : 'Testi Bitir'}
        </Button>

        <Button mode="outlined" onPress={skipTest} style={styles.skipButton}>
          Hiçbir Sayı Göremiyorum (Testi Bitir)
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#6200ee',
  },
  title: { color: '#fff', fontWeight: 'bold' },
  progressContainer: { padding: 16, backgroundColor: '#fff' },
  progressText: { textAlign: 'center', marginBottom: 8, fontWeight: 'bold' },
  progress: { height: 8, borderRadius: 4 },
  testContent: { flex: 1, padding: 16 },
  instructionBox: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  instructionTitle: { color: '#1976D2', marginBottom: 8 },
  instructionText: { color: '#424242', marginBottom: 4 },
  instructionNote: { color: '#757575', fontStyle: 'italic', marginTop: 4 },
  plateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  plateSvg: {
    borderRadius: 125,
  },
  answerSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  answerLabel: { marginBottom: 12 },
  answerInput: { fontSize: 24, textAlign: 'center' },
  submitButton: { marginBottom: 12 },
  skipButton: { borderColor: '#666', marginBottom: 20 },
  content: { flex: 1 },
  resultCard: { margin: 16, padding: 20, borderRadius: 12, backgroundColor: '#fff' },
  resultTitle: { textAlign: 'center', marginBottom: 24, color: '#6200ee' },
  scoreDisplay: { alignItems: 'center', marginBottom: 24 },
  scoreNumber: { fontWeight: 'bold', color: '#6200ee' },
  scorePercentage: { color: '#666', marginTop: 8 },
  diagnosisBox: {
    borderWidth: 3,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#FAFAFA',
  },
  diagnosis: { fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  recommendation: { textAlign: 'center', color: '#424242' },
  infoBox: { backgroundColor: '#FFF9C4', padding: 16, borderRadius: 8, marginBottom: 20 },
  infoTitle: { marginBottom: 8, color: '#F57F17' },
  infoText: { color: '#424242', marginBottom: 4 },
  answersSection: { marginBottom: 20 },
  answersTitle: { marginBottom: 12, color: '#666' },
  answerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  answerIndex: { fontWeight: 'bold', width: 80 },
  answerText: { flex: 1, color: '#666' },
  correctIcon: { color: '#4CAF50', fontSize: 20, fontWeight: 'bold' },
  wrongIcon: { color: '#f44336', fontSize: 20, fontWeight: 'bold' },
  doneButton: { marginTop: 8 },
});
