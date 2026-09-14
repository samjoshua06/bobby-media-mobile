import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { bookingsApi } from '../../api';
import { formatCurrency, formatDate, getStatusColor, getStatusBg } from '../../utils';

const STATUSES = ['', 'pending', 'confirmed', 'assigned', 'completed', 'delivered', 'cancelled'];

export default function CustomerBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async (reset = false) => {
    const pg = reset ? 1 : page;
    if (reset) setPage(1);
    setLoading(true);
    try {
      const { data } = await bookingsApi.list({ page: pg, limit: 10, status });
      if (reset || pg === 1) {
        setBookings(data.data || []);
      } else {
        setBookings(prev => [...prev, ...(data.data || [])]);
      }
      setPagination(data.pagination || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchBookings(true); }, [status]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F5F0' }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#1A0F0A', paddingHorizontal: 20,
        paddingTop: 16, paddingBottom: 20,
      }}>
        <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>My Bookings</Text>
        <Text style={{ color: '#9CA3AF', fontSize: 13, marginTop: 2 }}>Track all your photography sessions</Text>
        {/* Status filters */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          {STATUSES.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setStatus(s)}
              style={{
                paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
                backgroundColor: status === s ? '#D4AF37' : 'rgba(255,255,255,0.1)',
              }}
            >
              <Text style={{
                fontSize: 12, fontWeight: '600',
                color: status === s ? '#1A0F0A' : '#9CA3AF',
              }}>
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchBookings(true); }}
            tintColor="#D4AF37"
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={{
              backgroundColor: '#FFFFFF', borderRadius: 20, padding: 48,
              alignItems: 'center', marginTop: 20,
            }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📅</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1A0F0A', marginBottom: 6 }}>No bookings found</Text>
              <Text style={{ color: '#6B7280', fontSize: 14 }}>Try a different filter</Text>
            </View>
          ) : null
        }
        onEndReached={() => {
          if (pagination.hasNext && !loading) {
            setPage(p => p + 1);
            fetchBookings();
          }
        }}
        onEndReachedThreshold={0.3}
        renderItem={({ item: b }) => (
          <TouchableOpacity
            onPress={() => router.push(`/(customer)/bookings/${b.id}` as any)}
            style={{
              backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18,
              shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
            }}
            activeOpacity={0.85}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#D4AF37' }}>{b.booking_number}</Text>
                  <View style={{
                    backgroundColor: getStatusBg(b.status),
                    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
                  }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: getStatusColor(b.status), textTransform: 'capitalize' }}>
                      {b.status}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A0F0A', marginBottom: 6 }}>{b.package_name}</Text>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>📅 {formatDate(b.event_date)}</Text>
                  {b.event_type && <Text style={{ fontSize: 12, color: '#6B7280' }}>🎭 {b.event_type}</Text>}
                  {b.venue_city && <Text style={{ fontSize: 12, color: '#6B7280' }}>📍 {b.venue_city}</Text>}
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#1A0F0A' }}>{formatCurrency(b.total_amount)}</Text>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" style={{ marginTop: 4 }} />
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
