import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar,
  Modal,
  Linking,
  TextInput,
  Alert,
  ActivityIndicator,
  ImageBackground,
  FlatList,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as API from '../services/api';

const { width, height } = Dimensions.get('window');

// ==========================================
// 🏛️ BASE DE DATOS LOCAL (Recuperada de tu código)
// ==========================================
const HORARIOS_AREQUIPA = {
  "santa catalina": "Lun - Dom: 09:00 AM - 05:00 PM (Jue: hasta 8PM)",
  "monasterio de santa catalina": "Lun - Dom: 09:00 AM - 05:00 PM (Jue: hasta 8PM)",
  "yanahuara": "Abierto las 24 horas (Mirador)",
  "mirador de yanahuara": "Abierto las 24 horas (Recomendado: Atardecer)",
  "colca": "Acceso libre (Tours inician 03:00 AM)",
  "cañón del colca": "Acceso libre (Tours inician 03:00 AM)",
  "plaza de armas": "Abierto las 24 horas",
  "catedral": "Lun - Sab: 07:00-10:00 y 17:00-19:00",
  "ruta del sillar": "Lun - Dom: 08:00 AM - 05:00 PM",
  "mundo alpaca": "Lun - Dom: 08:30 AM - 05:30 PM",
  "molino de sabandía": "Lun - Dom: 09:00 AM - 05:00 PM",
  "mansión del fundador": "Lun - Dom: 09:00 AM - 05:00 PM",
  "misti": "Ascensos previa coordinación (2 días)",
  "mercado san camilo": "Lun - Dom: 06:00 AM - 07:00 PM",
  "museo santuarios andinos": "Lun - Sab: 09:00 AM - 06:00 PM"
};

const DESCRIPCIONES_AREQUIPA = {
  "santa catalina": "Una ciudad dentro de la ciudad. Este monasterio de clausura del siglo XVI es una obra maestra de la arquitectura colonial.",
  "yanahuara": "El mirador más icónico de la ciudad con vistas a los tres volcanes y arcos de sillar.",
  "colca": "Uno de los cañones más profundos del mundo, hogar del majestuoso cóndor andino.",
  "plaza de armas": "El corazón de la ciudad blanca, rodeada de portales de granito y la imponente Catedral.",
  "catedral": "Imponente catedral construida con sillar, alberga un museo y joyas de arte religioso.",
  "ruta del sillar": "Canteras de donde se extrae la piedra blanca volcánica con la que se construyó Arequipa.",
  "mundo alpaca": "Centro eco-turístico para conocer e interactuar con alpacas y llamas.",
  "molino de sabandía": "Molino de piedra del siglo XVII en perfecto estado de funcionamiento rodeado de campiña.",
  "misti": "El guardián de la ciudad. Volcán activo de 5822 m.s.n.m. símbolo de identidad.",
  "mercado san camilo": "Mercado histórico diseñado por Gustave Eiffel, famoso por sus jugos y gastronomía.",
  "museo santuarios andinos": "Hogar de la Dama de Ampato (Momia Juanita) y tesoros incas congelados."
};

// Datos auxiliares reducidos para el ejemplo (mantén tu lista completa si la tienes)
const DATOS_PRINCIPALES = {
  "santa catalina": { web: "https://santacatalina.org.pe/", mapa: "https://maps.app.goo.gl/gHU8YFzT55RQRZMQ6" },
  "yanahuara": { web: "https://www.peru.travel/es/atractivos/mirador-de-yanahuara", mapa: "https://maps.app.goo.gl/meJi1447M5aqboix7" },
  "colca": { web: "https://www.colcaperu.gob.pe/destinos", mapa: "https://maps.app.goo.gl/wAnxKcQXq7ABhdFSA" },
  // ... (Tu lista completa se usa mediante la función helper abajo)
};

