import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as API from '../services/api';

const { width } = Dimensions.get('window');

export default function FavoritosPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [favoritos, setFavoritos] = useState([]);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const userInfo = await API.getUserInfo();
      setUsuario(userInfo);
      
      if (userInfo) {
        const favs = await API.getFavorites();
        setFavoritos(favs);
      }
    } catch (error) {
      console.error('Error cargando favoritos:', error);
      Alert.alert("Error", "No se pudieron cargar los favoritos");
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminacion = (id) => {
    Alert.alert(
      "Eliminar favorito",
      "¿Estás seguro que quieres sacar este lugar de tu lista?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: () => eliminarFavorito(id) 
        }
      ]
    );
  };

  const eliminarFavorito = async (id) => {
    try {
      const success = await API.removeFavorite(id);
      if (success) {
        setFavoritos(prev => prev.filter(item => item.id !== id));
        Alert.alert("Éxito", "Favorito eliminado");
      } else {
        Alert.alert("Error", "No se pudo eliminar el favorito");
      }
    } catch (error) {
      console.error('Error eliminando favorito:', error);
      Alert.alert("Error", "No se pudo eliminar el favorito");
    }
  };

  const irAExplorar = () => {
    router.push('/lugares');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Mi Lista de Deseos</Text>
          <Text style={styles.headerSubtitle}>Tus futuros destinos</Text>
        </View>
        <View style={{width: 40}} /> 
      </View>

      {/* CONTENIDO */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#ff6b00" />
          <Text style={styles.loadingText}>Cargando tu colección...</Text>
        </View>
      ) : !usuario ? (
        // ESTADO: NO LOGUEADO
        <View style={styles.centerContainer}>
          <Text style={styles.iconLarge}>🔒</Text>
          <Text style={styles.stateTitle}>Colección Privada</Text>
          <Text style={styles.stateText}>Inicia sesión para ver tus destinos guardados.</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/login')}>
            <Text style={styles.btnText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      ) : favoritos.length === 0 ? (
        // ESTADO: VACÍO
        <View style={styles.centerContainer}>
          <Text style={styles.iconLarge}>💔</Text>
          <Text style={styles.stateTitle}>Tu lista está vacía</Text>
          <Text style={styles.stateText}>Explora lugares y dale al corazón para guardarlos aquí.</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={irAExplorar}>
            <Text style={styles.btnText}>Explorar Lugares</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // ESTADO: CON FAVORITOS (GRID)
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {favoritos.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => Alert.alert("Detalle", `Ver detalle de ${item.nombre}`)}
              >
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: item.imagen_url || 'https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?auto=format&fit=crop&w=800&q=80' }} 
                    style={styles.cardImage} 
                  />
                  
                  {/* Badge Categoría */}
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.categoria || 'General'}</Text>
                  </View>

                  {/* Botón Eliminar Flotante */}
                  <TouchableOpacity 
                    style={styles.deleteBtn} 
                    onPress={(e) => {
                      e.stopPropagation();
                      confirmarEliminacion(item.id);
                    }}
                  >
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.nombre}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {item.descripcion || 'Sin descripción disponible'}
                  </Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.seeMore}>Ver detalles →</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: { padding: 5, marginRight: 15 },
  backArrow: { fontSize: 24, color: '#2d3748' },
  headerTitleContainer: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1a202c' },
  headerSubtitle: { fontSize: 12, color: '#718096' },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: { marginTop: 15, color: '#718096' },
  iconLarge: { fontSize: 60, marginBottom: 20 },
  stateTitle: { fontSize: 22, fontWeight: '700', color: '#2d3748', marginBottom: 10 },
  stateText: { textAlign: 'center', color: '#718096', marginBottom: 30, lineHeight: 22 },
  btnPrimary: {
    backgroundColor: '#ff6b00',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#ff6b00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  scrollContent: {
    padding: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: (width - 55) / 2,
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    overflow: 'hidden',
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
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2d3748',
    textTransform: 'uppercase',
  },
  deleteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  deleteIcon: {
    fontSize: 14,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 5,
  },
  cardDesc: {
    fontSize: 12,
    color: '#718096',
    lineHeight: 16,
    marginBottom: 10,
    height: 32,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  seeMore: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ff6b00',
  }
});