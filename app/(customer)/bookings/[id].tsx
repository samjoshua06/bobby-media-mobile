import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { bookingsApi, paymentsApi } from '../../../api';
import { formatCurrency, formatDate, formatDateTime, getStatusColor, getStatusBg } from '../../../utils';

const STATUS_STEPS = ['pending', 'confirmed', 'assigned', 'in_progress', 'completed', 'delivered'];

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const loadBooking = async () => {
    try {
      const { data } = await bookingsApi.get(id!);
      setBooking(data.data);
    } catch {
      Alert.alert('Error', 'Failed to load booking details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBooking(); }, [id]);

  if (loading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F5F0', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#D4AF37" />
    </SafeAreaView>
  );
  if (!booking) return null;

  const totalPaid = booking.payments
    ?.filter((p: any) => p.status === 'completed')
    .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0;
  const outstanding = parseFloat(booking.total_amount) - totalPaid;
  const currentStep = STATUS_STEPS.indexOf(booking.status);

  const handlePayNow = async () => {
    if (outstanding <= 0) return;
    Alert.alert(
      'Pay Now',
      `Pay ${formatCurrency(outstanding)} for booking ${booking.booking_number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed to Pay',
          onPress: async () => {
            setPaying(true);
            try {
              // Create order
              const { data } = await paymentsApi.createOrder({
                booking_id: booking.id,
                amount: outstanding,
                payment_type: totalPaid > 0 ? 'full' : 'advance',
              });
              Alert.alert(
                'Payment Order Created',
                `Order ID: ${data.data.razorpay_order_id}\n\nNote: Complete payment via Razorpay checkout. Open in browser for full payment flow.`,
                [{ text: 'OK' }]
              );
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Failed to initiate payment.');
            } finally {
              setPaying(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F5F0' }}>
      <ScrollView>
        {/* Header */}
        <View style={{ backgroundColor: '#1A0F0A', padding: 20 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
            <Text style={{ color: '#D4AF37', fontSize: 15 }}>← Back</Text>
          </TouchableOpacity>
          <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>{booking.booking_number}</Text>
          <Text style={{ color: '#9CA3AF', fontSize: 13, marginTop: 4 }}>{booking.package_name}</Text>
          <View style={{
            backgroundColor: getStatusBg(booking.status),
            paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
            alignSelf: 'flex-start', marginTop: 10,
          }}>
            <Text style={{ color: getStatusColor(booking.status), fontWeight: '700', textTransform: 'capitalize' }}>
              {booking.status}
            </Text>
          </View>
        </View>

        <View style={{ padding: 20, gap: 16 }}>
          {/* Progress Timeline */}
          {booking.status !== 'cancelled' && (
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A0F0A', marginBottom: 20 }}>
                Booking Progress
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 0 }}>
                  {STATUS_STEPS.map((step, i) => (
                    <View key={step} style={{ alignItems: 'center', width: 72 }}>
                      <View style={{
                        width: 32, height: 32, borderRadius: 16,
                        backgroundColor: i <= currentStep ? '#D4AF37' : '#E5E7EB',
                        alignItems: 'center', justifyContent: 'center',
                        zIndex: 1,
                      }}>
                        {i <= currentStep
                          ? <Ionicons name="checkmark" size={18} color="#1A0F0A" />
                          : <Text style={{ fontSize: 11, fontWeight: '700', color: '#9CA3AF' }}>{i + 1}</Text>
                        }
                      </View>
                      <Text style={{
                        fontSize: 9, color: i <= currentStep ? '#D4AF37' : '#9CA3AF',
                        textAlign: 'center', marginTop: 6, fontWeight: i <= currentStep ? '700' : '400',
                      }}>
                        {step.replace('_', '\n')}
                      </Text>
                      {i < STATUS_STEPS.length - 1 && (
                        <View style={{
                          position: 'absolute', top: 15, left: 40, width: 32, height: 2,
                          backgroundColor: i < currentStep ? '#D4AF37' : '#E5E7EB',
                        }} />
                      )}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Event Details */}
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A0F0A', marginBottom: 16 }}>Event Details</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
              {[
                { label: 'Event Date', value: formatDate(booking.event_date) },
                { label: 'Event Type', value: booking.event_type || '—' },
                { label: 'Venue', value: booking.venue || '—' },
                { label: 'City', value: booking.venue_city || '—' },
              ].map((item) => (
                <View key={item.label} style={{ width: '45%' }}>
                  <Text style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 3 }}>{item.label}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#1A0F0A' }}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Payment Summary */}
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A0F0A', marginBottom: 16 }}>Payment Summary</Text>
            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#6B7280' }}>Package</Text>
                <Text style={{ fontWeight: '600', color: '#1A0F0A' }}>{formatCurrency(booking.base_amount)}</Text>
              </View>
              {parseFloat(booking.addon_amount) > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#6B7280' }}>Add-ons</Text>
                  <Text style={{ fontWeight: '600', color: '#1A0F0A' }}>{formatCurrency(booking.addon_amount)}</Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#6B7280' }}>Total Paid</Text>
                <Text style={{ fontWeight: '700', color: '#10B981' }}>{formatCurrency(totalPaid)}</Text>
              </View>
              <View style={{ borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A0F0A' }}>Total</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A0F0A' }}>{formatCurrency(booking.total_amount)}</Text>
              </View>
            </View>

            {booking.status !== 'cancelled' && outstanding > 0 && (
              <TouchableOpacity
                onPress={handlePayNow}
                disabled={paying}
                style={{
                  backgroundColor: '#D4AF37', borderRadius: 14, paddingVertical: 16,
                  alignItems: 'center', marginTop: 20,
                  shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
                  opacity: paying ? 0.7 : 1,
                }}
              >
                {paying
                  ? <ActivityIndicator color="#1A0F0A" />
                  : <Text style={{ color: '#1A0F0A', fontWeight: '800', fontSize: 15 }}>
                      Pay Outstanding: {formatCurrency(outstanding)}
                    </Text>
                }
              </TouchableOpacity>
            )}
          </View>

          {/* Payment History */}
          {booking.payments?.length > 0 && (
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A0F0A', marginBottom: 16 }}>Payment History</Text>
              <View style={{ gap: 10 }}>
                {booking.payments.map((p: any) => (
                  <View key={p.id} style={{
                    backgroundColor: '#F8F5F0', borderRadius: 12, padding: 14,
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontWeight: '700', color: '#1A0F0A', fontSize: 15 }}>{formatCurrency(p.amount)}</Text>
                      <View style={{
                        backgroundColor: getStatusBg(p.status),
                        paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
                      }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: getStatusColor(p.status) }}>{p.status}</Text>
                      </View>
                    </View>
                    <Text style={{ color: '#6B7280', fontSize: 12, textTransform: 'capitalize' }}>
                      {p.payment_method} · {p.payment_type}
                    </Text>
                    {p.paid_at && <Text style={{ color: '#9CA3AF', fontSize: 11, marginTop: 2 }}>{formatDateTime(p.paid_at)}</Text>}
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
