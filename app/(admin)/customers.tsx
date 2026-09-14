import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { customersApi } from '../../api';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await customersApi.list({ search, limit: 50 });
      setCustomers(data.data || []);
    } catch { } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchCustomers(), 400);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F5F0' }}>
      <View style={{ backgroundColor: '#0D0705', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>Customers</Text>
        <Text style={{ color: '#9CA3AF', fontSize: 13, marginTop: 2 }}>CRM — All customers</Text>
        <View style={{
          flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)',
          borderRadius: 12, paddingHorizontal: 14, marginTop: 14,
        }}>
          <Ionicons name="search" size={16} color="#6B7280" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, email, phone…"
            placeholderTextColor="#6B7280"
            style={{ flex: 1, color: '#FFFFFF', paddingVertical: 12, paddingLeft: 10, fontSize: 14 }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={customers}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCustomers(); }} tintColor="#D4AF37" />}
        ListEmptyComponent={
          !loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>👥</Text>
              <Text style={{ color: '#6B7280' }}>No customers found</Text>
            </View>
          ) : null
        }
        renderItem={({ item: c }) => (
          <View style={{
            backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16,
            flexDirection: 'row', alignItems: 'center',
            shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
          }}>
            <View style={{
              width: 48, height: 48, borderRadius: 14,
              backgroundColor: '#1A0F0A', alignItems: 'center', justifyContent: 'center', marginRight: 14,
            }}>
              <Text style={{ color: '#D4AF37', fontWeight: '900', fontSize: 16 }}>
                {c.first_name?.[0] || c.customer_name?.[0] || '?'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', color: '#1A0F0A', fontSize: 15 }}>
                {c.first_name && c.last_name ? `${c.first_name} ${c.last_name}` : c.customer_name || '—'}
              </Text>
              <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 2 }}>{c.email}</Text>
              {c.phone && <Text style={{ color: '#9CA3AF', fontSize: 11, marginTop: 1 }}>📞 {c.phone}</Text>}
            </View>
            <Text style={{ color: '#D4AF37', fontSize: 11, fontWeight: '700' }}>
              {c.total_bookings || 0} bookings
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
