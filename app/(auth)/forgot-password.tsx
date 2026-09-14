import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { authApi } from '../../api';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) return Alert.alert('Error', 'Please enter your email address.');
    setLoading(true);
    try {
      await authApi.forgotPassword({ email: email.trim().toLowerCase() });
      setSent(true);
    } catch {
      Alert.alert('Error', 'Failed to send reset email. Please check your email address.');
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
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 28 }}>
        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 32 }}>
          <Text style={{ color: '#D4AF37', fontSize: 16 }}>← Back to Login</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 }}>
          Forgot Password
        </Text>
        <Text style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 32 }}>
          Enter your email and we'll send you a reset link.
        </Text>

        {sent ? (
          <View style={{
            backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: 16,
            padding: 24, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
          }}>
            <Text style={{ fontSize: 32, textAlign: 'center', marginBottom: 12 }}>✅</Text>
            <Text style={{ color: '#10B981', fontSize: 16, fontWeight: '700', textAlign: 'center' }}>
              Reset Link Sent!
            </Text>
            <Text style={{ color: '#6B7280', fontSize: 13, textAlign: 'center', marginTop: 8 }}>
              Check your email inbox for the password reset link.
            </Text>
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/login')}
              style={{
                backgroundColor: '#D4AF37', borderRadius: 12, paddingVertical: 14,
                alignItems: 'center', marginTop: 20,
              }}
            >
              <Text style={{ color: '#1A0F0A', fontWeight: '800' }}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
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
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
                color: '#FFFFFF', fontSize: 15, borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)', marginBottom: 20,
              }}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={loading}
              style={{
                backgroundColor: '#D4AF37', borderRadius: 14, paddingVertical: 16,
                alignItems: 'center', opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? <ActivityIndicator color="#1A0F0A" /> :
                <Text style={{ color: '#1A0F0A', fontSize: 16, fontWeight: '800' }}>Send Reset Link</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
