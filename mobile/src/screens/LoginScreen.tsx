import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, Button, Card, Banner, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { trpc } from '@/services/trpc';
import { useAuthStore } from '@/store/authStore';
import type { RootStackParamList } from '@/navigation/AppNavigator';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);

  const loginMutation = trpc.auth.login.useMutation();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Lütfen e-posta ve şifrenizi girin');
      setShowError(true);
      return;
    }

    try {
      const result = await loginMutation.mutateAsync({ email, password });
      await login(result.user, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Giriş başarısız oldu';
      setError(errorMessage);
      setShowError(true);
    }
  };

  const handleGoogleSignIn = () => {
    Alert.alert('Google Sign-In', 'Google ile giriş yakında eklenecek!');
  };

  const handleAppleSignIn = () => {
    Alert.alert('Apple Sign-In', 'Apple ile giriş yakında eklenecek!');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text variant="displaySmall" style={styles.title}>
          VisionCare
        </Text>
        <Text variant="titleMedium" style={styles.subtitle}>
          Göz Sağlığı Asistanınız
        </Text>

        {showError && (
          <Banner
            visible={showError}
            actions={[
              {
                label: 'Kapat',
                onPress: () => setShowError(false),
              },
            ]}
            icon="alert-circle"
            style={styles.errorBanner}
          >
            {error}
          </Banner>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="E-posta"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
            />

            <TextInput
              label="Şifre"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loginMutation.isLoading}
              disabled={loginMutation.isLoading}
              style={styles.loginButton}
            >
              Giriş Yap
            </Button>

            <Divider style={styles.divider} />

            <Button
              mode="outlined"
              onPress={handleGoogleSignIn}
              icon="google"
              style={styles.socialButton}
            >
              Google ile Devam Et
            </Button>

            <Button
              mode="outlined"
              onPress={handleAppleSignIn}
              icon="apple"
              style={styles.socialButton}
            >
              Apple ile Devam Et
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              style={styles.button}
            >
              Hesabınız yok mu? Kayıt Olun
            </Button>
          </Card.Content>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  errorBanner: {
    marginBottom: 16,
    backgroundColor: '#ffebee',
  },
  card: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
  },
  divider: {
    marginVertical: 16,
  },
  socialButton: {
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
  },
});
