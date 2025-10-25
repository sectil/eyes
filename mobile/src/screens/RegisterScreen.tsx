import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Text, TextInput, Button, Card, Banner, HelperText, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { trpc } from '@/services/trpc';
import { useAuthStore } from '@/store/authStore';
import type { RootStackParamList } from '@/navigation/AppNavigator';

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Register'
>;

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const login = useAuthStore((state) => state.login);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);

  const registerMutation = trpc.auth.register.useMutation();

  // Password validation
  const passwordRequirements = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Lütfen tüm alanları doldurun');
      setShowError(true);
      return;
    }

    if (!isPasswordValid) {
      setError('Şifre gereksinimleri karşılanmıyor');
      setShowError(true);
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      setShowError(true);
      return;
    }

    try {
      const result = await registerMutation.mutateAsync({
        name,
        email,
        password,
      });
      await login(result.user, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Kayıt başarısız oldu';
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
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="displaySmall" style={styles.title}>
          Hesap Oluştur
        </Text>
        <Text variant="titleMedium" style={styles.subtitle}>
          VisionCare'e hoş geldiniz
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
              label="Ad Soyad"
              value={name}
              onChangeText={setName}
              style={styles.input}
              left={<TextInput.Icon icon="account" />}
            />

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

            {password.length > 0 && (
              <View style={styles.passwordRequirements}>
                <Text variant="labelSmall" style={styles.requirementsTitle}>
                  Şifre gereksinimleri:
                </Text>
                <HelperText type={passwordRequirements.minLength ? 'info' : 'error'}>
                  {passwordRequirements.minLength ? '✓' : '✗'} En az 8 karakter
                </HelperText>
                <HelperText type={passwordRequirements.hasUpper ? 'info' : 'error'}>
                  {passwordRequirements.hasUpper ? '✓' : '✗'} En az 1 büyük harf
                </HelperText>
                <HelperText type={passwordRequirements.hasLower ? 'info' : 'error'}>
                  {passwordRequirements.hasLower ? '✓' : '✗'} En az 1 küçük harf
                </HelperText>
                <HelperText type={passwordRequirements.hasNumber ? 'info' : 'error'}>
                  {passwordRequirements.hasNumber ? '✓' : '✗'} En az 1 rakam
                </HelperText>
              </View>
            )}

            <TextInput
              label="Şifre Tekrar"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              style={styles.input}
              left={<TextInput.Icon icon="lock-check" />}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
            />

            {confirmPassword.length > 0 && password !== confirmPassword && (
              <HelperText type="error" visible={true}>
                Şifreler eşleşmiyor
              </HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={registerMutation.isLoading}
              disabled={!isPasswordValid || password !== confirmPassword || registerMutation.isLoading}
              style={styles.registerButton}
            >
              Kayıt Ol
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
              onPress={() => navigation.navigate('Login')}
              style={styles.button}
            >
              Hesabınız var mı? Giriş Yapın
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flexGrow: 1,
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
    marginBottom: 8,
  },
  passwordRequirements: {
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  requirementsTitle: {
    marginBottom: 4,
    fontWeight: 'bold',
  },
  registerButton: {
    marginTop: 16,
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
