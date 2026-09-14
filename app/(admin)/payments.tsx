import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { paymentsApi, bookingsApi } from '../../api';
import { formatCurrency, formatDate, formatDateTime, getStatusColor, getStatusBg } from '../../utils';

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Manual payment form
  const [bookingNum, setBookingNum] = useState('');
  const [resolvedBooking, setResolvedBooking] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [type, setType] = useState('advance');
  const [ref, setRef] = useState('');
  const [notes, setNotes] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data } = await paymentsApi.list({ limit: 30 });
      setPayments(data.data || []);
    } catch { } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchPayments(); }, []);

  const lookupBooking = async () => {
    const bn = bookingNum.trim().toUpperCase();
    if (!bn) return;
    setLookingUp(true);
    setResolvedBooking(null);
    try {
      const { data } = await bookingsApi.list({ search: bn, limit: 5 });
      const match = (data.data || []).find((b: any) => b.booking_number === bn);
      if (match) setResolvedBooking(match);
      else Alert.alert('Not Found', 'Booking not found. Check the booking number.');
    } catch { Alert.alert('Error', 'Failed to look up booking.'); }
    finally { setLookingUp(false); }
  };

  const submitPayment = async () => {
    if (!resolvedBooking) return Alert.alert('Error', 'Look up a booking first.');
    if (!amount || parseFloat(amount) <= 0) return Alert.alert('Error', 'Enter a valid amount.');
    setSubmitting(true);
    try {
      await paymentsApi.manual({
        booking_id: resolvedBooking.id,
        amount: parseFloat(amount),
        payment_method: method,
        payment_type: type,
        transaction_ref: ref || null,
        notes: notes || null,
        payment_date: new Date().toISOString().slice(0, 10),
      });
      Alert.alert('Success', 'Payment recorded and customer notified!');
      setShowModal(false);
      setBookingNum(''); setResolvedBooking(null); setAmount('');
      setRef(''); setNotes(''); setMethod('cash'); setType('advance');
      fetchPayments();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to record payment.');
    } finally { setSubmitting(false); }
  };

  const METHOD_ICONS: Record<string, string> = { cash: '💵', bank_transfer: '🏦', upi: '📱', cheque: '📄' };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F5F0' }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#0D0705', paddingHorizontal: 20,
        paddingTop: 16, paddingBottom: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
      }}>
        <View>
          <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>Payments</Text>
          <Text style={{ color: '#9CA3AF', fontSize: 13, marginTop: 2 }}>Track & record payments</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          style={{
            backgroundColor: '#D4AF37', borderRadius: 14, paddingHorizontal: 16,
            paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 6,
          }}
        >
          <Ionicons name="add" size={18} color="#1A0F0A" />
          <Text style={{ color: '#1A0F0A', fontWeight: '800', fontSize: 13 }}>Record</Text>
        </TouchableOpacity>
      </View>

      {/* Payments List */}
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPayments(); }} tintColor="#D4AF37" />}
      >
        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <ActivityIndicator color="#D4AF37" size="large" />
          </View>
        ) : payments.map((p) => (
          <View key={p.id} style={{
            backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#D4AF37' }}>{p.payment_number}</Text>
              <View style={{ backgroundColor: getStatusBg(p.status), paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: getStatusColor(p.status) }}>{p.status}</Text>
              </View>
            </View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A0F0A' }}>{p.first_name} {p.last_name}</Text>
            <Text style={{ color: '#6B7280', fontSize: 12 }}>{p.booking_number}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: '#1A0F0A' }}>{formatCurrency(p.amount)}</Text>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>
                {METHOD_ICONS[p.payment_method] || '💳'} {p.payment_method?.replace('_', ' ')} · {p.payment_type}
              </Text>
            </View>
            {p.paid_at && <Text style={{ color: '#9CA3AF', fontSize: 11, marginTop: 4 }}>{formatDateTime(p.paid_at)}</Text>}
          </View>
        ))}
      </ScrollView>

      {/* Record Manual Payment Modal */}
      {showModal && (
        <View style={{
          position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
            padding: 24, maxHeight: '90%',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#1A0F0A' }}>Record Manual Payment</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {/* Booking Lookup */}
              <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 6 }}>BOOKING NUMBER *</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                <TextInput
                  value={bookingNum}
                  onChangeText={(t) => { setBookingNum(t); setResolvedBooking(null); }}
                  placeholder="e.g. BM-20260914-1234"
                  autoCapitalize="characters"
                  style={{
                    flex: 1, backgroundColor: '#F3F4F6', borderRadius: 12,
                    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
                  }}
                />
                <TouchableOpacity
                  onPress={lookupBooking}
                  disabled={lookingUp || !bookingNum.trim()}
                  style={{
                    backgroundColor: '#1A0F0A', borderRadius: 12, paddingHorizontal: 16,
                    justifyContent: 'center', opacity: lookingUp ? 0.6 : 1,
                  }}
                >
                  {lookingUp ? <ActivityIndicator color="#D4AF37" size="small" /> :
                    <Text style={{ color: '#D4AF37', fontWeight: '700', fontSize: 13 }}>Lookup</Text>}
                </TouchableOpacity>
              </View>

              {resolvedBooking && (
                <View style={{
                  backgroundColor: '#D1FAE5', borderRadius: 12, padding: 14, marginBottom: 16,
                  borderWidth: 1, borderColor: '#6EE7B7',
                }}>
                  <Text style={{ color: '#065F46', fontWeight: '700' }}>✅ {resolvedBooking.first_name} {resolvedBooking.last_name}</Text>
                  <Text style={{ color: '#047857', fontSize: 12, marginTop: 2 }}>
                    {resolvedBooking.package_name} · Total: {formatCurrency(resolvedBooking.total_amount)}
                  </Text>
                </View>
              )}

              {/* Amount */}
              <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 6 }}>AMOUNT (₹) *</Text>
              <TextInput
                value={amount} onChangeText={setAmount}
                placeholder="0.00" keyboardType="decimal-pad"
                style={{
                  backgroundColor: '#F3F4F6', borderRadius: 12,
                  paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, fontWeight: '700',
                  marginBottom: 16,
                }}
              />

              {/* Method */}
              <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 8 }}>PAYMENT METHOD *</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {['cash', 'upi', 'bank_transfer', 'cheque'].map((m) => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setMethod(m)}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
                      backgroundColor: method === m ? '#1A0F0A' : '#F3F4F6',
                    }}
                  >
                    <Text style={{ color: method === m ? '#D4AF37' : '#6B7280', fontWeight: '600', fontSize: 13 }}>
                      {METHOD_ICONS[m]} {m.replace('_', ' ').toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Type */}
              <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 8 }}>PAYMENT TYPE *</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                {['advance', 'partial', 'full'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setType(t)}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
                      backgroundColor: type === t ? '#D4AF37' : '#F3F4F6',
                    }}
                  >
                    <Text style={{ color: type === t ? '#1A0F0A' : '#6B7280', fontWeight: '700', fontSize: 13 }}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Ref */}
              <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 6 }}>TRANSACTION REF (optional)</Text>
              <TextInput
                value={ref} onChangeText={setRef}
                placeholder="UTR / Cheque no. / Ref ID"
                style={{
                  backgroundColor: '#F3F4F6', borderRadius: 12,
                  paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginBottom: 16,
                }}
              />

              {/* Submit */}
              <TouchableOpacity
                onPress={submitPayment}
                disabled={submitting || !resolvedBooking || !amount}
                style={{
                  backgroundColor: '#D4AF37', borderRadius: 14, paddingVertical: 16,
                  alignItems: 'center', marginTop: 8, marginBottom: 24,
                  opacity: (submitting || !resolvedBooking || !amount) ? 0.5 : 1,
                }}
              >
                {submitting ? <ActivityIndicator color="#1A0F0A" /> :
                  <Text style={{ color: '#1A0F0A', fontWeight: '800', fontSize: 16 }}>✓ Record Payment</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
