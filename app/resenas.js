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
import { LinearGradient } from 'expo-linear-gradient';
// Importación correcta de la API
import * as API from '../services/api';

const { width } = Dimensions.get('window');

export default function ResenasPage() {
  const router = useRouter();
  
  // --- ESTADOS ---
  const [loading, setLoading] = useState(true);
  const [resenas, setResenas] = useState([]);
  const [usuario, setUsuario] = useState(null);

  // --- CARGAR DATOS ---
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
        const reviews = await API.getMyReviews(); 
        // Validamos que sea un array para evitar errores
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
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* HEADER DARK */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSubtitle}>DIARIO DE VIAJES</Text>
          <Text style={styles.headerTitle}>Mis Reseñas</Text>
        </View>
        <View style={{width: 24}} /> 
      </View>

      {/* CONTENIDO PRINCIPAL */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#ff6b00" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      ) : !usuario ? (
        <View style={styles.centerContainer}>
          <Ionicons name="lock-closed-outline" size={80} color="#333" style={{marginBottom: 20}} />
          <Text style={styles.stateTitle}>Acceso Restringido</Text>
          <Text style={styles.stateText}>
            Inicia sesión para ver tu historial.
          </Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/login')}>
            <Text style={styles.btnText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      ) : resenas.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={80} color="#333" style={{marginBottom: 20}} />
          <Text style={styles.stateTitle}>Sin Reseñas</Text>
          <Text style={styles.stateText}>
            Tu opinión vale oro. Explora y comenta.
          </Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/lugares')}>
            <Text style={styles.btnText}>Explorar Lugares</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.introContainer}>
             <Text style={styles.introTitle}>Tu Historial</Text>
             <Text style={styles.introSubtitle}>{resenas.length} aventuras compartidas</Text>
          </View>

          {resenas.map((item) => (
            <View key={item.id} style={styles.card}>
              
              {/* Header de la Tarjeta (Imagen del Lugar) */}
              <View style={styles.cardHeader}>
                <Image 
                  source={{ uri: item.lugar_imagen || 'https://via.placeholder.com/150' }} 
                  style={styles.placeImage} 
                />
                <LinearGradient 
                   colors={['transparent', 'rgba(0,0,0,0.8)']} 
                   style={styles.imageOverlay} 
                />
                <View style={styles.placeInfoOverlay}>
                   <Text style={styles.placeName} numberOfLines={1}>{item.lugar_nombre}</Text>
                   <Text style={styles.reviewDate}>{formatearFecha(item.created_at)}</Text>
                </View>
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>Visitado</Text>
                </View>
              </View>

              {/* Cuerpo de la Reseña */}
              <View style={styles.cardBody}>
                {/* Estrellas */}
                <View style={styles.ratingRow}>
                  <View style={styles.starsContainer}>
                    {[...Array(5)].map((_, i) => (
                        <Ionicons 
                        key={i} 
                        name={i < item.calificacion ? "star" : "star-outline"} 
                        size={16} 
                        color={i < item.calificacion ? "#ffd700" : "#444"}
                        style={{ marginRight: 2 }}
                        />
                    ))}
                  </View>
                  <View style={styles.ratingPill}>
                     <Text style={styles.ratingPillText}>{item.calificacion}/5</Text>
                  </View>
                </View>

                {/* Texto */}
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

      {/* BOTÓN FLOTANTE */}
      {usuario && (
        <TouchableOpacity
          style={styles.fabButton}
          activeOpacity={0.8}
          onPress={() => {
            Alert.alert(
              "Nueva Reseña",
              "Ve a la sección Lugares y elige uno para opinar.",
              [
                { text: "Cancelar", style: "cancel" },
                { text: "Ir a Lugares", onPress: () => router.push('/lugares') }
              ]
            );
          }}
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ESTILOS DARK PREMIUM
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505', // Fondo Negro
  },
  
  // HEADER
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20,
    backgroundColor: 'rgba(15, 15, 15, 0.95)', borderBottomWidth: 1, borderBottomColor: '#333'
  },
  backBtn: { padding: 8, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)' },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  headerSubtitle: { fontSize: 10, fontWeight: '700', color: '#ff6b00', textTransform: 'uppercase', letterSpacing: 1.5 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#a0a0a0' },

  // STATES
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 15, color: '#a0a0a0', fontWeight: '500' },
  stateTitle: { fontSize: 22, fontWeight: '700', color: 'white', marginBottom: 10, textAlign: 'center' },
  stateText: { textAlign: 'center', color: '#888', marginBottom: 30, lineHeight: 24, fontSize: 15 },
  btnPrimary: { backgroundColor: '#ff6b00', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, elevation: 4 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  // CONTENT
  scrollContent: { padding: 20, paddingBottom: 100 },
  introContainer: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  introTitle: { fontSize: 24, fontWeight: '800', color: 'white', marginBottom: 5 },
  introSubtitle: { fontSize: 14, color: '#a0a0a0' },
  
  // CARD
  card: {
    backgroundColor: '#121212', borderRadius: 20, marginBottom: 25, overflow: 'hidden',
    borderWidth: 1, borderColor: '#2a2a2a',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 5
  },
  cardHeader: { height: 180, position: 'relative' },
  placeImage: { width: '100%', height: '100%' },
  imageOverlay: { ...StyleSheet.absoluteFillObject },
  placeInfoOverlay: { position: 'absolute', bottom: 15, left: 15, right: 15 },
  placeName: { fontSize: 20, fontWeight: '800', color: 'white', textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 4 },
  reviewDate: { fontSize: 12, color: '#ccc', marginTop: 2, fontStyle: 'italic' },
  badgeContainer: { position: 'absolute', top: 15, left: 15, backgroundColor: 'rgba(0,0,0,0.7)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20, borderWidth: 1, borderColor: '#ff6b00' },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#ff6b00', textTransform: 'uppercase' },

  cardBody: { padding: 20, borderLeftWidth: 3, borderLeftColor: '#ff6b00' },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  starsContainer: { flexDirection: 'row' },
  ratingPill: { backgroundColor: '#ffd700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  ratingPillText: { color: '#000', fontWeight: '800', fontSize: 12 },
  
  textContainer: { flexDirection: 'row', marginTop: 5 },
  quoteMark: { fontSize: 40, color: 'rgba(255,255,255,0.1)', position: 'absolute', top: -20, left: -10 },
  reviewText: { fontSize: 15, lineHeight: 24, color: '#ddd', fontStyle: 'italic', paddingLeft: 10 },

  // FOOTER & FAB
  footer: { alignItems: 'center', marginTop: 20, borderTopWidth: 1, borderTopColor: '#222', paddingTop: 20 },
  footerText: { color: '#444', fontSize: 12 },
  fabButton: { position: 'absolute', right: 20, bottom: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: '#ff6b00', alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: '#ff6b00', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowRadius: 10 },
});