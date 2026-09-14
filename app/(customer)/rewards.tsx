import { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { rewardsApi } from '../../api';
import { formatDate } from '../../utils';

export default function CustomerRewards() {
  const [rewards, setRewards] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRewards = async () => {
    try {
      const { data } = await rewardsApi.get();
      setRewards(data.data);
    } catch { } finally { setRefreshing(false); }
  };

  useEffect(() => { fetchRewards(); }, []);

  const TYPE_COLORS: Record<string, string> = {
    earned_booking:  '#10B981',
    earned_referral: '#3B82F6',
    redeemed:        '#EF4444',
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F5F0' }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRewards(); }} tintColor="#D4AF37" />}
      >
        {/* Header */}
        <View style={{ backgroundColor: '#1A0F0A', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>Reward Points</Text>
          <Text style={{ color: '#9CA3AF', fontSize: 13, marginTop: 2 }}>Earn points with every booking</Text>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: -16 }}>
          {/* Points Card */}
          <View style={{
            backgroundColor: '#D4AF37', borderRadius: 24, padding: 28, marginBottom: 24,
            shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
          }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#1A0F0A', opacity: 0.7 }}>
              ⭐ TOTAL POINTS
            </Text>
            <Text style={{ fontSize: 56, fontWeight: '900', color: '#1A0F0A', marginTop: 4 }}>
              {rewards?.balance || 0}
            </Text>
            <View style={{ flexDirection: 'row', gap: 32, marginTop: 16 }}>
              <View>
                <Text style={{ fontSize: 11, color: 'rgba(26,15,10,0.6)' }}>Earned</Text>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A0F0A' }}>{rewards?.total_earned || 0}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 11, color: 'rgba(26,15,10,0.6)' }}>Redeemed</Text>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#1A0F0A' }}>{rewards?.total_redeemed || 0}</Text>
              </View>
            </View>
          </View>

          {/* History */}
          <Text style={{ fontSize: 17, fontWeight: '700', color: '#1A0F0A', marginBottom: 14 }}>Points History</Text>
          {(rewards?.history || []).length === 0 ? (
            <View style={{
              backgroundColor: '#FFFFFF', borderRadius: 20, padding: 32, alignItems: 'center',
            }}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>⭐</Text>
              <Text style={{ color: '#6B7280', fontSize: 14 }}>No points history yet. Complete a booking to earn!</Text>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {(rewards.history || []).map((h: any) => (
                <View key={h.id} style={{
                  backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
                  flexDirection: 'row', alignItems: 'center',
                }}>
                  <View style={{
                    width: 40, height: 40, borderRadius: 12,
                    backgroundColor: `${TYPE_COLORS[h.type] || '#6B7280'}20`,
                    alignItems: 'center', justifyContent: 'center', marginRight: 14,
                  }}>
                    <Text style={{ fontSize: 18 }}>
                      {h.type === 'redeemed' ? '💸' : h.type === 'earned_referral' ? '🎁' : '⭐'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#1A0F0A' }}>{h.description}</Text>
                    <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{formatDate(h.created_at)}</Text>
                  </View>
                  <Text style={{
                    fontSize: 16, fontWeight: '800',
                    color: h.type === 'redeemed' ? '#EF4444' : '#10B981',
                  }}>
                    {h.type === 'redeemed' ? '-' : '+'}{h.points}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
