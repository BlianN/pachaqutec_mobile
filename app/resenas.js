import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as API from '../services/api';

const { width } = Dimensions.get('window');

export default function ResenasPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [resenas, setResenas] = useState([]);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const userInfo = await API.getUserInfo();
      setUsuario(userInfo);
      
      if (userInfo) {
        const reviews = await API.getMyReviews();
        setResenas(reviews);
      }
    } catch (error) {
      console.error('Error cargando reseñas:', error);
      Alert.alert("Error", "No se pudieron cargar las reseñas");
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fechaString) => {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fechaString).toLocaleDateString('es-ES', opciones);
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
          <Text style={styles.headerSubtitle}>TU DIARIO DE VIAJES</Text>
          <Text style={styles.headerTitle}>Mis Reseñas</Text>
        </View>
        <View style={{width: 40}} /> 
      </View>

      {/* CONTENIDO */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#ff6b00" />
          <Text style={styles.loadingText}>Recuperando tus experiencias...</Text>
        </View>
      ) : !usuario ? (
        // NO LOGUEADO
        <View style={styles.centerContainer}>
          <Text style={styles.iconLarge}>🔒</Text>
          <Text style={styles.stateTitle}>Acceso Restringido</Text>
          <Text style={styles.stateText}>Inicia sesión para acceder a tu historial de reseñas.</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/login')}>
            <Text style={styles.btnText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      ) : resenas.length === 0 ? (
        // SIN RESEÑAS
        <View style={styles.centerContainer}>
          <Text style={styles.iconLarge}>🔭</Text>
          <Text style={styles.stateTitle}>Aún no hay historias</Text>
          <Text style={styles.stateText}>¡Explora lugares y comparte tu experiencia con la comunidad!</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/lugares')}>
            <Text style={styles.btnText}>Explorar Lugares</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // LISTA DE RESEÑAS
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {resenas.map((item) => (
            <View key={item.id} style={styles.card}>
              {/* Header de la Tarjeta */}
              <View style={styles.cardHeader}>
                <Image 
                  source={{ 
                    uri: item.lugar_imagen || 'https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?auto=format&fit=crop&w=800&q=80' 
                  }} 
                  style={styles.placeImage} 
                />
                <View style={styles.headerInfo}>
                  <Text style={styles.placeName}>{item.lugar_nombre || 'Lugar desconocido'}</Text>
                  <Text style={styles.reviewDate}>{formatearFecha(item.created_at)}</Text>
                </View>
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>Visitado</Text>
                </View>
              </View>

              {/* Cuerpo de la Reseña */}
              <View style={styles.cardBody}>
                {/* Estrellas */}
                <View style={styles.ratingContainer}>
                  {[...Array(5)].map((_, i) => (
                    <Text key={i} style={[styles.star, i < item.calificacion ? styles.starFilled : styles.starEmpty]}>
                      ★
                    </Text>
                  ))}
                  <Text style={styles.ratingNumber}>{item.calificacion}/5</Text>
                </View>

                {/* Texto */}
                <View style={styles.textContainer}>
                  <Text style={styles.quoteMark}>"</Text>
                  <Text style={styles.reviewText}>{item.texto}</Text>
                </View>
              </View>
            </View>
          ))}
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2025 PachaQutec Mobile</Text>
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  backBtn: { padding: 5, marginRight: 15 },
  backArrow: { fontSize: 24, color: '#2d3748' },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  headerSubtitle: { fontSize: 10, fontWeight: '700', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1a202c' },

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
    paddingBottom: 40,
  },
  
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  placeImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  badgeContainer: {
    backgroundColor: '#f0fdf4',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803d',
    textTransform: 'uppercase',
  },

  cardBody: {
    padding: 20,
    paddingTop: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  star: {
    fontSize: 18,
    marginRight: 2,
  },
  starFilled: { color: '#fbbf24' },
  starEmpty: { color: '#e2e8f0' },
  ratingNumber: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  
  textContainer: {
    flexDirection: 'row',
  },
  quoteMark: {
    fontSize: 40,
    color: '#ffedd5',
    position: 'absolute',
    top: -15,
    left: -10,
    zIndex: -1,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#334155',
    fontStyle: 'italic',
  },

  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#cbd5e1',
    fontSize: 12,
  }
});