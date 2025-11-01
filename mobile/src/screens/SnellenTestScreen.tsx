import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { Text, Button, Surface, IconButton, ProgressBar, RadioButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { trpc } from '@/services/trpc';

// Snellen chart lines - standard visual acuity test
const SNELLEN_LINES = [
  { level: '20/200', size: 80, letters: ['E'] },
  { level: '20/100', size: 60, letters: ['F', 'P'] },
  { level: '20/70', size: 48, letters: ['T', 'O', 'Z'] },
  { level: '20/50', size: 38, letters: ['L', 'P', 'E', 'D'] },
  { level: '20/40', size: 32, letters: ['P', 'E', 'C', 'F', 'D'] },
  { level: '20/30', size: 26, letters: ['E', 'D', 'F', 'C', 'Z', 'P'] },
  { level: '20/25', size: 22, letters: ['F', 'E', 'L', 'O', 'P', 'Z', 'D'] },
  { level: '20/20', size: 18, letters: ['D', 'E', 'F', 'P', 'O', 'T', 'E', 'C'] },
  { level: '20/15', size: 14, letters: ['L', 'E', 'F', 'O', 'D', 'P', 'C', 'T'] },
  { level: '20/10', size: 10, letters: ['F', 'D', 'P', 'L', 'T', 'C', 'E', 'O'] },
];

const LETTER_OPTIONS = ['E', 'F', 'P', 'T', 'O', 'Z', 'L', 'C', 'D'];

type TestEye = 'right' | 'left' | 'both';

export default function SnellenTestScreen() {
  const navigation = useNavigation();
  const [currentEye, setCurrentEye] = useState<TestEye>('right');
  const [currentLine, setCurrentLine] = useState(0);
  const [currentLetter, setCurrentLetter] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [rightEyeScore, setRightEyeScore] = useState<string>('20/20');
  const [leftEyeScore, setLeftEyeScore] = useState<string>('20/20');
  const [testStartTime, setTestStartTime] = useState(Date.now());
  const [isComplete, setIsComplete] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  const saveTestMutation = trpc.tests.saveTestResult.useMutation();

  const currentLineData = SNELLEN_LINES[currentLine];
  const currentLetterToShow = currentLineData.letters[currentLetter];

  useEffect(() => {
    setTestStartTime(Date.now());
  }, []);

  const handleAnswer = () => {
    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer === currentLetterToShow;

    if (!isCorrect) {
      setMistakes((prev) => prev + 1);
    }

    // Move to next letter
    if (currentLetter < currentLineData.letters.length - 1) {
      setCurrentLetter(currentLetter + 1);
      setSelectedAnswer(null);
    } else {
      // Move to next line or finish eye test
      if (isCorrect && currentLine < SNELLEN_LINES.length - 1) {
        // Can still read, continue to smaller letters
        setCurrentLine(currentLine + 1);
        setCurrentLetter(0);
        setSelectedAnswer(null);
        setMistakes(0);
      } else {
        // Either made mistakes or reached the end
        finishEyeTest();
      }
    }
  };

  const finishEyeTest = () => {
    // Calculate score based on last successful line
    let scoreIndex = currentLine;
    if (mistakes > 1) {
      scoreIndex = Math.max(0, currentLine - 1);
    }

    const score = SNELLEN_LINES[scoreIndex].level;

    if (currentEye === 'right') {
      setRightEyeScore(score);
      // Start left eye test
      setCurrentEye('left');
      setCurrentLine(0);
      setCurrentLetter(0);
      setMistakes(0);
      setSelectedAnswer(null);
    } else if (currentEye === 'left') {
      setLeftEyeScore(score);
      // Start both eyes test
      setCurrentEye('both');
      setCurrentLine(0);
      setCurrentLetter(0);
      setMistakes(0);
      setSelectedAnswer(null);
    } else {
      // Both eyes test complete
      const binocularScore = score;
      saveTest(rightEyeScore, leftEyeScore, binocularScore);
    }
  };

  const saveTest = async (right: string, left: string, binocular: string) => {
    const duration = Math.floor((Date.now() - testStartTime) / 1000);

    try {
      await saveTestMutation.mutateAsync({
        testType: 'snellen',
        rightEyeScore: right,
        leftEyeScore: left,
        binocularScore: binocular,
        duration,
        rawData: {
          rightEye: right,
          leftEye: left,
          binocular: binocular,
          duration,
        },
      });

      setIsComplete(true);
    } catch (error) {
      console.error('Failed to save test:', error);
      setIsComplete(true);
    }
  };

  const getEyeInstructions = () => {
    switch (currentEye) {
      case 'right':
        return '👁️ Sağ Göz Testi - Sol gözünüzü kapatın';
      case 'left':
        return '👁️ Sol Göz Testi - Sağ gözünüzü kapatın';
      case 'both':
        return '👁️👁️ Her İki Göz Testi - Her iki gözünüzle bakın';
      default:
        return '';
    }
  };

  const getScoreQuality = (score: string) => {
    if (score === '20/10' || score === '20/15') return { text: 'Mükemmel', color: '#4CAF50' };
    if (score === '20/20' || score === '20/25') return { text: 'Normal', color: '#2196F3' };
    if (score === '20/30' || score === '20/40') return { text: 'Orta', color: '#FF9800' };
    return { text: 'Zayıf - Göz Doktoru Önerilir', color: '#f44336' };
  };

  if (isComplete) {
    const rightQuality = getScoreQuality(rightEyeScore);
    const leftQuality = getScoreQuality(leftEyeScore);

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
              ✅ Snellen Testi Tamamlandı
            </Text>

            <View style={styles.scoreContainer}>
              <View style={styles.scoreItem}>
                <Text variant="titleLarge">Sağ Göz</Text>
                <Text variant="displaySmall" style={styles.scoreValue}>
                  {rightEyeScore}
                </Text>
                <Text style={[styles.scoreQuality, { color: rightQuality.color }]}>
                  {rightQuality.text}
                </Text>
              </View>

              <View style={styles.scoreItem}>
                <Text variant="titleLarge">Sol Göz</Text>
                <Text variant="displaySmall" style={styles.scoreValue}>
                  {leftEyeScore}
                </Text>
                <Text style={[styles.scoreQuality, { color: leftQuality.color }]}>
                  {leftQuality.text}
                </Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text variant="titleMedium" style={styles.infoTitle}>
                ℹ️ Snellen Testi Nedir?
              </Text>
              <Text variant="bodyMedium" style={styles.infoText}>
                Snellen testi görme keskinliğinizi ölçer. 20/20 normal görmeyi temsil eder.
              </Text>
              <Text variant="bodyMedium" style={styles.infoText}>
                • 20/20 - 20/15: Normal/Mükemmel görme
              </Text>
              <Text variant="bodyMedium" style={styles.infoText}>
                • 20/30 - 20/40: Hafif görme kaybı
              </Text>
              <Text variant="bodyMedium" style={styles.infoText}>
                • 20/50+: Göz doktoruna başvurun
              </Text>
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
          Snellen Görme Testi
        </Text>
        <View style={{ width: 40 }} />
      </Surface>

      <View style={styles.progressContainer}>
        <Text variant="bodyMedium" style={styles.eyeInstruction}>
          {getEyeInstructions()}
        </Text>
        <Text variant="bodySmall" style={styles.levelText}>
          Seviye: {currentLineData.level}
        </Text>
        <ProgressBar
          progress={(currentLine + 1) / SNELLEN_LINES.length}
          color="#6200ee"
          style={styles.progress}
        />
      </View>

      <View style={styles.testArea}>
        <Text variant="bodyLarge" style={styles.instruction}>
          Bu harfi seçin:
        </Text>

        <View style={styles.letterDisplay}>
          <Text style={[styles.letter, { fontSize: currentLineData.size }]}>
            {currentLetterToShow}
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <Text variant="titleMedium" style={styles.optionsTitle}>
            Cevabınızı Seçin:
          </Text>

          {LETTER_OPTIONS.map((letter) => (
            <TouchableOpacity
              key={letter}
              style={styles.radioOption}
              onPress={() => setSelectedAnswer(letter)}
              activeOpacity={0.7}
            >
              <RadioButton
                value={letter}
                status={selectedAnswer === letter ? 'checked' : 'unchecked'}
                onPress={() => setSelectedAnswer(letter)}
              />
              <Text style={styles.radioLabel}>{letter}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          mode="contained"
          onPress={handleAnswer}
          disabled={!selectedAnswer}
          style={styles.submitButton}
        >
          {currentLetter < currentLineData.letters.length - 1 ? 'Sonraki Harf' : 'Sonraki Seviye'}
        </Button>

        <Button mode="outlined" onPress={finishEyeTest} style={styles.skipButton}>
          Bu Gözü Bitir (Daha Küçük Harfleri Göremiyorum)
        </Button>
      </View>
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
  eyeInstruction: { textAlign: 'center', marginBottom: 8, fontWeight: 'bold', fontSize: 16 },
  levelText: { textAlign: 'center', color: '#666', marginBottom: 8 },
  progress: { height: 8, borderRadius: 4 },
  testArea: { flex: 1, padding: 20, justifyContent: 'center' },
  instruction: { textAlign: 'center', marginBottom: 20, color: '#666' },
  letterDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 12,
    marginBottom: 30,
    minHeight: 150,
  },
  letter: { fontWeight: 'bold', color: '#000' },
  optionsContainer: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 20 },
  optionsTitle: { marginBottom: 12 },
  radioOption: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  radioLabel: { fontSize: 18, marginLeft: 8 },
  submitButton: { marginBottom: 12 },
  skipButton: { borderColor: '#666' },
  content: { flex: 1 },
  resultCard: { margin: 16, padding: 20, borderRadius: 12, backgroundColor: '#fff' },
  resultTitle: { textAlign: 'center', marginBottom: 24, color: '#4CAF50' },
  scoreContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 },
  scoreItem: { alignItems: 'center' },
  scoreValue: { fontWeight: 'bold', color: '#6200ee', marginVertical: 8 },
  scoreQuality: { fontSize: 14, fontWeight: 'bold' },
  infoBox: { backgroundColor: '#E3F2FD', padding: 16, borderRadius: 8, marginBottom: 20 },
  infoTitle: { marginBottom: 8, color: '#1976D2' },
  infoText: { color: '#424242', marginBottom: 4 },
  doneButton: { marginTop: 8 },
});
