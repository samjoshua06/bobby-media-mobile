import { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth';
import { usersApi } from '../../api';

export default function CustomerProfile() {
  const { user, logout, setUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const [changingPw, setChangingPw] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('phone', phone);
      const { data } = await usersApi.updateProfile(formData);
      setUser(data.data);
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) return Alert.alert('Error', 'Fill all password fields.');
    if (newPw !== confirmPw) return Alert.alert('Error', 'New passwords do not match.');
    if (newPw.length < 8) return Alert.alert('Error', 'Password must be at least 8 characters.');
    setSavingPw(true);
    try {
      await usersApi.changePassword({ current_password: currentPw, new_password: newPw });
      Alert.alert('Success', 'Password changed!');
      setChangingPw(false);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPw(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  const Field = ({ label, value, onChange, editable = true, keyboardType = 'default' as any }) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '600', marginBottom: 6 }}>{label}</Text>
      {editing && editable ? (
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType}
          style={{
            backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 16,
            paddingVertical: 13, fontSize: 15, color: '#1A0F0A',
          }}
        />
      ) : (
        <Text style={{ fontSize: 15, fontWeight: '600', color: '#1A0F0A', paddingVertical: 4 }}>{value || '—'}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F5F0' }}>
      <ScrollView>
        {/* Header */}
        <View style={{
          backgroundColor: '#1A0F0A', paddingHorizontal: 20,
          paddingTop: 16, paddingBottom: 32, alignItems: 'center',
        }}>
          <View style={{
            width: 80, height: 80, borderRadius: 40, backgroundColor: '#D4AF37',
            alignItems: 'center', justifyContent: 'center', marginBottom: 12,
          }}>
            <Text style={{ fontSize: 30, fontWeight: '900', color: '#1A0F0A' }}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </Text>
          </View>
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '800' }}>{user?.first_name} {user?.last_name}</Text>
          <Text style={{ color: '#9CA3AF', fontSize: 13, marginTop: 4 }}>{user?.email}</Text>
          <View style={{
            backgroundColor: 'rgba(212,175,55,0.2)', paddingHorizontal: 16, paddingVertical: 6,
            borderRadius: 20, marginTop: 8,
          }}>
            <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: '700' }}>
              Referral: {user?.referral_code}
            </Text>
          </View>
        </View>

        <View style={{ padding: 20, gap: 16 }}>
          {/* Profile Card */}
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1A0F0A' }}>Personal Info</Text>
              <TouchableOpacity onPress={() => editing ? saveProfile() : setEditing(true)} disabled={saving}>
                {saving ? <ActivityIndicator color="#D4AF37" /> : (
                  <Text style={{ color: '#D4AF37', fontWeight: '700' }}>{editing ? 'Save' : 'Edit'}</Text>
                )}
              </TouchableOpacity>
            </View>
            <Field label="FIRST NAME" value={firstName} onChange={setFirstName} />
            <Field label="LAST NAME" value={lastName} onChange={setLastName} />
            <Field label="EMAIL" value={user?.email || ''} onChange={() => {}} editable={false} />
            <Field label="PHONE" value={phone} onChange={setPhone} keyboardType="phone-pad" />
            {editing && (
              <TouchableOpacity onPress={() => { setEditing(false); setFirstName(user?.first_name || ''); setLastName(user?.last_name || ''); setPhone(user?.phone || ''); }}>
                <Text style={{ color: '#6B7280', textAlign: 'center' }}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Change Password */}
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20 }}>
            <TouchableOpacity
              onPress={() => setChangingPw(!changingPw)}
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1A0F0A' }}>Change Password</Text>
              <Ionicons name={changingPw ? 'chevron-up' : 'chevron-down'} size={20} color="#9CA3AF" />
            </TouchableOpacity>
            {changingPw && (
              <View style={{ marginTop: 20, gap: 14 }}>
                {[
                  { label: 'CURRENT PASSWORD', value: currentPw, set: setCurrentPw },
                  { label: 'NEW PASSWORD', value: newPw, set: setNewPw },
                  { label: 'CONFIRM NEW PASSWORD', value: confirmPw, set: setConfirmPw },
                ].map(({ label, value, set }) => (
                  <View key={label}>
                    <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '600', marginBottom: 6 }}>{label}</Text>
                    <TextInput
                      value={value} onChangeText={set} secureTextEntry
                      style={{
                        backgroundColor: '#F3F4F6', borderRadius: 12,
                        paddingHorizontal: 16, paddingVertical: 13, fontSize: 15,
                      }}
                    />
                  </View>
                ))}
                <TouchableOpacity
                  onPress={changePassword} disabled={savingPw}
                  style={{
                    backgroundColor: '#1A0F0A', borderRadius: 12, paddingVertical: 14,
                    alignItems: 'center', opacity: savingPw ? 0.7 : 1,
                  }}
                >
                  {savingPw ? <ActivityIndicator color="#D4AF37" /> :
                    <Text style={{ color: '#D4AF37', fontWeight: '700' }}>Update Password</Text>}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Sign Out */}
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: '#FEE2E2', borderRadius: 16, paddingVertical: 16,
              alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={{ color: '#EF4444', fontWeight: '700', fontSize: 15 }}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
