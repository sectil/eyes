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
            title="Snellen Test"
            subtitle="Test your visual acuity"
            left={(props) => <Avatar.Icon {...props} icon="format-letter-case" />}
          />
          <Card.Actions>
            <Button mode="contained" disabled>
              Coming Soon
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Title
            title="Color Test"
            subtitle="Check for color blindness"
            left={(props) => <Avatar.Icon {...props} icon="palette" />}
          />
          <Card.Actions>
            <Button mode="contained" disabled>
              Coming Soon
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Title
            title="Test History"
            subtitle="View your past tests"
            left={(props) => <Avatar.Icon {...props} icon="history" />}
          />
          <Card.Actions>
            <Button mode="contained" disabled>
              Coming Soon
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
