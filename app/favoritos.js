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
import * as API from '../services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columnas con espaciado

export default function FavoritosPage() {
  const router = useRouter();
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);

  // Cargar datos cada vez que la pantalla gana foco
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
        // Aseguramos que sea un array y filtramos duplicados por ID si es necesario
        const listaFavs = Array.isArray(favs) ? favs : [];
        setFavoritos(listaFavs);
      } else {
        setFavoritos([]);
      }
    } catch (error) {
      console.error('Error cargando favoritos:', error);
      // No mostramos alerta intrusiva al cargar, solo si falla una acción
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminacion = (item) => {
    Alert.alert(
      "Eliminar Favorito",
      `¿Deseas quitar "${item.nombre}" de tus favoritos?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: () => eliminarFavorito(item) 
        }
      ]
    );
  };

  const eliminarFavorito = async (item) => {
    // Actualización optimista en UI
    const listaAnterior = [...favoritos];
    setFavoritos(prev => prev.filter(f => f.favorito_id !== item.favorito_id));

    try {
      const resultado = await API.removeFavorite(item.favorito_id);
      if (!resultado) {
        throw new Error("Error al eliminar");
      }
    } catch (error) {
      // Revertir si falla
      setFavoritos(listaAnterior);
      Alert.alert("Error", "No se pudo eliminar el favorito. Intenta de nuevo.");
    }
  };

  const irALugares = () => router.push('/lugares');

  // Renderizado condicional del contenido principal
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text style={styles.loadingText}>Cargando tu colección...</Text>
        </View>
      );
    }

    if (!usuario) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="lock-closed-outline" size={80} color="#CBD5E0" />
          <Text style={styles.emptyTitle}>Colección Privada</Text>
          <Text style={styles.emptyText}>Inicia sesión para ver tus lugares guardados.</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/login')}>
            <Text style={styles.btnText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (favoritos.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="heart-dislike-outline" size={80} color="#CBD5E0" />
          <Text style={styles.emptyTitle}>Tu lista está vacía</Text>
          <Text style={styles.emptyText}>
            Explora Arequipa y guarda aquí los destinos que te enamoren.
          </Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={irALugares}>
            <Text style={styles.btnText}>Explorar Lugares</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {favoritos.map((item) => (
            <TouchableOpacity 
              key={item.favorito_id || item.id} // Fallback ID
              style={styles.card}
              activeOpacity={0.9}
              // Al tocar la tarjeta podríamos ir al detalle (opcional)
              // onPress={() => router.push({ pathname: '/lugares', params: { id: item.id } })}
            >
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: item.imagen_url }} 
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.categoria}</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.deleteBtn}
                  onPress={() => confirmarEliminacion(item)}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.nombre}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {item.descripcion}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A202C" />
        </TouchableOpacity>
        <View style={{flex:1, alignItems:'center', marginRight: 40}}> 
          <Text style={styles.headerTitle}>Mis Favoritos</Text>
          <Text style={styles.headerSubtitle}>
            {usuario ? `${favoritos.length} destinos guardados` : 'Tu lista de deseos'}
          </Text>
        </View>
      </View>

      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Fondo ligeramente gris
  },
  
  // HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A202C' },
  headerSubtitle: { fontSize: 12, color: '#718096', marginTop: 2 },

  // CONTENT
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },

  // STATES (Loading, Empty)
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: { marginTop: 15, color: '#718096', fontWeight: '500' },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#2D3748', marginTop: 20, marginBottom: 10 },
  emptyText: { textAlign: 'center', color: '#718096', lineHeight: 22, marginBottom: 30 },
  btnPrimary: {
    backgroundColor: '#FF6B00',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnText: { color: 'white', fontWeight: '700', fontSize: 16 },

  // CARDS
  card: {
    width: CARD_WIDTH,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  imageContainer: {
    height: 140,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2D3748',
    textTransform: 'uppercase',
  },
  deleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: '#718096',
    lineHeight: 18,
    height: 36, // Altura fija para alineación (2 líneas aprox)
  },
});