import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, Dimensions } from 'react-native';
import { Text, Surface, IconButton, Card, ProgressBar, SegmentedButtons } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { trpc } from '@/utils/trpc';

const { width } = Dimensions.get('window');

type TimePeriod = 'today' | 'week' | 'month';

export default function ProgressScreen() {
  const navigation = useNavigation();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');

  // Fetch dashboard data
  const { data: dashboard, isLoading: dashboardLoading } = trpc.progress.getDashboard.useQuery();

  // Fetch usage trends
  const { data: trends } = trpc.progress.getUsageTrends.useQuery({
    days: timePeriod === 'month' ? 30 : 7,
  });

  // Fetch exercise stats
  const { data: exerciseStats } = trpc.progress.getExerciseStatsByType.useQuery({
    days: timePeriod === 'month' ? 30 : 7,
  });

  // Check daily limits
  const { data: limits } = trpc.progress.checkDailyLimit.useQuery({
    maxExerciseTime: 1200, // 20 minutes
    maxTestTime: 600, // 10 minutes
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}d ${secs}s`;
  };

  const formatTimeMinutes = (seconds: number) => {
    return `${Math.floor(seconds / 60)} dakika`;
  };

  if (dashboardLoading) {
    return (
      <View style={styles.container}>
        <Surface style={styles.header} elevation={2}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} iconColor="#fff" />
          <Text variant="headlineSmall" style={styles.title}>
            İlerleme & İstatistikler
          </Text>
          <View style={{ width: 40 }} />
        </Surface>
        <View style={styles.loadingContainer}>
          <Text variant="bodyLarge">Yükleniyor...</Text>
        </View>
      </View>
    );
  }

  const todayData = dashboard?.today;
  const weeklyData = dashboard?.weekly;
  const monthlyData = dashboard?.monthly;
  const recentExercises = dashboard?.recentExercises || [];
  const recentTests = dashboard?.recentTests || [];

  // Calculate streaks
  const activeDays = timePeriod === 'month' ? monthlyData?.summary.activeDays || 0 : weeklyData?.summary.activeDays || 0;

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} iconColor="#fff" />
        <Text variant="headlineSmall" style={styles.title}>
          İlerleme & İstatistikler
        </Text>
        <IconButton icon="refresh" onPress={() => {}} iconColor="#fff" />
      </Surface>

      <ScrollView style={styles.content}>
        {/* Daily Limit Warnings */}
        {limits && (limits.exerciseLimitReached || limits.testLimitReached) && (
          <Card style={styles.warningCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.warningTitle}>
                ⚠️ Günlük Limit Uyarısı
              </Text>
              {limits.exerciseLimitReached && (
                <Text variant="bodyMedium" style={styles.warningText}>
                  Bugünkü egzersiz limitine ulaştınız. Gözlerinizi dinlendirin.
                </Text>
              )}
              {limits.testLimitReached && (
                <Text variant="bodyMedium" style={styles.warningText}>
                  Bugünkü test limitine ulaştınız. Yarın tekrar deneyin.
                </Text>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Time Period Selector */}
        <View style={styles.periodSelector}>
          <SegmentedButtons
            value={timePeriod}
            onValueChange={(value) => setTimePeriod(value as TimePeriod)}
            buttons={[
              { value: 'today', label: 'Bugün' },
              { value: 'week', label: 'Hafta' },
              { value: 'month', label: 'Ay' },
            ]}
          />
        </View>

        {/* Today's Summary */}
        {timePeriod === 'today' && (
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>
                Bugünkü Aktivite
              </Text>

              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text variant="displaySmall" style={styles.statValue}>
                    {todayData?.exerciseCount || 0}
                  </Text>
                  <Text variant="bodyMedium" style={styles.statLabel}>
                    Egzersiz
                  </Text>
                </View>

                <View style={styles.statBox}>
                  <Text variant="displaySmall" style={styles.statValue}>
                    {todayData?.testCount || 0}
                  </Text>
                  <Text variant="bodyMedium" style={styles.statLabel}>
                    Test
                  </Text>
                </View>

                <View style={styles.statBox}>
                  <Text variant="displaySmall" style={styles.statValue}>
                    {todayData?.totalBlinkCount || 0}
                  </Text>
                  <Text variant="bodyMedium" style={styles.statLabel}>
                    Göz Kırpma
                  </Text>
                </View>
              </View>

              <View style={styles.timeStats}>
                <View style={styles.timeStat}>
                  <Text variant="labelMedium">Egzersiz Süresi</Text>
                  <ProgressBar
                    progress={Math.min((todayData?.totalExerciseTime || 0) / 1200, 1)}
                    color="#4CAF50"
                    style={styles.progressBar}
                  />
                  <Text variant="bodySmall" style={styles.timeText}>
                    {formatTimeMinutes(todayData?.totalExerciseTime || 0)} / 20 dakika
                  </Text>
                </View>

                <View style={styles.timeStat}>
                  <Text variant="labelMedium">Test Süresi</Text>
                  <ProgressBar
                    progress={Math.min((todayData?.totalTestTime || 0) / 600, 1)}
                    color="#2196F3"
                    style={styles.progressBar}
                  />
                  <Text variant="bodySmall" style={styles.timeText}>
                    {formatTimeMinutes(todayData?.totalTestTime || 0)} / 10 dakika
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Weekly/Monthly Summary */}
        {timePeriod !== 'today' && (
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>
                {timePeriod === 'week' ? 'Haftalık' : 'Aylık'} Özet
              </Text>

              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text variant="displaySmall" style={styles.statValue}>
                    {activeDays}
                  </Text>
                  <Text variant="bodyMedium" style={styles.statLabel}>
                    Aktif Gün
                  </Text>
                </View>

                <View style={styles.statBox}>
                  <Text variant="displaySmall" style={styles.statValue}>
                    {timePeriod === 'week'
                      ? weeklyData?.summary.totalExerciseCount || 0
                      : '—'}
                  </Text>
                  <Text variant="bodyMedium" style={styles.statLabel}>
                    Egzersiz
                  </Text>
                </View>

                <View style={styles.statBox}>
                  <Text variant="displaySmall" style={styles.statValue}>
                    {timePeriod === 'week'
                      ? weeklyData?.summary.totalBlinkCount || 0
                      : '—'}
                  </Text>
                  <Text variant="bodyMedium" style={styles.statLabel}>
                    Kırpma
                  </Text>
                </View>
              </View>

              <View style={styles.timeStats}>
                <View style={styles.timeStat}>
                  <Text variant="labelMedium">Toplam Egzersiz</Text>
                  <Text variant="headlineSmall" style={styles.totalTime}>
                    {formatTimeMinutes(
                      timePeriod === 'week'
                        ? weeklyData?.summary.totalExerciseTime || 0
                        : monthlyData?.summary.totalExerciseTime || 0
                    )}
                  </Text>
                </View>

                <View style={styles.timeStat}>
                  <Text variant="labelMedium">Toplam Test</Text>
                  <Text variant="headlineSmall" style={styles.totalTime}>
                    {formatTimeMinutes(
                      timePeriod === 'week'
                        ? weeklyData?.summary.totalTestTime || 0
                        : monthlyData?.summary.totalTestTime || 0
                    )}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Exercise Stats by Type */}
        {exerciseStats && Object.keys(exerciseStats).length > 0 && (
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>
                Egzersiz Türleri
              </Text>

              {Object.entries(exerciseStats).map(([type, stats]) => (
                <View key={type} style={styles.exerciseTypeRow}>
                  <View style={styles.exerciseTypeInfo}>
                    <Text variant="titleMedium" style={styles.exerciseTypeName}>
                      {getExerciseTypeName(type)}
                    </Text>
                    <Text variant="bodySmall" style={styles.exerciseTypeStats}>
                      {stats.count} kez • {formatTimeMinutes(stats.totalDuration)} • {stats.totalBlinks} kırpma
                    </Text>
                  </View>
                  <View style={styles.completionRate}>
                    <Text variant="bodySmall" style={styles.completionText}>
                      %{stats.completionRate.toFixed(0)}
                    </Text>
                    <Text variant="labelSmall" style={styles.completionLabel}>
                      tamamlanma
                    </Text>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Simple Trend Chart */}
        {trends && trends.length > 0 && (
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>
                Aktivite Trendi
              </Text>

              <View style={styles.chartContainer}>
                {trends.slice(-7).map((day, index) => {
                  const maxValue = Math.max(
                    ...trends.map((d) => d.totalExerciseTime + d.totalTestTime)
                  );
                  const value = day.totalExerciseTime + day.totalTestTime;
                  const height = maxValue > 0 ? (value / maxValue) * 100 : 0;

                  return (
                    <View key={index} style={styles.chartBar}>
                      <View style={styles.barContainer}>
                        <View style={[styles.bar, { height: `${height}%` }]} />
                      </View>
                      <Text variant="labelSmall" style={styles.barLabel}>
                        {new Date(day.date).getDate()}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#6200ee' }]} />
                  <Text variant="bodySmall">Toplam Aktivite (dk)</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Recent Exercises */}
        {recentExercises.length > 0 && (
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>
                Son Egzersizler
              </Text>

              {recentExercises.slice(0, 5).map((exercise, index) => (
                <View key={exercise.id} style={styles.activityRow}>
                  <View style={styles.activityIcon}>
                    <Text style={styles.activityEmoji}>💪</Text>
                  </View>
                  <View style={styles.activityInfo}>
                    <Text variant="titleSmall">{getExerciseTypeName(exercise.exerciseType)}</Text>
                    <Text variant="bodySmall" style={styles.activityTime}>
                      {new Date(exercise.timestamp).toLocaleDateString('tr-TR')} •{' '}
                      {formatTimeMinutes(exercise.duration || 0)}
                    </Text>
                  </View>
                  <View style={styles.activityBadge}>
                    {exercise.completed ? (
                      <Text style={styles.completedBadge}>✓</Text>
                    ) : (
                      <Text style={styles.incompleteBadge}>—</Text>
                    )}
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Recent Tests */}
        {recentTests.length > 0 && (
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>
                Son Testler
              </Text>

              {recentTests.slice(0, 5).map((test, index) => (
                <View key={test.id} style={styles.activityRow}>
                  <View style={styles.activityIcon}>
                    <Text style={styles.activityEmoji}>📊</Text>
                  </View>
                  <View style={styles.activityInfo}>
                    <Text variant="titleSmall">{getTestTypeName(test.testType)}</Text>
                    <Text variant="bodySmall" style={styles.activityTime}>
                      {new Date(test.timestamp).toLocaleDateString('tr-TR')}
                    </Text>
                    {test.rightEyeScore && (
                      <Text variant="bodySmall" style={styles.testScore}>
                        Sağ: {test.rightEyeScore} • Sol: {test.leftEyeScore}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Tips */}
        <Card style={styles.tipsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.tipsTitle}>
              💡 İpuçları
            </Text>
            <Text variant="bodySmall" style={styles.tipText}>
              • Günde en az 3 egzersiz yapın
            </Text>
            <Text variant="bodySmall" style={styles.tipText}>
              • Ayda bir kez görme testlerini tekrarlayın
            </Text>
            <Text variant="bodySmall" style={styles.tipText}>
              • Ekran başında her 20 dakikada bir 20 saniye mola verin
            </Text>
            <Text variant="bodySmall" style={styles.tipText}>
              • Düzenli olarak göz doktoruna görünün
            </Text>
          </Card.Content>
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function getExerciseTypeName(type: string): string {
  const names: Record<string, string> = {
    blink: 'Göz Kırpma',
    close: 'Göz Kapama',
    rectangle: 'Dikdörtgen Takibi',
    star: 'Yıldız Takibi',
    horizontal: 'Yatay Hareket',
    vertical: 'Dikey Hareket',
    diagonal: 'Çapraz Hareket',
    circle: 'Daire Takibi',
    focus: 'Odaklanma',
    rest: 'Dinlenme',
  };
  return names[type] || type;
}

function getTestTypeName(type: string): string {
  const names: Record<string, string> = {
    snellen: 'Snellen Görme Testi',
    color: 'Renk Körlüğü Testi',
    contrast: 'Kontrast Testi',
    astigmatism: 'Astigmatizm Testi',
    convergence: 'Yakınsama Testi',
    symptom: 'Semptom Değerlendirmesi',
  };
  return names[type] || type;
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
  title: { color: '#fff', fontWeight: 'bold', flex: 1, textAlign: 'center' },
  content: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  warningCard: { margin: 16, marginBottom: 8, backgroundColor: '#FFF3E0' },
  warningTitle: { color: '#E65100', marginBottom: 8 },
  warningText: { color: '#BF360C', marginBottom: 4 },
  periodSelector: { paddingHorizontal: 16, marginTop: 8, marginBottom: 16 },
  summaryCard: { margin: 16, marginTop: 8, marginBottom: 8 },
  cardTitle: { marginBottom: 16, color: '#6200ee', fontWeight: 'bold' },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statBox: { alignItems: 'center' },
  statValue: { fontWeight: 'bold', color: '#6200ee' },
  statLabel: { color: '#666', marginTop: 4 },
  timeStats: { marginTop: 8 },
  timeStat: { marginBottom: 16 },
  progressBar: { height: 8, borderRadius: 4, marginTop: 8 },
  timeText: { color: '#666', marginTop: 4 },
  totalTime: { color: '#6200ee', fontWeight: 'bold', marginTop: 4 },
  exerciseTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  exerciseTypeInfo: { flex: 1 },
  exerciseTypeName: { fontWeight: 'bold' },
  exerciseTypeStats: { color: '#666', marginTop: 4 },
  completionRate: { alignItems: 'center', marginLeft: 16 },
  completionText: { fontWeight: 'bold', color: '#4CAF50' },
  completionLabel: { color: '#666' },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
    marginTop: 16,
  },
  chartBar: { flex: 1, alignItems: 'center', marginHorizontal: 2 },
  barContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    width: '80%',
    backgroundColor: '#6200ee',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 2,
  },
  barLabel: { marginTop: 4, color: '#666' },
  chartLegend: { marginTop: 16, flexDirection: 'row', justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 4 },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityEmoji: { fontSize: 20 },
  activityInfo: { flex: 1 },
  activityTime: { color: '#666', marginTop: 2 },
  testScore: { color: '#6200ee', marginTop: 2, fontSize: 12 },
  activityBadge: { marginLeft: 8 },
  completedBadge: { color: '#4CAF50', fontSize: 20 },
  incompleteBadge: { color: '#999', fontSize: 20 },
  tipsCard: { margin: 16, marginTop: 8, backgroundColor: '#E8F5E9' },
  tipsTitle: { color: '#2E7D32', marginBottom: 12 },
  tipText: { color: '#1B5E20', marginBottom: 6 },
});
