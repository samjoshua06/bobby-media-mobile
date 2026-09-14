import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ScrollView, Alert, ActivityIndicator, Image,
} from 'react-native';
import { router, Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../store/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      // Navigation handled by root layout via auth state change
    } catch (err: any) {
      Alert.alert(
        'Login Failed',
        err?.response?.data?.message || 'Invalid email or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#1A0F0A' }}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo & Brand */}
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <View style={{
            width: 80, height: 80, borderRadius: 24,
            backgroundColor: '#D4AF37',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
            shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4, shadowRadius: 16, elevation: 12,
          }}>
            <Text style={{ fontSize: 36 }}>📸</Text>
          </View>
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 }}>
            Bobby Media
          </Text>
          <Text style={{ fontSize: 14, color: '#D4AF37', marginTop: 4 }}>
            Studio Management Portal
          </Text>
        </View>

        {/* Card */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderRadius: 24,
          padding: 28,
          borderWidth: 1,
          borderColor: 'rgba(212,175,55,0.2)',
        }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 24 }}>
            Sign In
          </Text>

          {/* Email */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 6, fontWeight: '600' }}>
              EMAIL ADDRESS
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#4B5563"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: '#FFFFFF',
                fontSize: 15,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
              }}
            />
          </View>

          {/* Password */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 6, fontWeight: '600' }}>
              PASSWORD
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#4B5563"
              secureTextEntry
              autoComplete="password"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: '#FFFFFF',
                fontSize: 15,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
              }}
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={{
              backgroundColor: '#D4AF37',
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
              shadowColor: '#D4AF37',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
              opacity: loading ? 0.7 : 1,
            }}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#1A0F0A" />
            ) : (
              <Text style={{ color: '#1A0F0A', fontSize: 16, fontWeight: '800' }}>
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          {/* Forgot Password */}
          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity style={{ marginTop: 16, alignItems: 'center' }}>
              <Text style={{ color: '#D4AF37', fontSize: 14 }}>Forgot password?</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <Text style={{ color: '#4B5563', fontSize: 12, textAlign: 'center', marginTop: 32 }}>
          Bobby Media Studio Management v1.0
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
