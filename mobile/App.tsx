import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AnimatedEye from './src/components/AnimatedEye';

type Screen = 'Welcome' | 'LoginOptions' | 'EmailLogin' | 'SignUp' | 'Home';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('Welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Welcome Screen
  if (currentScreen === 'Welcome') {
    return (
      <View style={styles.welcomeContainer}>
        <StatusBar style="light" />

        {/* Gradient Background */}
        <View style={styles.gradientBackground}>
          {/* Top Section - Eye Icon & Title */}
          <View style={styles.welcomeTop}>
            <View style={styles.welcomeEyeIcon}>
              <Text style={styles.eyeEmoji}>👁</Text>
            </View>

            <Text style={styles.welcomeTitle}>Eyes</Text>
            <Text style={styles.welcomeSubtitle}>Göz Sağlığı Asistanınız</Text>
          </View>

          {/* Middle Section - Value Props */}
          <View style={styles.welcomeMiddle}>
            <View style={styles.featureRow}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Yapay Zeka Destekli Testler</Text>
            </View>
            <View style={styles.featureRow}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>Kişiselleştirilmiş Egzersizler</Text>
            </View>
            <View style={styles.featureRow}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>7/24 Göz Sağlığı Takibi</Text>
            </View>
          </View>

          {/* Bottom Section - CTA */}
          <View style={styles.welcomeBottom}>
            <TouchableOpacity
              style={styles.welcomePrimaryButton}
              onPress={() => setCurrentScreen('LoginOptions')}
              activeOpacity={0.9}
            >
              <Text style={styles.welcomePrimaryButtonText}>Hemen Başla</Text>
              <Text style={styles.welcomeButtonArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.welcomeSecondaryButton}
              onPress={() => setCurrentScreen('EmailLogin')}
            >
              <Text style={styles.welcomeSecondaryButtonText}>Hesabım Var</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Login Options Screen
  if (currentScreen === 'LoginOptions') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setCurrentScreen('Welcome')}>
            <Text style={styles.backButton}>← Geri</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <AnimatedEye size="small" />

            <Text style={styles.title}>Giriş Yap</Text>
            <Text style={styles.smallDescription}>Devam etmek için giriş yöntemi seçin</Text>

            <TouchableOpacity style={styles.oauthButton}>
              <Text style={styles.oauthButtonText}>🍎 Apple ile Giriş Yap</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.oauthButton}>
              <Text style={styles.oauthButtonText}>🔵 Google ile Giriş Yap</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.oauthButton}
              onPress={() => setCurrentScreen('EmailLogin')}
            >
              <Text style={styles.oauthButtonText}>✉️ Email ile Giriş Yap</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setCurrentScreen('SignUp')}>
              <Text style={styles.linkText}>Hesabınız yok mu? <Text style={styles.linkBold}>Kaydol</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Email Login Screen
  if (currentScreen === 'EmailLogin') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setCurrentScreen('LoginOptions')}>
            <Text style={styles.backButton}>← Geri</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.content}>
              <AnimatedEye size="small" />

              <Text style={styles.title}>Email ile Giriş Yap</Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Adresiniz</Text>
                <TextInput
                  style={styles.input}
                  placeholder="example@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Şifre</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setCurrentScreen('Home')}
              >
                <Text style={styles.primaryButtonText}>Giriş Yap</Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Text style={styles.linkText}>Şifrenizi mi unuttunuz?</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Sign Up Screen
  if (currentScreen === 'SignUp') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setCurrentScreen('LoginOptions')}>
            <Text style={styles.backButton}>← Geri</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.content}>
              <AnimatedEye size="small" />

              <Text style={styles.title}>Yeni Hesap Oluştur</Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Ad Soyadı</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Adresiniz</Text>
                <TextInput
                  style={styles.input}
                  placeholder="john@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Şifre</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Güçlü bir şifre girin"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setAcceptTerms(!acceptTerms)}
              >
                <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                  {acceptTerms && <Text style={styles.checkboxCheck}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Şartları Kabul Ediyorum</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setCurrentScreen('Home')}
              >
                <Text style={styles.primaryButtonText}>Hesap Oluştur</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setCurrentScreen('EmailLogin')}>
                <Text style={styles.linkText}>Zaten hesabınız var mı? <Text style={styles.linkBold}>Giriş Yap</Text></Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Home Screen
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.homeHeader}>
        <TouchableOpacity onPress={() => setCurrentScreen('Welcome')}>
          <Text style={styles.backButton}>← Çıkış</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ana Sayfa</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Hoş Geldiniz!</Text>
        <Text style={styles.text}>Eyes - Vision Care uygulamasına hoş geldiniz.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  // Welcome Screen Styles
  welcomeContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  gradientBackground: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  welcomeTop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeEyeIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(8, 145, 178, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: 'rgba(8, 145, 178, 0.2)',
  },
  eyeEmoji: {
    fontSize: 64,
  },
  welcomeTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
  },
  welcomeMiddle: {
    flex: 0.8,
    justifyContent: 'center',
    paddingVertical: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#06B6D4',
    marginRight: 16,
  },
  featureText: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  welcomeBottom: {
    paddingTop: 20,
  },
  welcomePrimaryButton: {
    backgroundColor: '#0891B2',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    flexDirection: 'row',
  },
  welcomePrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  welcomeButtonArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  welcomeSecondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  welcomeSecondaryButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  // Other Screens Styles
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    fontSize: 16,
    color: '#0891B2',
    fontWeight: '600',
  },
  homeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#3498db',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  eyeContainer: {
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  smallDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#0891B2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  oauthButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  oauthButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  linkBold: {
    color: '#0891B2',
    fontWeight: '600',
  },
  formGroup: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0891B2',
    borderColor: '#0891B2',
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#1F2937',
  },
  text: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

