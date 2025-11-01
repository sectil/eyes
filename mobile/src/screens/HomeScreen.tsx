import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store/authStore';
import type { RootStackParamList } from '@/navigation/AppNavigator';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuthStore();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.welcome}>
          Welcome, {user?.name}!
        </Text>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Profile')}
          style={styles.profileButton}
        >
          View Profile
        </Button>
      </View>

      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Title
            title="🎯 Kalibrasyon"
            subtitle="9 noktalı göz kalibrasyonu"
            left={(props) => <Avatar.Icon {...props} icon="target" />}
          />
          <Card.Actions>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Calibration' as any)}
            >
              Kalibrasyon Yap
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Title
            title="👁️ Göz Takibi"
            subtitle="AI ile gerçek zamanlı göz analizi"
            left={(props) => <Avatar.Icon {...props} icon="eye" />}
          />
          <Card.Actions>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('EyeTracking')}
              style={{ backgroundColor: '#4ecdc4' }}
            >
              Göz Takibi Başlat
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Title
            title="💪 Göz Egzersizleri"
            subtitle="10 farklı göz egzersizi ile gözlerinizi güçlendirin"
            left={(props) => <Avatar.Icon {...props} icon="dumbbell" />}
          />
          <Card.Actions>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('EyeExercises')}
              style={{ backgroundColor: '#ff9800' }}
            >
              Egzersizlere Başla
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Title
            title="📊 İstatistikler & İlerleme"
            subtitle="Göz sağlığı ilerlemenizi takip edin"
            left={(props) => <Avatar.Icon {...props} icon="chart-line" />}
          />
          <Card.Actions>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Progress')}
              style={{ backgroundColor: '#9c27b0' }}
            >
              İstatistikleri Gör
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Title
            title="👁️ Snellen Görme Testi"
            subtitle="Görme keskinliğinizi ölçün"
            left={(props) => <Avatar.Icon {...props} icon="format-letter-case" />}
          />
          <Card.Actions>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('SnellenTest')}
              style={{ backgroundColor: '#2196F3' }}
            >
              Teste Başla
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Title
            title="🎨 Renk Körlüğü Testi"
            subtitle="Renk görme yeteneğinizi test edin"
            left={(props) => <Avatar.Icon {...props} icon="palette" />}
          />
          <Card.Actions>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('ColorBlindnessTest')}
              style={{ backgroundColor: '#e91e63' }}
            >
              Teste Başla
            </Button>
          </Card.Actions>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#6200ee',
  },
  welcome: {
    color: 'white',
    marginBottom: 16,
  },
  profileButton: {
    borderColor: 'white',
  },
  content: {
    padding: 20,
  },
  card: {
    marginBottom: 16,
  },
});
