import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  StatusBar,
  Dimensions,
  Alert
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as API from '../services/api';

const { width } = Dimensions.get('window');

export default function ResenasPage() {
  const router = useRouter();
  
  // --- ESTADOS ---
  const [loading, setLoading] = useState(true);
  const [resenas, setResenas] = useState([]);
  const [usuario, setUsuario] = useState(null);

  // --- CARGAR DATOS AL ENTRAR ---
  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  const cargarDatos = async () => {
    try {
      setLoading(true);
      // 1. Verificar usuario
      const userInfo = await API.getUserInfo().catch(() => null);
      setUsuario(userInfo);

      // 2. Si hay usuario, cargar sus reseñas
      if (userInfo) {
        // CORRECCIÓN AQUÍ: Usamos la función exacta de tu api.js
        const reviews = await API.getMyReviews(); 
        console.log('✅ Reseñas cargadas:', reviews);
        
        // Aseguramos que sea un array
        setResenas(Array.isArray(reviews) ? reviews : []);
      } else {
        setResenas([]);
      }
    } catch (error) {
      console.error('Error cargando reseñas:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- HELPER FECHA ---
  const formatearFecha = (fechaString) => {
    if (!fechaString) return "Reciente";
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fechaString).toLocaleDateString('es-ES', opciones);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* HEADER ESTÉTICO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#2d3748" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSubtitle}>TU DIARIO DE VIAJES</Text>
          <Text style={styles.headerTitle}>Mis Reseñas</Text>
        </View>
      </View>

      {/* CONTENIDO PRINCIPAL */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#ff6b00" />
          <Text style={styles.loadingText}>Recuperando tus experiencias...</Text>
        </View>
      ) : !usuario ? (
        // --- ESTADO: NO LOGUEADO (CANDADO) ---
        <View style={styles.centerContainer}>
          <Ionicons name="lock-closed-outline" size={80} color="#CBD5E0" style={{marginBottom: 20}} />
          <Text style={styles.stateTitle}>Acceso Restringido</Text>
          <Text style={styles.stateText}>
            Inicia sesión para acceder a tu historial de opiniones y contribuciones.
          </Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/login')}>
            <Text style={styles.btnText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      ) : resenas.length === 0 ? (
        // --- ESTADO: SIN RESEÑAS (BUZÓN VACÍO) ---
        <View style={styles.centerContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={80} color="#CBD5E0" style={{marginBottom: 20}} />
          <Text style={styles.stateTitle}>Aún no hay historias</Text>
          <Text style={styles.stateText}>
            ¡Tu opinión vale oro! Explora lugares y comparte tu experiencia con la comunidad.
          </Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/lugares')}>
            <Text style={styles.btnText}>Explorar Lugares</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // --- LISTA DE RESEÑAS (TARJETAS) ---
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {resenas.map((item) => (
            <View key={item.id} style={styles.card}>
              
              {/* Header de la Tarjeta */}
              <View style={styles.cardHeader}>
                <Image 
                  source={{ uri: item.lugar_imagen || 'https://via.placeholder.com/100' }} 
                  style={styles.placeImage} 
                />
                <View style={styles.headerInfo}>
                  <Text style={styles.placeName} numberOfLines={1}>{item.lugar_nombre}</Text>
                  <Text style={styles.reviewDate}>{formatearFecha(item.created_at)}</Text>
                </View>
                
                {/* Badge Visitado */}
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>Visitado</Text>
                </View>
              </View>

              {/* Cuerpo de la Reseña */}
              <View style={styles.cardBody}>
                {/* Estrellas */}
                <View style={styles.ratingContainer}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons 
                      key={i} 
                      name={i < item.calificacion ? "star" : "star-outline"} 
                      size={18} 
                      color={i < item.calificacion ? "#FBBF24" : "#E2E8F0"}
                      style={{ marginRight: 2 }}
                    />
                  ))}
                  <Text style={styles.ratingNumber}>{item.calificacion}/5</Text>
                </View>

                {/* Texto con Comillas Decorativas */}
                <View style={styles.textContainer}>
                  <Text style={styles.quoteMark}>“</Text>
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

      {/* BOTÓN FLOTANTE PARA AGREGAR NUEVA (Solo si hay usuario) */}
      {usuario && (
        <TouchableOpacity
          style={styles.fabButton}
          activeOpacity={0.8}
          onPress={() => {
            Alert.alert(
              "Nueva Reseña",
              "Para escribir una reseña, ve a la sección Lugares y elige uno.",
              [
                { text: "Cancelar", style: "cancel" },
                { text: "Ir a Lugares", onPress: () => router.push('/lugares') }
              ]
            );
          }}
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // HEADER
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  backBtn: { padding: 5, marginRight: 15 },
  headerTitleContainer: { flex: 1, alignItems: 'center', marginRight: 40 },
  headerSubtitle: { fontSize: 10, fontWeight: '700', color: '#A0AEC0', textTransform: 'uppercase', letterSpacing: 1.2 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A202C' },

  // STATES
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: { marginTop: 15, color: '#718096', fontWeight: '500' },
  stateTitle: { fontSize: 22, fontWeight: '700', color: '#2D3748', marginBottom: 10, textAlign: 'center' },
  stateText: { textAlign: 'center', color: '#718096', marginBottom: 30, lineHeight: 24, fontSize: 15 },
  btnPrimary: {
    backgroundColor: '#FF6B00',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  // CONTENT
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Espacio para el FAB
  },
  
  // CARD ESTILO PREMIUM
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
    borderColor: '#F1F5F9',
  },
  
  // Card Header
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    backgroundColor: '#FFFFFF',
  },
  placeImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  headerInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  badgeContainer: {
    backgroundColor: '#F0FDF4',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
    textTransform: 'uppercase',
  },

  // Card Body
  cardBody: {
    padding: 20,
    paddingTop: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingNumber: {
    marginLeft: 10,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  
  textContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  quoteMark: {
    fontSize: 50,
    color: '#FFEDD5', // Color naranja muy suave
    position: 'absolute',
    top: -25,
    left: -10,
    zIndex: -1,
    //fontFamily: 'serif', // A veces 'serif' da warning en Android si no está linkeada, mejor default
  },
  reviewText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
    fontStyle: 'italic',
  },

  // FOOTER & FAB
  footer: {
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  fabButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});