import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Linking } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth';
import { bookingsApi, rewardsApi } from '../../api';
import { formatCurrency, formatDate, getStatusColor } from '../../utils';

export default function CustomerDashboard() {
  const { user, logout } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [bRes, rRes] = await Promise.all([
        bookingsApi.list({ limit: 5 }),
        rewardsApi.get(),
      ]);
      setBookings(bRes.data.data || []);
      setRewards(rRes.data.data);
    } catch (e) {
      console.error('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const quickLinks = [
    { icon: 'calendar-outline', label: 'Bookings', color: '#3B82F6', value: String(bookings.length), route: '/(customer)/bookings' },
    { icon: 'star-outline', label: 'Reward Points', color: '#D4AF37', value: String(rewards?.balance || 0), route: '/(customer)/rewards' },
    { icon: 'images-outline', label: 'Gallery', color: '#10B981', value: '→', route: '/(customer)/gallery' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F5F0' }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />}
      >
        {/* Hero Banner */}
        <View style={{
          backgroundColor: '#1A0F0A',
          paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Welcome back,</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginTop: 2 }}>
                {user?.first_name} {user?.last_name} 👋
              </Text>
              <Text style={{ color: '#D4AF37', fontSize: 12, marginTop: 4 }}>
                Code: {user?.referral_code}
              </Text>
            </View>
            <TouchableOpacity
              onPress={async () => { await logout(); router.replace('/(auth)/login'); }}
              style={{ padding: 8 }}
            >
              <Ionicons name="log-out-outline" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: -16 }}>
          {/* Quick Links Row */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
            {quickLinks.map((link) => (
              <TouchableOpacity
                key={link.route}
                onPress={() => router.push(link.route as any)}
                style={{
                  flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16,
                  padding: 14, alignItems: 'center',
                  shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
                }}
              >
                <View style={{
                  width: 40, height: 40, borderRadius: 12,
                  backgroundColor: `${link.color}20`,
                  alignItems: 'center', justifyContent: 'center', marginBottom: 8,
                }}>
                  <Ionicons name={link.icon as any} size={20} color={link.color} />
                </View>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A0F0A' }}>{link.value}</Text>
                <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 2, textAlign: 'center' }}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Rewards Card */}
          {rewards && (
            <View style={{
              backgroundColor: '#1A0F0A', borderRadius: 20, padding: 20, marginBottom: 24,
              shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
            }}>
              <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
                ⭐ REWARD POINTS
              </Text>
              <Text style={{ color: '#FFFFFF', fontSize: 40, fontWeight: '800' }}>
                {rewards.balance || 0}
              </Text>
              <View style={{ flexDirection: 'row', gap: 24, marginTop: 12 }}>
                <View>
                  <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Earned</Text>
                  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{rewards.total_earned || 0}</Text>
                </View>
                <View>
                  <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Redeemed</Text>
                  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{rewards.total_redeemed || 0}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Recent Bookings */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: '#1A0F0A' }}>Recent Bookings</Text>
              <TouchableOpacity onPress={() => router.push('/(customer)/bookings')}>
                <Text style={{ color: '#D4AF37', fontSize: 13 }}>View All →</Text>
              </TouchableOpacity>
            </View>
            {loading ? (
              [1, 2, 3].map(i => (
                <View key={i} style={{
                  height: 72, backgroundColor: '#E5E7EB', borderRadius: 16, marginBottom: 10,
                }} />
              ))
            ) : bookings.length === 0 ? (
              <View style={{
                backgroundColor: '#FFFFFF', borderRadius: 16, padding: 32,
                alignItems: 'center',
              }}>
                <Text style={{ fontSize: 36, marginBottom: 8 }}>📅</Text>
                <Text style={{ color: '#6B7280', fontSize: 14 }}>No bookings yet</Text>
              </View>
            ) : bookings.map((b) => (
              <TouchableOpacity
                key={b.id}
                onPress={() => router.push(`/(customer)/bookings/${b.id}` as any)}
                style={{
                  backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
                  marginBottom: 10, flexDirection: 'row', alignItems: 'center',
                  shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
                }}
              >
                <View style={{
                  width: 44, height: 44, borderRadius: 12,
                  backgroundColor: '#1A0F0A', alignItems: 'center', justifyContent: 'center',
                  marginRight: 14,
                }}>
                  <Ionicons name="camera" size={20} color="#D4AF37" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#1A0F0A' }}>{b.booking_number}</Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                    {b.package_name} · {formatDate(b.event_date)}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={{
                    backgroundColor: `${getStatusColor(b.status)}20`,
                    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
                  }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: getStatusColor(b.status), textTransform: 'capitalize' }}>
                      {b.status}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#1A0F0A', marginTop: 4 }}>
                    {formatCurrency(b.total_amount)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
