import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth';
import { reportsApi, paymentsApi } from '../../api';
import { formatCurrency, formatDate } from '../../utils';

const { width } = Dimensions.get('window');

const StatCard = ({ label, value, sub, icon, color }: any) => (
  <View style={{
    width: (width - 56) / 2,
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  }}>
    <View style={{
      width: 44, height: 44, borderRadius: 14,
      backgroundColor: `${color}20`, alignItems: 'center',
      justifyContent: 'center', marginBottom: 12,
    }}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
    </View>
    <Text style={{ fontSize: 22, fontWeight: '900', color: '#1A0F0A' }}>{value}</Text>
    <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280', marginTop: 2 }}>{label}</Text>
    {sub && <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{sub}</Text>}
  </View>
);

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const [dashData, setDashData] = useState<any>(null);
  const [paymentSummary, setPaymentSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [dRes, pRes] = await Promise.all([
        reportsApi.dashboard(),
        paymentsApi.summary(),
      ]);
      setDashData(dRes.data.data);
      setPaymentSummary(pRes.data.data);
    } catch (e) { console.error('Admin dashboard error:', e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const d = dashData;
  const p = paymentSummary?.totals;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F5F0' }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#D4AF37" />}
      >
        {/* Header */}
        <View style={{ backgroundColor: '#0D0705', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Admin Panel</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 2 }}>
                {user?.first_name} 👑
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

        <View style={{ padding: 20, gap: 20 }}>
          {/* Revenue Highlight */}
          <View style={{
            backgroundColor: '#1A0F0A', borderRadius: 24, padding: 24,
            shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25, shadowRadius: 16, elevation: 8,
          }}>
            <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: '700', marginBottom: 8 }}>
              💰 TOTAL REVENUE COLLECTED
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 40, fontWeight: '900' }}>
              {formatCurrency(p?.total_collected || 0)}
            </Text>
            <View style={{ flexDirection: 'row', gap: 24, marginTop: 16 }}>
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Pending</Text>
                <Text style={{ color: '#F59E0B', fontWeight: '800', fontSize: 16 }}>{formatCurrency(p?.total_pending || 0)}</Text>
              </View>
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Success Rate</Text>
                <Text style={{ color: '#10B981', fontWeight: '800', fontSize: 16 }}>{p?.success_rate || 0}%</Text>
              </View>
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Transactions</Text>
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>{p?.total_count || 0}</Text>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            <StatCard label="Total Customers" value={d?.customer_stats?.total_customers || 0} icon="👥" color="#3B82F6" sub="All time" />
            <StatCard label="Today's Events" value={d?.customer_stats?.todays_events || 0} icon="📸" color="#8B5CF6" sub="Scheduled today" />
            <StatCard label="Active Projects" value={d?.project_stats?.active_projects || 0} icon="🎬" color="#F97316" sub={`${d?.project_stats?.completed_projects || 0} completed`} />
            <StatCard label="Upcoming Events" value={d?.customer_stats?.upcoming_events || 0} icon="📅" color="#D4AF37" sub="Next 30 days" />
          </View>

          {/* Monthly Revenue Chart (simple bars) */}
          {d?.monthly_revenue?.length > 0 && (
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A0F0A', marginBottom: 20 }}>
                6-Month Revenue
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 100 }}>
                {(() => {
                  const maxRev = Math.max(...(d.monthly_revenue.map((m: any) => parseFloat(m.revenue) || 0)), 1);
                  return d.monthly_revenue.map((m: any) => {
                    const h = Math.max(((parseFloat(m.revenue) || 0) / maxRev) * 90, 4);
                    return (
                      <View key={m.label} style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={{ fontSize: 9, color: '#D4AF37', marginBottom: 4, fontWeight: '700' }}>
                          {formatCurrency(m.revenue).replace('₹', '').replace(',', '')}
                        </Text>
                        <View style={{
                          width: '80%', height: h,
                          backgroundColor: '#D4AF37', borderRadius: 6,
                          opacity: 0.85,
                        }} />
                        <Text style={{ fontSize: 9, color: '#6B7280', marginTop: 6 }}>{m.label}</Text>
                      </View>
                    );
                  });
                })()}
              </View>
            </View>
          )}

          {/* Today's Events */}
          {d?.today_events?.length > 0 && (
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A0F0A', marginBottom: 14 }}>
                📅 Today's Events
              </Text>
              <View style={{ gap: 10 }}>
                {d.today_events.map((e: any) => (
                  <View key={e.id} style={{
                    backgroundColor: '#FEF3C7', borderRadius: 12, padding: 14,
                    borderLeftWidth: 4, borderLeftColor: '#D4AF37',
                  }}>
                    <Text style={{ fontWeight: '700', color: '#1A0F0A', fontSize: 14 }}>{e.customer_name}</Text>
                    <Text style={{ color: '#6B7280', fontSize: 12, marginTop: 2 }}>
                      {e.event_type} · {e.event_venue || '—'}
                    </Text>
                    {e.phone && <Text style={{ color: '#D4AF37', fontSize: 12, marginTop: 2 }}>📞 {e.phone}</Text>}
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
