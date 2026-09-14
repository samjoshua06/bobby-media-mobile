import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Dimensions, Alert, Platform } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { galleryApi } from '../../api';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 48) / 3;

export default function CustomerGallery() {
  const [galleries, setGalleries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGallery = async () => {
    try {
      const { data } = await galleryApi.list();
      setGalleries(data.data || []);
    } catch { }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchGallery(); }, []);

  const downloadImage = async (url: string) => {
    if (Platform.OS === 'web') {
      try {
        const link = document.createElement('a');
        link.href = url;
        link.download = url.split('/').pop() || 'photo.jpg';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {
        window.open(url, '_blank');
      }
      return;
    }

    // Native (iOS / Android)
    try {
      const MediaLibrary = await import('expo-media-library');
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Please allow media library access to save photos.');
        return;
      }
      const { FileSystem } = await import('expo-file-system');
      const filename = url.split('/').pop() || 'photo.jpg';
      const fileUri = FileSystem.documentDirectory + filename;
      await FileSystem.downloadAsync(url, fileUri);
      await MediaLibrary.saveToLibraryAsync(fileUri);
      Alert.alert('Saved!', 'Photo saved to your gallery.');
    } catch {
      Alert.alert('Error', 'Failed to save photo.');
    }
  };

  const allMedia = galleries.flatMap((g: any) => g.media || []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0705' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>My Gallery</Text>
        <Text style={{ color: '#9CA3AF', fontSize: 13, marginTop: 2 }}>
          {allMedia.length} photos delivered
        </Text>
      </View>

      {allMedia.length === 0 && !loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>📸</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>No photos yet</Text>
          <Text style={{ color: '#6B7280', fontSize: 14, marginTop: 8 }}>
            Your delivered photos will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={allMedia}
          keyExtractor={(item: any) => String(item.id)}
          numColumns={3}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 4 }}
          columnWrapperStyle={{ gap: 4 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchGallery(); }} tintColor="#D4AF37" />}
          renderItem={({ item }: any) => (
            <TouchableOpacity
              onLongPress={() => downloadImage(item.url)}
              style={{ width: ITEM_SIZE, height: ITEM_SIZE, marginBottom: 4 }}
            >
              <Image
                source={{ uri: item.url }}
                style={{ width: ITEM_SIZE, height: ITEM_SIZE, borderRadius: 8 }}
                contentFit="cover"
                transition={200}
                placeholder={{ blurhash: 'L6Pj0^jE.AyE_3t7t7R**0o#DgR4' }}
              />
              <TouchableOpacity
                onPress={() => downloadImage(item.url)}
                style={{
                  position: 'absolute', bottom: 6, right: 6,
                  backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 14,
                  padding: 5,
                }}
              >
                <Ionicons name="download-outline" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
