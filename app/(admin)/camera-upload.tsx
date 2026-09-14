import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { bookingsApi, galleryApi } from '../../api';

interface PickedImage {
  uri: string;
  name: string;
  type: string;
}

export default function CameraUpload() {
  const [bookingNum, setBookingNum] = useState('');
  const [resolvedBooking, setResolvedBooking] = useState<any>(null);
  const [resolvedGallery, setResolvedGallery] = useState<any>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [images, setImages] = useState<PickedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const lookupBooking = async () => {
    const bn = bookingNum.trim().toUpperCase();
    if (!bn) return;
    setLookingUp(true);
    setResolvedBooking(null);
    setResolvedGallery(null);
    try {
      const { data } = await bookingsApi.list({ search: bn, limit: 5 });
      const match = (data.data || []).find((b: any) => b.booking_number === bn);
      if (!match) return Alert.alert('Not Found', 'No booking found with that number.');
      setResolvedBooking(match);
      // Check for gallery
      const gRes = await galleryApi.getByBooking(match.id);
      const galleries = gRes.data.data || [];
      if (galleries.length > 0) {
        setResolvedGallery(galleries[0]);
      }
    } catch { Alert.alert('Error', 'Failed to look up booking.'); }
    finally { setLookingUp(false); }
  };

  const pickImages = async (useCamera = false) => {
    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsMultipleSelection: !useCamera,
      selectionLimit: 20,
    };
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.85 })
      : await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled) {
      const picked = result.assets.map((a) => ({
        uri: a.uri,
        name: a.fileName || `photo_${Date.now()}.jpg`,
        type: a.mimeType || 'image/jpeg',
      }));
      setImages((prev) => [...prev, ...picked]);
    }
  };

  const removeImage = (uri: string) => setImages((prev) => prev.filter((i) => i.uri !== uri));

  const uploadImages = async () => {
    if (!resolvedBooking) return Alert.alert('Error', 'Please look up a booking first.');
    if (images.length === 0) return Alert.alert('Error', 'Select at least one photo.');
    setUploading(true);
    setUploadProgress(0);
    try {
      let gallery = resolvedGallery;
      // Create gallery if doesn't exist
      if (!gallery) {
        const { data } = await galleryApi.create(resolvedBooking.id, {
          title: `${resolvedBooking.booking_number} Gallery`,
          description: `Photos for ${resolvedBooking.booking_number}`,
        });
        gallery = data.data;
        setResolvedGallery(gallery);
      }

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const formData = new FormData();
        formData.append('images', {
          uri: img.uri,
          name: img.name,
          type: img.type,
        } as any);
        await galleryApi.upload(gallery.id, formData);
        setUploadProgress(Math.round(((i + 1) / images.length) * 100));
      }

      Alert.alert('Uploaded!', `${images.length} photo(s) uploaded to ${resolvedBooking.booking_number} gallery.`);
      setImages([]);
      setUploadProgress(0);
    } catch (err: any) {
      Alert.alert('Upload Failed', err?.response?.data?.message || 'Some photos failed to upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F5F0' }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        {/* Header */}
        <View style={{ backgroundColor: '#0D0705', borderRadius: 24, padding: 20 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>📷 Photo Upload</Text>
          <Text style={{ color: '#9CA3AF', fontSize: 13, marginTop: 4 }}>Upload delivered photos to customer galleries</Text>
        </View>

        {/* Booking Lookup */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A0F0A', marginBottom: 14 }}>1. Select Booking</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput
              value={bookingNum}
              onChangeText={(t) => { setBookingNum(t); setResolvedBooking(null); }}
              placeholder="BM-YYYYMMDD-XXXX"
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
                <Text style={{ color: '#D4AF37', fontWeight: '700' }}>Find</Text>}
            </TouchableOpacity>
          </View>
          {resolvedBooking && (
            <View style={{
              backgroundColor: '#D1FAE5', borderRadius: 12, padding: 14, marginTop: 12,
              borderWidth: 1, borderColor: '#6EE7B7',
            }}>
              <Text style={{ color: '#065F46', fontWeight: '700', fontSize: 15 }}>
                ✅ {resolvedBooking.first_name} {resolvedBooking.last_name}
              </Text>
              <Text style={{ color: '#047857', fontSize: 12, marginTop: 3 }}>
                {resolvedBooking.booking_number} · {resolvedBooking.package_name}
              </Text>
              {resolvedGallery && (
                <Text style={{ color: '#047857', fontSize: 12, marginTop: 2 }}>
                  📂 Gallery: {resolvedGallery.title} ({resolvedGallery.media_count || 0} photos)
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Pick Images */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A0F0A', marginBottom: 14 }}>2. Select Photos</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => pickImages(false)}
              style={{
                flex: 1, backgroundColor: '#F3F4F6', borderRadius: 14, paddingVertical: 16,
                alignItems: 'center', gap: 6,
              }}
            >
              <Ionicons name="images-outline" size={28} color="#6B7280" />
              <Text style={{ color: '#6B7280', fontSize: 13, fontWeight: '600' }}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => pickImages(true)}
              style={{
                flex: 1, backgroundColor: '#1A0F0A', borderRadius: 14, paddingVertical: 16,
                alignItems: 'center', gap: 6,
              }}
            >
              <Ionicons name="camera-outline" size={28} color="#D4AF37" />
              <Text style={{ color: '#D4AF37', fontSize: 13, fontWeight: '600' }}>Camera</Text>
            </TouchableOpacity>
          </View>

          {images.length > 0 && (
            <>
              <Text style={{ color: '#6B7280', fontSize: 12, fontWeight: '600', marginBottom: 10 }}>
                {images.length} PHOTO{images.length > 1 ? 'S' : ''} SELECTED
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {images.map((img) => (
                    <View key={img.uri} style={{ position: 'relative' }}>
                      <Image
                        source={{ uri: img.uri }}
                        style={{ width: 80, height: 80, borderRadius: 12 }}
                        contentFit="cover"
                      />
                      <TouchableOpacity
                        onPress={() => removeImage(img.uri)}
                        style={{
                          position: 'absolute', top: -6, right: -6,
                          backgroundColor: '#EF4444', borderRadius: 10,
                          width: 20, height: 20, alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Ionicons name="close" size={12} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </>
          )}
        </View>

        {/* Upload */}
        {images.length > 0 && resolvedBooking && (
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A0F0A', marginBottom: 14 }}>3. Upload</Text>
            {uploading && (
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ color: '#6B7280', fontSize: 12 }}>Uploading…</Text>
                  <Text style={{ color: '#D4AF37', fontWeight: '700', fontSize: 12 }}>{uploadProgress}%</Text>
                </View>
                <View style={{ backgroundColor: '#F3F4F6', borderRadius: 6, height: 8 }}>
                  <View style={{
                    backgroundColor: '#D4AF37', borderRadius: 6, height: 8,
                    width: `${uploadProgress}%`,
                  }} />
                </View>
              </View>
            )}
            <TouchableOpacity
              onPress={uploadImages}
              disabled={uploading}
              style={{
                backgroundColor: '#D4AF37', borderRadius: 14, paddingVertical: 16,
                alignItems: 'center', opacity: uploading ? 0.7 : 1,
              }}
            >
              {uploading ? <ActivityIndicator color="#1A0F0A" /> :
                <Text style={{ color: '#1A0F0A', fontWeight: '800', fontSize: 16 }}>
                  ⬆️ Upload {images.length} Photo{images.length > 1 ? 's' : ''}
                </Text>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
