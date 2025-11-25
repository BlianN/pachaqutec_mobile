import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  StatusBar,
  Alert,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as API from '../services/api';

const { width } = Dimensions.get('window');

export default function LugaresPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [lugares, setLugares] = useState([]);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const userInfo = await API.getUserInfo();
      setUsuario(userInfo);
      
      const data = await API.getTouristLocations();
      setLugares(data);
    } catch (error) {
      console.error('Error cargando lugares:', error);
      Alert.alert("Error", "No se pudieron cargar los lugares turísticos");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorito = async (lugarId) => {
    if (!usuario) {
      Alert.alert("Inicia sesión", "Debes iniciar sesión para guardar favoritos", [
        { text: "Cancelar", style: "cancel" },
        { text: "Iniciar sesión", onPress: () => router.push('/login') }
      ]);
      return;
    }

    try {
      // Aquí deberías verificar si ya es favorito y hacer add o remove
      await API.addFavorite(lugarId);
      Alert.alert("Éxito", "Lugar agregado a favoritos");
    } catch (error) {
      console.error('Error con favorito:', error);
      Alert.alert("Error", "No se pudo agregar a favoritos");
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ff6b00" />
        <Text style={styles.loadingText}>Cargando lugares turísticos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Lugares Turísticos</Text>
          <Text style={styles.headerSubtitle}>{lugares.length} destinos disponibles</Text>
        </View>
        <View style={{width: 40}} />
      </View>

      {/* CONTENIDO */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {lugares.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏔️</Text>
            <Text style={styles.emptyTitle}>No hay lugares disponibles</Text>
            <Text style={styles.emptyText}>Vuelve más tarde para descubrir nuevos destinos</Text>
          </View>
        ) : (
          lugares.map((lugar) => (
            <TouchableOpacity 
              key={lugar.id} 
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => Alert.alert(lugar.nombre, lugar.descripcion)}
            >
              <Image 
                source={{ 
                  uri: lugar.imagen_url || 'https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?auto=format&fit=crop&w=800&q=80' 
                }} 
                style={styles.cardImage} 
              />
              
              {/* Botón Favorito */}
              <TouchableOpacity 
                style={styles.favoriteBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  toggleFavorito(lugar.id);
                }}
              >
                <Text style={styles.favoriteIcon}>🤍</Text>
              </TouchableOpacity>

              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{lugar.nombre}</Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{lugar.categoria || 'General'}</Text>
                  </View>
                </View>
                
                <Text style={styles.cardDesc} numberOfLines={3}>
                  {lugar.descripcion || 'Sin descripción disponible'}
                </Text>

                {/* Info adicional */}
                {lugar.direccion && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>📍</Text>
                    <Text style={styles.infoText} numberOfLines={1}>{lugar.direccion}</Text>
                  </View>
                )}

                {lugar.horario && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>🕒</Text>
                    <Text style={styles.infoText}>{lugar.horario}</Text>
                  </View>
                )}

                <View style={styles.cardFooter}>
                  <LinearGradient
                    colors={['#ff6b00', '#ff8c00']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.btnDetails}
                  >
                    <Text style={styles.btnDetailsText}>Ver más →</Text>
                  </LinearGradient>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 40
  },
  loadingText: {
    marginTop: 15,
    color: '#718096',
    fontSize: 14
  },
  
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    paddingTop: 50, 
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2
  },
  backBtn: { padding: 5 },
  backArrow: { fontSize: 24, color: '#2d3748' },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1a202c' },
  headerSubtitle: { fontSize: 12, color: '#718096' },
  
  scrollContent: { 
    padding: 20,
    paddingBottom: 40
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 10
  },
  emptyText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center'
  },

  card: { 
    backgroundColor: 'white', 
    borderRadius: 20, 
    marginBottom: 25, 
    overflow: 'hidden', 
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardImage: { 
    width: '100%', 
    height: 200 
  },
  favoriteBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'white',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  favoriteIcon: {
    fontSize: 20
  },
  cardContent: { 
    padding: 20 
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  cardTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#2d3748',
    flex: 1,
    marginRight: 10
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ff6b00',
    textTransform: 'uppercase'
  },
  cardDesc: { 
    fontSize: 14, 
    color: '#718096', 
    lineHeight: 20,
    marginBottom: 15
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 8,
    width: 20
  },
  infoText: {
    fontSize: 13,
    color: '#4a5568',
    flex: 1
  },
  cardFooter: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 15
  },
  btnDetails: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2
  },
  btnDetailsText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14
  }
});