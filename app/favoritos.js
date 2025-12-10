import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  StyleSheet, 
  StatusBar,
  Dimensions
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as API from '../services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function FavoritosPage() {
  const router = useRouter();
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const userInfo = await API.getUserInfo().catch(() => null);
      setUsuario(userInfo);
      
      if (userInfo) {
        const favs = await API.getFavorites();
        const listaFavs = Array.isArray(favs) ? favs : [];
        setFavoritos(listaFavs);
      } else {
        setFavoritos([]);
      }
    } catch (error) {
      console.error('Error cargando favoritos:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminacion = (item) => {
    Alert.alert(
      "Eliminar Favorito",
      `¿Quitar "${item.nombre}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => eliminarFavorito(item) }
      ]
    );
  };

  const eliminarFavorito = async (item) => {
    const listaAnterior = [...favoritos];
    setFavoritos(prev => prev.filter(f => f.favorito_id !== item.favorito_id));

    try {
      const resultado = await API.removeFavorite(item.favorito_id);
      if (!resultado) throw new Error("Error al eliminar");
    } catch (error) {
      setFavoritos(listaAnterior);
      Alert.alert("Error", "No se pudo eliminar.");
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      );
    }

    if (!usuario) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="lock-closed-outline" size={80} color="#333" style={{marginBottom: 20}} />
          <Text style={styles.emptyTitle}>Colección Privada</Text>
          <Text style={styles.emptyText}>Inicia sesión para ver tus guardados.</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/login')}>
            <Text style={styles.btnText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (favoritos.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="heart-dislike-outline" size={80} color="#333" style={{marginBottom: 20}} />
          <Text style={styles.emptyTitle}>Lista vacía</Text>
          <Text style={styles.emptyText}>Guarda destinos que te enamoren.</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/lugares')}>
            <Text style={styles.btnText}>Explorar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.introContainer}>
             <Text style={styles.introTitle}>Tus Destinos</Text>
             <Text style={styles.introSubtitle}>Colección personal de viajes.</Text>
        </View>

        <View style={styles.grid}>
          {favoritos.map((item) => (
            <TouchableOpacity 
              key={item.favorito_id || item.id}
              style={styles.card}
              activeOpacity={0.9}
            >
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: item.imagen_url }} 
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.9)']}
                  style={styles.cardGradient}
                />
                
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.categoria}</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.deleteBtn}
                  onPress={() => confirmarEliminacion(item)}
                >
                  <Ionicons name="trash-outline" size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.nombre}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.descripcion}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
            <LinearGradient colors={['#ff6b00', '#fbbf24']} style={styles.mountainIcon} />
            <Text style={styles.logoText}><Text style={{color:'white'}}>Mis </Text><Text style={{color:'#ff6b00'}}>Favoritos</Text></Text>
        </View>
        <View style={{width: 24}} />
      </View>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20, backgroundColor: 'rgba(15, 15, 15, 0.95)', borderBottomWidth: 1, borderBottomColor: '#333' },
  backBtn: { padding: 5 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mountainIcon: { width: 24, height: 24, borderRadius: 4 },
  logoText: { fontSize: 18, fontWeight: '800' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  introContainer: { alignItems: 'center', marginBottom: 25, marginTop: 10 },
  introTitle: { fontSize: 22, fontWeight: '700', color: 'white', marginBottom: 5 },
  introSubtitle: { fontSize: 14, color: '#a0a0a0' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 15, color: '#a0a0a0' },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: 'white', marginVertical: 10 },
  emptyText: { textAlign: 'center', color: '#888', marginBottom: 30 },
  btnPrimary: { backgroundColor: '#FF6B00', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 30 },
  btnText: { color: 'white', fontWeight: '700' },
  card: { width: CARD_WIDTH, backgroundColor: '#141414', borderRadius: 20, borderWidth: 1, borderColor: '#333', overflow: 'hidden', marginBottom: 16 },
  imageContainer: { height: 140, position: 'relative' },
  cardImage: { width: '100%', height: '100%' },
  cardGradient: { ...StyleSheet.absoluteFillObject },
  categoryBadge: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.7)', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  categoryText: { fontSize: 9, fontWeight: '700', color: '#fff', textTransform: 'uppercase' },
  deleteBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ef4444' },
  cardContent: { padding: 12 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 4 },
  cardDesc: { fontSize: 11, color: '#a0a0a0', lineHeight: 16 }
});