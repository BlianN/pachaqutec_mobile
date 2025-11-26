import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ImageBackground, 
  StatusBar, 
  Dimensions,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as API from '../services/api';

const { width } = Dimensions.get('window');

export default function ForYouPage() {
  const router = useRouter();
  
  // --- ESTADOS ---
  const [usuario, setUsuario] = useState(null);
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Inicio');

  // Estados para Modal Reseña
  const [modalResenaVisible, setModalResenaVisible] = useState(false);
  const [lugarSeleccionado, setLugarSeleccionado] = useState(null);
  const [calificacion, setCalificacion] = useState(5);
  const [textoResena, setTextoResena] = useState('');
  const [enviandoResena, setEnviandoResena] = useState(false);

  // Estados para Favoritos
  const [favoritosIds, setFavoritosIds] = useState(new Set());

  // --- CARGA INICIAL ---
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // 1. Usuario
      const userInfo = await API.getUserInfo().catch(() => null);
      setUsuario(userInfo);

      // 2. Lugares (Trae TODO de la base de datos)
      const dataLugares = await API.getTouristLocations();
      if (Array.isArray(dataLugares)) {
        // Eliminamos duplicados por ID
        const unicos = dataLugares.filter((v,i,a)=>a.findIndex(t=>(t.id===v.id))===i);
        setLugares(unicos);
      }

      // 3. Favoritos
      if (userInfo) {
        const dataFavs = await API.getFavorites();
        const ids = new Set(dataFavs.map(f => f.id || f.lugar_id));
        setFavoritosIds(ids);
      }

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- AGRUPACIÓN DINÁMICA (Aquí está la magia) ---
  const lugaresPorCategoria = useMemo(() => {
    const grupos = {};
    lugares.forEach(lugar => {
      // Si el backend dice "Religioso", crea esa categoría
      const catNombre = lugar.categoria || "General";
      
      if (!grupos[catNombre]) {
        grupos[catNombre] = [];
      }
      grupos[catNombre].push(lugar);
    });
    return grupos;
  }, [lugares]);

  // --- HELPER DE ICONOS INTELIGENTE ---
  const getCategoryIcon = (nombreCategoria) => {
    const cat = nombreCategoria.toLowerCase();
    if (cat.includes('gastr') || cat.includes('comida')) return '🍲';
    if (cat.includes('avent') || cat.includes('deport')) return '🧗';
    if (cat.includes('hist') || cat.includes('arq')) return '🏛️';
    if (cat.includes('relig') || cat.includes('iglesia')) return '⛪'; // Catedrales
    if (cat.includes('mirador') || cat.includes('vista')) return '🔭'; // Yanahuara
    if (cat.includes('natur') || cat.includes('camp')) return '🌿';    // Campiña
    if (cat.includes('cult') || cat.includes('museo')) return '🎭';    // Museos
    if (cat.includes('noct') || cat.includes('fiesta')) return '🍸';   // Vida nocturna
    return '🌎'; // Default para otros
  };

  // --- ACCIONES ---
  const handleLogout = async () => {
    Alert.alert("Cerrar Sesión", "¿Seguro que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: async () => {
          await API.logout();
          router.replace('/login');
      }}
    ]);
  };

  const toggleFavorito = async (lugar) => {
    if (!usuario) {
      Alert.alert("Atención", "Inicia sesión para guardar favoritos.");
      return;
    }
    const esFavorito = favoritosIds.has(lugar.id);
    const nuevasIds = new Set(favoritosIds);
    
    if (esFavorito) {
        Alert.alert("Aviso", "Ve a la sección Favoritos para gestionar tu lista.");
    } else {
        nuevasIds.add(lugar.id);
        setFavoritosIds(nuevasIds);
        try {
            await API.addFavorite(lugar.id);
        } catch(e) {
            nuevasIds.delete(lugar.id);
            setFavoritosIds(nuevasIds);
        }
    }
  };

  const abrirModalResena = (lugar) => {
    if (!usuario) {
        Alert.alert("Atención", "Inicia sesión para escribir reseñas.");
        return;
    }
    setLugarSeleccionado(lugar);
    setModalResenaVisible(true);
    setCalificacion(5);
    setTextoResena('');
  };

  const enviarResena = async () => {
    if (!textoResena.trim()) {
        Alert.alert("Falta texto", "Por favor escribe tu opinión.");
        return;
    }
    setEnviandoResena(true);
    try {
        await API.createReview(lugarSeleccionado.id, calificacion, textoResena);
        Alert.alert("¡Éxito!", "Tu reseña se ha publicado.");
        setModalResenaVisible(false);
    } catch(e) {
        Alert.alert("Error", "No se pudo enviar la reseña.");
    } finally {
        setEnviandoResena(false);
    }
  };

  const renderStars = () => (
    <View style={styles.starsContainer}>
        {[1,2,3,4,5].map(star => (
            <TouchableOpacity key={star} onPress={() => setCalificacion(star)}>
                <Ionicons 
                    name={star <= calificacion ? "star" : "star-outline"} 
                    size={32} 
                    color="#FFB800" 
                />
            </TouchableOpacity>
        ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.mountainIcon} />
          <Text style={styles.logoText}>
            <Text style={{color:'#1A202C'}}>Pacha</Text>
            <Text style={{color:'#FF6B00'}}>Qutec</Text>
          </Text>
        </View>
        
        {usuario && (
            <View style={styles.userBadge}>
                <Text style={styles.userText}>Hola, {usuario.nombre}</Text>
            </View>
        )}
      </View>

      {/* MENÚ DE NAVEGACIÓN */}
      <View style={styles.navWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navScroll}>
            {[
                {id:'Inicio', ruta: null},
                {id:'Lugares', ruta: '/lugares'},
                {id:'Favoritos', ruta: '/favoritos'},
                {id:'Rutas', ruta: '/rutas'},
                {id:'Reseñas', ruta: '/resenas'},
                {id:'Contacto', ruta: '/contactanos'},
            ].map(item => (
                <TouchableOpacity 
                    key={item.id} 
                    style={[styles.navPill, activeTab === item.id && styles.navPillActive]}
                    onPress={() => {
                        setActiveTab(item.id);
                        if(item.ruta) router.push(item.ruta);
                    }}
                >
                    <Text style={[styles.navText, activeTab === item.id && styles.navTextActive]}>
                        {item.id}
                    </Text>
                </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
                style={[styles.navPill, styles.rdfPill]} 
                onPress={() => Alert.alert("Web Semántica", "Visualizador RDF próximamente.")}
            >
                <Text style={styles.rdfText}>🌐 RDF</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navPill} onPress={handleLogout}>
                <Text style={styles.logoutText}>Salir</Text>
            </TouchableOpacity>
        </ScrollView>
      </View>

      {/* CONTENIDO PRINCIPAL */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        
        {/* HERO BANNER */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/lugares')}>
            <ImageBackground
                source={{ uri: 'https://www.peru.travel/Contenido/Atractivo/Imagen/es/8/1.2/Principal/Ca%C3%B1on%20del%20Colca.jpg' }}
                style={styles.heroBanner}
                imageStyle={{ borderRadius: 20 }}
            >
                <LinearGradient 
                    colors={['transparent', 'rgba(0,0,0,0.8)']} 
                    style={styles.heroOverlay}
                >
                    <Text style={styles.heroSubtitle}>DESTINO DESTACADO</Text>
                    <Text style={styles.heroTitle}>Cañón del Colca</Text>
                    <View style={styles.heroBtn}>
                        <Text style={styles.heroBtnText}>Explorar ahora</Text>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏛️ Descubre Arequipa</Text>
            <Text style={styles.sectionDesc}>Explora los tesoros escondidos de la ciudad blanca</Text>
        </View>

        {loading ? (
            <ActivityIndicator size="large" color="#FF6B00" style={{marginTop: 50}} />
        ) : (
            /* RENDERIZADO DINÁMICO DE TODAS LAS CATEGORÍAS */
            Object.keys(lugaresPorCategoria).map((categoria) => (
                <View key={categoria} style={styles.categoryBlock}>
                    
                    {/* Cabecera de Categoría */}
                    <View style={styles.catHeader}>
                        <View style={styles.catInfo}>
                            {/* Icono Inteligente */}
                            <View style={styles.catIcon}>
                                <Text style={{fontSize: 22}}>
                                    {getCategoryIcon(categoria)}
                                </Text>
                            </View>
                            <View>
                                <Text style={styles.catName}>{categoria}</Text>
                                <Text style={styles.catSub}>Explora lo mejor en {categoria}</Text>
                            </View>
                        </View>
                        <View style={styles.catBadge}>
                            <Text style={styles.catBadgeText}>{lugaresPorCategoria[categoria].length} lugares</Text>
                        </View>
                    </View>

                    {/* Carrusel Horizontal */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.placesRow}>
                        {lugaresPorCategoria[categoria].map((lugar) => (
                            <TouchableOpacity 
                                key={lugar.id} 
                                style={styles.placeCard}
                                activeOpacity={0.9}
                                onPress={() => {
                                    // Enviamos el filtro correcto a la página de lugares
                                    router.push({ 
                                      pathname: '/lugares', 
                                      params: { 
                                        filtro_categoria: lugar.categoria_id,
                                        nombre_categoria: categoria
                                      } 
                                    });
                                }}
                            >
                                <ImageBackground 
                                    source={{ uri: lugar.imagen_url }} 
                                    style={styles.placeImage}
                                    imageStyle={{ borderRadius: 16 }}
                                >
                                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.placeOverlay}>
                                        <Text style={styles.placeName} numberOfLines={1}>{lugar.nombre}</Text>
                                        <Text style={styles.placeCta}>Ver detalles</Text>
                                    </LinearGradient>

                                    <TouchableOpacity 
                                        style={styles.heartBtn}
                                        onPress={() => toggleFavorito(lugar)}
                                    >
                                        <Ionicons 
                                            name={favoritosIds.has(lugar.id) ? "heart" : "heart-outline"} 
                                            size={18} 
                                            color={favoritosIds.has(lugar.id) ? "#FF4757" : "white"} 
                                        />
                                    </TouchableOpacity>
                                </ImageBackground>

                                <TouchableOpacity 
                                    style={styles.quickReviewBtn}
                                    onPress={() => abrirModalResena(lugar)}
                                >
                                    <Text style={styles.quickReviewText}>✍️ Escribir reseña</Text>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                </View>
            ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ASISTENTE FLOTANTE */}
      <TouchableOpacity 
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => Alert.alert("PachaBot", "¡Hola! Soy tu asistente virtual de Arequipa. Pronto estaré listo para chatear.")}
      >
        <LinearGradient colors={['#ff6b00', '#ff9100']} style={styles.fabGradient}>
            <Ionicons name="chatbubble-ellipses" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>

      {/* MODAL DE RESEÑA */}
      <Modal
        visible={modalResenaVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalResenaVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Nueva Reseña</Text>
                    <TouchableOpacity onPress={() => setModalResenaVisible(false)}>
                        <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
                
                <Text style={styles.modalSubtitle}>
                    Opinando sobre <Text style={{fontWeight:'bold'}}>{lugarSeleccionado?.nombre}</Text>
                </Text>

                {renderStars()}

                <TextInput 
                    style={styles.textArea}
                    placeholder="Cuéntanos tu experiencia..."
                    multiline
                    numberOfLines={4}
                    value={textoResena}
                    onChangeText={setTextoResena}
                />

                <View style={styles.modalButtons}>
                    <TouchableOpacity 
                        style={styles.btnCancel} 
                        onPress={() => setModalResenaVisible(false)}
                    >
                        <Text style={styles.btnCancelText}>Cancelar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.btnSubmit}
                        onPress={enviarResena}
                        disabled={enviandoResena}
                    >
                        {enviandoResena ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.btnSubmitText}>Publicar</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  
  // HEADER
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.95)', borderBottomWidth: 1, borderBottomColor: '#F1F5F9'
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mountainIcon: { width: 28, height: 28, backgroundColor: '#FF6B00', borderRadius: 4, transform: [{rotate:'45deg'}] },
  logoText: { fontSize: 20, fontWeight: '800' },
  userBadge: { backgroundColor: '#EDF2F7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  userText: { fontSize: 12, fontWeight: '600', color: '#2D3748' },

  // NAV SCROLL
  navWrapper: { height: 60, backgroundColor: 'white', shadowColor:'#000', shadowOpacity:0.05, shadowOffset:{width:0,height:2}, elevation:2 },
  navScroll: { paddingHorizontal: 15, alignItems: 'center', gap: 10 },
  navPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  navPillActive: { backgroundColor: '#FFF5EB' },
  navText: { fontWeight: '600', color: '#718096' },
  navTextActive: { color: '#FF6B00' },
  rdfPill: { backgroundColor: '#667eea', paddingHorizontal: 14 },
  rdfText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  logoutText: { color: '#E53E3E', fontWeight: '600' },

  // CONTENT
  mainContent: { padding: 20 },
  
  // HERO
  heroBanner: { height: 240, width: '100%', marginBottom: 30, shadowColor:'#000', shadowOpacity:0.2, shadowRadius:10, elevation:5 },
  heroOverlay: { flex:1, borderRadius: 20, padding: 20, justifyContent: 'flex-end' },
  heroSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 5, textTransform: 'uppercase' },
  heroTitle: { color: 'white', fontSize: 28, fontWeight: '800', marginBottom: 15 },
  heroBtn: { backgroundColor: '#FF6B00', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, alignSelf: 'flex-start' },
  heroBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },

  // SECTION
  sectionHeader: { alignItems: 'center', marginBottom: 30 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#2D3748', marginBottom: 5 },
  sectionDesc: { fontSize: 13, color: '#718096' },

  // CATEGORY BLOCK
  categoryBlock: { marginBottom: 40 },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5 },
  catInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  catIcon: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#FFF5EB', alignItems: 'center', justifyContent: 'center' },
  catName: { fontSize: 18, fontWeight: '700', color: '#2D3748' },
  catSub: { fontSize: 12, color: '#A0AEC0' },
  catBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  catBadgeText: { fontSize: 11, fontWeight: '600', color: '#64748B' },

  placesRow: { paddingHorizontal: 5, gap: 20 },
  
  // CARDS
  placeCard: { width: 240, backgroundColor: 'white', borderRadius: 16, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:8, elevation:3 },
  placeImage: { width: '100%', height: 180, justifyContent: 'flex-end' },
  placeOverlay: { padding: 15, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  placeName: { color: 'white', fontSize: 16, fontWeight: '700', textShadowColor:'rgba(0,0,0,0.5)', textShadowRadius:3 },
  placeCta: { color: '#FF6B00', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginTop: 4 },
  heartBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.9)', padding: 8, borderRadius: 20 },
  
  quickReviewBtn: { padding: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  quickReviewText: { color: '#667EEA', fontWeight: '600', fontSize: 13 },

  // FAB
  fab: { position: 'absolute', bottom: 30, right: 20, width: 60, height: 60, borderRadius: 30, shadowColor:'#FF6B00', shadowOpacity:0.4, shadowRadius:10, elevation:10 },
  fabGradient: { width: '100%', height: '100%', borderRadius: 30, alignItems: 'center', justifyContent: 'center' },

  // MODAL
  modalOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', padding: 20 },
  modalCard: { backgroundColor:'white', borderRadius: 20, padding: 25 },
  modalHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight:'700', color:'#2D3748' },
  modalSubtitle: { fontSize: 14, color:'#718096', marginBottom: 20, textAlign:'center' },
  starsContainer: { flexDirection:'row', justifyContent:'center', gap: 10, marginBottom: 20 },
  textArea: { backgroundColor:'#F7FAFC', borderRadius: 12, padding: 15, height: 100, textAlignVertical:'top', marginBottom: 20, borderWidth:1, borderColor:'#E2E8F0' },
  modalButtons: { flexDirection:'row', gap: 15 },
  btnCancel: { flex:1, padding: 12, backgroundColor:'#EDF2F7', borderRadius: 10, alignItems:'center' },
  btnCancelText: { color:'#4A5568', fontWeight:'600' },
  btnSubmit: { flex:1, padding: 12, backgroundColor:'#667EEA', borderRadius: 10, alignItems:'center' },
  btnSubmitText: { color:'white', fontWeight:'600' },
});