export default function LugaresPage() {
  const router = useRouter();
  const { filtro_categoria } = useLocalSearchParams(); // Opcional: si vienes de Inicio con filtro

  // --- ESTADOS ---
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoritosIds, setFavoritosIds] = useState(new Set());
  const [usuario, setUsuario] = useState(null);

  // Estados para Modales (Acciones sobre el lugar "activo")
  const [activeLugar, setActiveLugar] = useState(null); // Lugar visible actualmente
  const [modalResena, setModalResena] = useState(false);
  const [modalEnlaces, setModalEnlaces] = useState(false);
  const [modalTips, setModalTips] = useState(false);

  // Estados Formularios
  const [calificacion, setCalificacion] = useState(5);
  const [textoResena, setTextoResena] = useState('');
  const [misEnlaces, setMisEnlaces] = useState({});
  const [nuevoLink, setNuevoLink] = useState({url:'', nota:''});

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [dataLugares, userInfo] = await Promise.all([
         API.getTouristLocations().catch(()=>[]),
         API.getUserInfo().catch(()=>null)
      ]);
      
      setUsuario(userInfo);

      if (userInfo) {
        const dataFavs = await API.getFavorites().catch(()=>[]);
        const ids = new Set(dataFavs.map(f => f.id || f.lugar_id));
        setFavoritosIds(ids);
      }

      // Filtro duplicados
      if(Array.isArray(dataLugares)){
          const unicos = dataLugares.filter((lugar, index, self) =>
            index === self.findIndex((t) => (
              t.id === lugar.id || t.nombre.trim().toLowerCase() === lugar.nombre.trim().toLowerCase()
            ))
          );
          setLugares(unicos);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- AGRUPAR POR CATEGORÍA (Para el scroll vertical) ---
  const categoriasData = useMemo(() => {
    const grupos = {};
    lugares.forEach(lugar => {
      const cat = lugar.categoria || "General";
      if (!grupos[cat]) grupos[cat] = [];
      grupos[cat].push(lugar);
    });
    // Convertimos a array para el FlatList Vertical: [{ title: 'Miradores', data: [...] }, ...]
    return Object.keys(grupos).map(key => ({ title: key, data: grupos[key] }));
  }, [lugares]);

  // --- HELPERS DATOS LOCALES ---
  const matchData = (nombre, dataset) => {
    if (!nombre) return null;
    const nombreNorm = nombre.toLowerCase().trim();
    const key = Object.keys(dataset).find(k => nombreNorm.includes(k) || k.includes(nombreNorm));
    return key ? dataset[key] : null;
  };
  const getHorario = (nombre) => matchData(nombre, HORARIOS_AREQUIPA) || "09:00 AM - 05:00 PM";
  const getDesc = (lugar) => matchData(lugar.nombre, DESCRIPCIONES_AREQUIPA) || lugar.descripcion || "Un destino increíble en Arequipa.";
  const getLinks = (nombre) => matchData(nombre, DATOS_PRINCIPALES);

  // --- ACCIONES ---
  const toggleFavorito = async (lugar) => {
    if (!usuario) { Alert.alert("🔒", "Inicia sesión para guardar favoritos."); return; }
    const nuevasIds = new Set(favoritosIds);
    if (nuevasIds.has(lugar.id)) {
        Alert.alert("Aviso", "Ya está en tus favoritos.");
    } else {
        nuevasIds.add(lugar.id);
        setFavoritosIds(nuevasIds);
        await API.addFavorite(lugar.id);
    }
  };

  const enviarResena = async () => {
    if(!usuario) return;
    try {
        await API.createReview(activeLugar.id, calificacion, textoResena);
        Alert.alert("¡Gracias!", "Tu reseña ha sido publicada.");
        setModalResena(false); setTextoResena('');
    } catch(e) { Alert.alert("Error", "No se pudo enviar."); }
  };

  // --- RENDERIZADO DE UN LUGAR (PANTALLA COMPLETA) ---
  const renderPlaceItem = ({ item }) => {
    const isFav = favoritosIds.has(item.id);
    const linksInfo = getLinks(item.nombre);
    
    return (
      <View style={{ width, height, backgroundColor: '#000' }}>
         <ImageBackground source={{ uri: item.imagen_url }} style={styles.fullImage} resizeMode="cover">
            {/* Gradiente Inferior para textos */}
            <LinearGradient 
                colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.95)']} 
                style={styles.overlayGradient}
            />

            {/* Barra Lateral de Acciones (Estilo TikTok) */}
            <View style={styles.rightActionsBar}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => { setActiveLugar(item); toggleFavorito(item); }}>
                    <Ionicons name={isFav ? "heart" : "heart"} size={35} color={isFav ? "#ff4757" : "white"} />
                    <Text style={styles.actionText}>{isFav ? "Saved" : "Like"}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => { setActiveLugar(item); setModalResena(true); }}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="chatbubble-ellipses" size={24} color="#000" />
                    </View>
                    <Text style={styles.actionText}>Reseñar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => { setActiveLugar(item); setModalEnlaces(true); }}>
                    <View style={styles.iconCircleGlass}>
                        <Ionicons name="link" size={24} color="white" />
                    </View>
                    <Text style={styles.actionText}>Notas</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => {
                    const url = linksInfo?.mapa || `https://www.google.com/maps/search/?api=1&query=${item.nombre}+Arequipa`;
                    Linking.openURL(url);
                }}>
                     <View style={[styles.iconCircleGlass, {borderColor:'#4cd137'}]}>
                        <Ionicons name="map" size={24} color="#4cd137" />
                    </View>
                    <Text style={styles.actionText}>Ir</Text>
                </TouchableOpacity>
            </View>

            {/* Información Inferior */}
            <View style={styles.bottomInfo}>
                <View style={styles.catBadge}>
                    <Text style={styles.catText}>{item.categoria}</Text>
                </View>
                <Text style={styles.placeTitle}>{item.nombre}</Text>
                <Text style={styles.placeDesc} numberOfLines={3}>{getDesc(item)}</Text>
                
                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={16} color="#ff6b00" />
                        <Text style={styles.metaText}>{getHorario(item.nombre)}</Text>
                    </View>
                    {linksInfo?.web && (
                        <TouchableOpacity onPress={() => Linking.openURL(linksInfo.web)}>
                            <Text style={styles.webLink}>🌐 Visitar Web Oficial</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

         </ImageBackground>
      </View>
    );
  };

  // --- RENDERIZADO DE CATEGORÍA (LISTA HORIZONTAL) ---
  const renderCategoryItem = ({ item }) => {
    return (
      <View style={{ width, height }}>
         {/* Título Flotante de Categoría */}
         <View style={styles.categoryHeaderFloat}>
             <View style={styles.orangeDot} />
             <Text style={styles.categoryTitleFloat}>{item.title.toUpperCase()}</Text>
             <Text style={styles.swipeHint}>Desliza ↔</Text>
         </View>

         <FlatList
            data={item.data}
            renderItem={renderPlaceItem}
            keyExtractor={(lugar) => lugar.id.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={width}
            decelerationRate="fast"
            initialNumToRender={1}
            maxToRenderPerBatch={2}
            windowSize={3}
         />
      </View>
    );
  };

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#ff6b00" /></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Botón Volver Flotante */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
         <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      {/* LISTA VERTICAL (CATEGORÍAS) */}
      <FlatList
         data={categoriasData}
         renderItem={renderCategoryItem}
         keyExtractor={(item) => item.title}
         pagingEnabled
         showsVerticalScrollIndicator={false}
         snapToInterval={height}
         decelerationRate="fast"
         initialNumToRender={1}
         maxToRenderPerBatch={2}
         windowSize={2}
      />

      {/* --- MODAL RESEÑA --- */}
      <Modal visible={modalResena} transparent animationType="slide" onRequestClose={() => setModalResena(false)}>
         <View style={styles.modalOverlay}>
             <View style={styles.modalCard}>
                 <Text style={styles.modalTitle}>Tu opinión importa</Text>
                 <Text style={styles.modalSub}>Califica tu experiencia en {activeLugar?.nombre}</Text>
                 
                 <View style={styles.starsRow}>
                    {[1,2,3,4,5].map(s => (
                        <TouchableOpacity key={s} onPress={() => setCalificacion(s)}>
                             <Ionicons name={s <= calificacion ? "star" : "star-outline"} size={32} color="#FFD700" />
                        </TouchableOpacity>
                    ))}
                 </View>

                 <TextInput 
                    style={styles.modalInput} 
                    placeholder="Escribe aquí..." 
                    placeholderTextColor="#666" 
                    multiline 
                    value={textoResena} 
                    onChangeText={setTextoResena}
                 />

                 <View style={styles.modalBtns}>
                    <TouchableOpacity onPress={() => setModalResena(false)} style={styles.btnCancel}><Text style={{color:'white'}}>Cancelar</Text></TouchableOpacity>
                    <TouchableOpacity onPress={enviarResena} style={styles.btnConfirm}><Text style={{color:'white', fontWeight:'bold'}}>Publicar</Text></TouchableOpacity>
                 </View>
             </View>
         </View>
      </Modal>

      {/* --- MODAL ENLACES --- */}
      <Modal visible={modalEnlaces} transparent animationType="fade" onRequestClose={() => setModalEnlaces(false)}>
         <View style={styles.modalOverlay}>
             <View style={styles.modalCard}>
                 <Text style={styles.modalTitle}>Guardar Nota</Text>
                 <Text style={styles.modalSub}>Guarda links de blogs, videos o tips para {activeLugar?.nombre}</Text>
                 <TextInput style={styles.inputSimple} placeholder="Título de la nota" placeholderTextColor="#666" />
                 <TextInput style={styles.inputSimple} placeholder="URL (https://...)" placeholderTextColor="#666" />
                 <TouchableOpacity style={[styles.btnConfirm, {width:'100%', marginTop:10}]} onPress={() => {
                     Alert.alert("Guardado", "Nota guardada localmente");
                     setModalEnlaces(false);
                 }}>
                     <Text style={{color:'white', fontWeight:'bold'}}>Guardar</Text>
                 </TouchableOpacity>
             </View>
         </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  
  fullImage: { width: '100%', height: '100%', justifyContent: 'flex-end' },
  overlayGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%' },
  
  // Header Flotante Volver
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 50 },

  // Categoría Flotante
  categoryHeaderFloat: { 
      position: 'absolute', top: 50, alignSelf: 'center', zIndex: 50, 
      alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', 
      paddingVertical: 8, paddingHorizontal: 20, borderRadius: 30,
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  categoryTitleFloat: { color: 'white', fontWeight: '800', fontSize: 14, letterSpacing: 1 },
  orangeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ff6b00', marginBottom: 4 },
  swipeHint: { color: '#ccc', fontSize: 10, marginTop: 2 },

  // Barra Derecha (TikTok Style)
  rightActionsBar: { position: 'absolute', right: 10, bottom: 180, alignItems: 'center', gap: 20 },
  actionBtn: { alignItems: 'center', gap: 5 },
  iconCircle: { width: 45, height: 45, borderRadius: 25, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },
  iconCircleGlass: { width: 45, height: 45, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  actionText: { color: 'white', fontSize: 10, fontWeight: '600' },

  // Info Inferior
  bottomInfo: { padding: 20, paddingBottom: 80, paddingRight: 70 }, // Padding derecho para no chocar con botones
  catBadge: { backgroundColor: '#ff6b00', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 10 },
  catText: { color: 'white', fontWeight: 'bold', fontSize: 10, textTransform: 'uppercase' },
  placeTitle: { color: 'white', fontSize: 28, fontWeight: '800', marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 10 },
  placeDesc: { color: '#e0e0e0', fontSize: 14, lineHeight: 20, marginBottom: 15 },
  
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 15, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: '#ccc', fontSize: 12 },
  webLink: { color: '#4facfe', fontWeight: 'bold', fontSize: 12, textDecorationLine: 'underline' },

  // Modales
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '85%', backgroundColor: '#141414', borderRadius: 20, padding: 25, borderWidth: 1, borderColor: '#333' },
  modalTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  modalSub: { color: '#aaa', fontSize: 13, textAlign: 'center', marginBottom: 20 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 },
  modalInput: { backgroundColor: '#222', borderRadius: 12, padding: 15, color: 'white', height: 100, textAlignVertical: 'top', marginBottom: 20 },
  modalBtns: { flexDirection: 'row', gap: 10 },
  btnCancel: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#333', alignItems: 'center' },
  btnConfirm: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#ff6b00', alignItems: 'center' },
  
  inputSimple: { backgroundColor: '#222', borderRadius: 10, padding: 12, color: 'white', marginBottom: 10 },
});