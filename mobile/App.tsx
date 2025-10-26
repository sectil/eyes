import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Platform } from 'react-native';
import Constants from 'expo-constants';

export default function App() {
  const expoVersion = Constants.expoConfig?.sdkVersion || 'Unknown';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eyes - Vision Care</Text>
      <Text style={styles.subtitle}>Your personal vision health companion</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Expo SDK: {expoVersion}</Text>
        <Text style={styles.infoText}>Platform: {Platform.OS}</Text>
        <Text style={styles.successText}>✓ App is ready to use</Text>
      </View>

      <Text style={styles.description}>
        This app is configured with Expo SDK 54 and ready for{'\n'}
        vision care features, eye tracking, and exercises.
      </Text>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 30,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    width: '100%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '600',
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
});
