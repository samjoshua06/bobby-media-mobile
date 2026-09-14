import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { bookingsApi } from '../../api';
import { formatCurrency, formatDate, getStatusColor, getStatusBg } from '../../utils';

const STATUSES = ['', 'pending', 'confirmed', 'assigned', 'in_progress', 'completed', 'delivered', 'cancelled'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await bookingsApi.list({ limit: 50, status });
      setBookings(data.data || []);
    } catch { } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchBookings(); }, [status]);

  const updateStatus = (id: number, currentStatus: string) => {
    const nextStatuses = STATUSES.filter(s => s && s !== currentStatus);
    Alert.alert(
      'Update Booking Status',
      `Current: ${currentStatus}`,
      [
        { text: 'Cancel', style: 'cancel' },
        ...nextStatuses.map(s => ({
          text: s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' '),
          onPress: async () => {
            try {
              await bookingsApi.updateStatus(id, { status: s });
              fetchBookings();
              Alert.alert('Updated', `Booking status set to ${s}`);
            } catch {
              Alert.alert('Error', 'Failed to update status.');
            }
          },
        })),
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F5F0' }}>
      <View style={{ backgroundColor: '#0D0705', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>Bookings</Text>
        <Text style={{ color: '#9CA3AF', fontSize: 13, marginTop: 2 }}>Manage all bookings</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          {STATUSES.slice(0, 6).map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setStatus(s)}
              style={{
                paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
                backgroundColor: status === s ? '#D4AF37' : 'rgba(255,255,255,0.1)',
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '600', color: status === s ? '#1A0F0A' : '#9CA3AF' }}>
                {s ? s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ') : 'All'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings(); }} tintColor="#D4AF37" />}
        ListEmptyComponent={
          !loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📅</Text>
              <Text style={{ color: '#6B7280' }}>No bookings found</Text>
            </View>
          ) : null
        }
        renderItem={({ item: b }) => (
          <View style={{
            backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontWeight: '700', color: '#D4AF37', fontSize: 13 }}>{b.booking_number}</Text>
              <View style={{
                backgroundColor: getStatusBg(b.status), paddingHorizontal: 10,
                paddingVertical: 4, borderRadius: 20,
              }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: getStatusColor(b.status), textTransform: 'capitalize' }}>
                  {b.status.replace('_', ' ')}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A0F0A' }}>{b.first_name} {b.last_name}</Text>
            <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 2 }}>{b.package_name} · {formatDate(b.event_date)}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
              <Text style={{ fontSize: 17, fontWeight: '800', color: '#1A0F0A' }}>{formatCurrency(b.total_amount)}</Text>
              <TouchableOpacity
                onPress={() => updateStatus(b.id, b.status)}
                style={{
                  backgroundColor: '#1A0F0A', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12,
                  flexDirection: 'row', alignItems: 'center', gap: 6,
                }}
              >
                <Ionicons name="create-outline" size={14} color="#D4AF37" />
                <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: '700' }}>Update Status</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
