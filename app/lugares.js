import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar,
  Modal,
  Linking,
  TextInput,
  Alert,
  ActivityIndicator,
  ImageBackground
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as API from '../services/api';

const { width } = Dimensions.get('window');

// ==========================================
// 🏛️ BASE DE DATOS LOCAL
const HORARIOS_AREQUIPA = {
  "santa catalina": "Lun - Dom: 09:00 AM - 05:00 PM (Jue: hasta 8PM)",
  "monasterio de santa catalina": "Lun - Dom: 09:00 AM - 05:00 PM (Jue: hasta 8PM)",
  "yanahuara": "Abierto las 24 horas (Mirador)",
  "mirador de yanahuara": "Abierto las 24 horas (Recomendado: Atardecer)",
  "colca": "Acceso libre (Tours inician 03:00 AM)",
  "cañón del colca": "Acceso libre (Tours inician 03:00 AM)",
  "plaza de armas": "Abierto las 24 horas",
  "catedral": "Lun - Sab: 07:00-10:00 y 17:00-19:00",
  "catedral de arequipa": "Lun - Sab: 07:00-10:00 y 17:00-19:00",
  "ruta del sillar": "Lun - Dom: 08:00 AM - 05:00 PM",
  "canteras de sillar": "Lun - Dom: 08:00 AM - 05:00 PM",
  "añashuayco": "Lun - Dom: 08:00 AM - 05:00 PM",
  "mundo alpaca": "Lun - Dom: 08:30 AM - 05:30 PM",
  "sabandía": "Lun - Dom: 09:00 AM - 05:00 PM",
  "molino de sabandía": "Lun - Dom: 09:00 AM - 05:00 PM",
  "mansión del fundador": "Lun - Dom: 09:00 AM - 05:00 PM",
  "misti": "Ascensos previa coordinación (2 días)",
  "volcán misti": "Ascensos previa coordinación (2 días)",
  "san camilo": "Lun - Dom: 06:00 AM - 07:00 PM",
  "mercado san camilo": "Lun - Dom: 06:00 AM - 07:00 PM",
  "museo santuarios andinos": "Lun - Sab: 09:00 AM - 06:00 PM (Dom: 9-3)"
};

const DESCRIPCIONES_AREQUIPA = {
  "santa catalina": "Una ciudad dentro de la ciudad. Este monasterio de clausura del siglo XVI es una obra maestra de la arquitectura colonial.",
  "yanahuara": "El mirador más icónico de la ciudad con vistas a los tres volcanes.",
  "colca": "Uno de los cañones más profundos del mundo, hogar del majestuoso cóndor andino.",
  "plaza de armas": "El corazón de la ciudad blanca, rodeada de portales de granito y sillar.",
  "catedral": "Imponente catedral construida con sillar, alberga un museo y joyas de arte religioso.",
  "ruta del sillar": "Canteras de donde se extrae la piedra blanca volcánica con la que se construyó Arequipa.",
  "mundo alpaca": "Centro eco-turístico para conocer e interactuar con alpacas y llamas.",
  "molino de sabandía": "Molino de piedra del siglo XVII en perfecto estado de funcionamiento.",
  "mansión del fundador": "Casona colonial que perteneció al fundador de Arequipa, Garcí Manuel de Carbajal.",
  "misti": "El guardián de la ciudad. Volcán activo de 5822 m.s.n.m.",
  "mercado san camilo": "Mercado histórico diseñado por Gustave Eiffel, famoso por sus jugos y gastronomía.",
  "museo santuarios andinos": "Hogar de la Dama de Ampato (Momia Juanita) y tesoros incas."
};

const ENLACES_RECOMENDADOS = {
  "santa catalina": [
    { titulo: "Compra de entradas oficial", url: "https://santacatalina.org.pe/" },
    { titulo: "Historia del Monasterio (Video)", url: "https://youtu.be/5JNhJAeWw6k" },
    { titulo: "Visita nocturna", url: "https://storesantacatalina.org.pe/visits/5B1496E7-0932-457B-A176-FFD30E890A8A" }
  ],
  "yanahuara": [
    { titulo: "Mejores horas para visitar", url: "https://arequipaperu.info/lugares-turisticos/mirador-de-yanahuara" },
    { titulo: "Restaurantes cercanos", url: "https://www.tripadvisor.com.pe/RestaurantsNear-g294313-d554228-Yanahuara-Arequipa_Arequipa_Region.html" }
  ],
  "colca": [
    { titulo: "Ruta de trekking recomendada", url: "https://bananomeridiano.com/trekking-canon-del-colca-por-libre" },
    { titulo: "Boleto Turístico del Colca", url: "https://info.colcaperu.gob.pe/boleto-turistico" }
  ],
  "plaza de armas": [
    { titulo: "Restaurantes con vista a la plaza", url: "https://www.tripadvisor.com.pe/RestaurantsNear-g294313-d313683-Plaza_de_Armas-Arequipa_Arequipa_Region.html" },
    { titulo: "Historia del Tuturutu", url: "https://rpp.pe/peru/actualidad/arequipa-el-tuturutu-un-sereno-permanente-de-la-plaza-de-armas-noticia-316433" }
  ],
  "catedral": [
    { titulo: "Museo de la Catedral", url: "https://www.museocatedralarequipa.org.pe/visitenos.html" },
    { titulo: "Horarios de Misa", url: "https://www.arzobispadoarequipa.org.pe/horarios" }
  ],
  "ruta del sillar": [
    { titulo: "Cómo llegar por cuenta propia", url: "https://www.youtube.com/watch?v=HuR1q7i0yZU" },
    { titulo: "Artesanos tallando (Video)", url: "https://www.youtube.com/watch?v=RQ-CJ1FbhvM" }
  ],
  "mundo alpaca": [
    { titulo: "Sitio web oficial", url: "https://mundoalpaca.com.pe/es/mundoalpaca-arequipa" },
    { titulo: "Tejido tradicional (Video)", url: "https://www.youtube.com/watch?v=j4QCehFOTME" }
  ],
  "molino de sabandía": [
    { titulo: "Ubicación en Mapa", url: "https://satellites.pro/mapa_de_Sabandia" }
  ],
  "mansión del fundador": [
    { titulo: "Datos históricos", url: "https://www.lamansiondelfundador.com/todos" }
  ],
  "misti": [
    { titulo: "Guía para el ascenso", url: "https://www.huillcaexpedition.com/es/blog/aclimatacion-para-subir-al-misti" },
    { titulo: "Vista 360", url: "https://arequipa360.com/es" }
  ],
  "mercado san camilo": [
    { titulo: "Gastronomía imperdible (Reel)", url: "https://www.instagram.com/reel/DL6ER55tk71" }
  ],
  "museo santuarios andinos": [
    { titulo: "Historia de Momia Juanita", url: "https://historia.nationalgeographic.com.es/a/asi-era-rosto-juanita-momia-peru_20392" },
    { titulo: "Reservar visita", url: "https://apps.ucsm.edu.pe/UCSMERP/Msa1090.php" }
  ]
};

const DATOS_PRINCIPALES = {
  "santa catalina": {
    web: "https://santacatalina.org.pe/",
    mapa: "https://maps.app.goo.gl/gHU8YFzT55RQRZMQ6"
  },
  "yanahuara": {
    web: "https://www.peru.travel/es/atractivos/mirador-de-yanahuara", 
    mapa: "https://maps.app.goo.gl/meJi1447M5aqboix7" 
  },
  "colca": {
    web: "https://www.colcaperu.gob.pe/destinos",
    mapa: "https://maps.app.goo.gl/wAnxKcQXq7ABhdFSA"
  },
  "plaza de armas": {
    web: "https://www.ytuqueplanes.com/destinos/junin/tarma/plaza-de-armas",
    mapa: "https://maps.app.goo.gl/t1VTeU7SX8ze2E7L6"
  },
  "catedral": {
    web: "https://www.facebook.com/CatedralArequipa/?locale=es_LA",
    mapa: "https://maps.app.goo.gl/rDJiSjSf8KgaLTEt6"
  },
  "ruta del sillar": {
    web: "https://www.hvillasillar.com/ruta-de-sillar",
    mapa: "https://maps.app.goo.gl/HupFRd3M9iAYDiM36"
  },
  "mundo alpaca ": {
    web: "https://mundoalpaca.com.pe/es",
    mapa: "https://maps.app.goo.gl/Vr5C8jV9inhKcgnf9"
  },
  "molino de sabandia": {
    web: "https://www.facebook.com/elmolinodesabandia/?locale=es_LA",
    mapa: "https://maps.app.goo.gl/oj41cfykJJuatiw86"
  },
  "mansion del fundador": {
    web: "https://www.lamansiondelfundador.com",
    mapa: "https://maps.app.goo.gl/r37MmzKkmetU4Fzq5"
  },
  "misti": {
    web: "https://www.facebook.com/VolcanMisti/?locale=es_LA",
    mapa: "https://maps.app.goo.gl/5e9ueHzggWmiFhXg9"
  },
  "mercado san camino": {
    web: "https://www.facebook.com/mercadosancamiloarequipa/?locale=es_LA",
    mapa: "https://maps.app.goo.gl/fEjEwbp1y6GtSSdQA"
  },
  "museo santuarios andinos": {
    web: "https://ucsm.edu.pe/museo-santuarios-andinos-de-la-ucsm-dedicado-la-dama-del-ampato-abrio-sus-puertas-poblacion-arequipena-y-los-turistas",
    mapa: "https://maps.app.goo.gl/uSfRjYFSQcysQnp36"
  }
};

export default function LugaresPage() {
  const router = useRouter();
  const { filtro_categoria, nombre_categoria } = useLocalSearchParams();
  
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoritosIds, setFavoritosIds] = useState(new Set());
  
  const [lugarSeleccionado, setLugarSeleccionado] = useState(null);
  const [modalEnlacesVisible, setModalEnlacesVisible] = useState(false);
  const [modalRecomendadosVisible, setModalRecomendadosVisible] = useState(false);

  const [misEnlaces, setMisEnlaces] = useState({});
  const [nuevoEnlaceUrl, setNuevoEnlaceUrl] = useState("");
  const [nuevoEnlaceNota, setNuevoEnlaceNota] = useState("");

  useEffect(() => {
    cargarDatos();
    cargarMisEnlaces();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const dataLugares = await API.getTouristLocations();
      const userInfo = await API.getUserInfo().catch(()=>null);
      
      if (userInfo) {
        const dataFavs = await API.getFavorites();
        const ids = new Set(dataFavs.map(f => f.id || f.lugar_id));
        setFavoritosIds(ids);
      }

      // Filtro para eliminar duplicados por ID y Nombre (igual que en la web)
      const unicos = dataLugares.filter((lugar, index, self) =>
        index === self.findIndex((t) => (
          t.id === lugar.id || t.nombre.trim().toLowerCase() === lugar.nombre.trim().toLowerCase()
        ))
      );

      setLugares(unicos);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarMisEnlaces = async () => {
    const json = await AsyncStorage.getItem('mis_enlaces_lugares');
    if (json) setMisEnlaces(JSON.parse(json));
  };

  const lugaresProcesados = useMemo(() => {
    let listaBase = lugares;
    if (filtro_categoria || nombre_categoria) {
        listaBase = listaBase.filter(l => {
             if (filtro_categoria && l.categoria_id == filtro_categoria) return true;
             if (nombre_categoria && l.categoria?.toLowerCase() === nombre_categoria.toLowerCase()) return true;
             return false;
        });
    }
    const grupos = {};
    listaBase.forEach(lugar => {
      const cat = lugar.categoria || "General";
      if (!grupos[cat]) grupos[cat] = [];
      grupos[cat].push(lugar);
    });
    return grupos;
  }, [lugares, filtro_categoria, nombre_categoria]);

  // HELPERS DE DATOS LOCALES
  const matchData = (nombre, dataset) => {
    if (!nombre) return null;
    const nombreNorm = nombre.toLowerCase().trim();
    const key = Object.keys(dataset).find(k => nombreNorm.includes(k) || k.includes(nombreNorm));
    return key ? dataset[key] : null;
  };

  const getHorario = (nombre) => matchData(nombre, HORARIOS_AREQUIPA) || "09:00 AM - 05:00 PM";
  const getDesc = (lugar) => matchData(lugar.nombre, DESCRIPCIONES_AREQUIPA) || lugar.descripcion || "Un destino increíble en Arequipa.";
  const getRecs = (nombre) => matchData(nombre, ENLACES_RECOMENDADOS) || [];
  const getLinks = (nombre) => matchData(nombre, DATOS_PRINCIPALES);

  const toggleFavorito = async (lugar) => {
    try {
      const esFavorito = favoritosIds.has(lugar.id);
      const nuevasIds = new Set(favoritosIds);
      if (esFavorito) {
        Alert.alert("Aviso", "Ya está en tus favoritos.");
      } else {
        nuevasIds.add(lugar.id);
        setFavoritosIds(nuevasIds);
        await API.addFavorite(lugar.id);
      }
    } catch (error) {
      Alert.alert("Requiere Sesión", "Inicia sesión para guardar favoritos.");
    }
  };

  const guardarEnlacePersonal = async () => {
    if (!nuevoEnlaceUrl) return;
    const id = lugarSeleccionado.id;
    const actuales = misEnlaces[id] || [];
    const nuevo = { id: Date.now(), url: nuevoEnlaceUrl, nota: nuevoEnlaceNota || "Enlace guardado" };
    const actualizados = { ...misEnlaces, [id]: [...actuales, nuevo] };
    setMisEnlaces(actualizados);
    await AsyncStorage.setItem('mis_enlaces_lugares', JSON.stringify(actualizados));
    setNuevoEnlaceUrl(""); setNuevoEnlaceNota("");
  };

  const eliminarEnlacePersonal = async (linkId) => {
    const id = lugarSeleccionado.id;
    const actualizados = { ...misEnlaces, [id]: misEnlaces[id].filter(l => l.id !== linkId) };
    setMisEnlaces(actualizados);
    await AsyncStorage.setItem('mis_enlaces_lugares', JSON.stringify(actualizados));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1A202C" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{nombre_categoria ? nombre_categoria : "Explorar Destinos"}</Text>
          <Text style={styles.headerSubtitle}>Descubre Arequipa</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF6B00" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {Object.keys(lugaresProcesados).length === 0 ? (
             <Text style={styles.emptyText}>No se encontraron lugares.</Text>
          ) : (
            Object.keys(lugaresProcesados).map((categoria) => (
              <View key={categoria} style={styles.categorySection}>
                <View style={styles.catHeader}>
                  <View style={{flexDirection:'row', alignItems:'center', gap: 8}}>
                    <View style={styles.orangeDot} />
                    <Text style={styles.catTitle}>{categoria}</Text>
                  </View>
                  <Text style={styles.badgeCount}>{lugaresProcesados[categoria].length}</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
                  {lugaresProcesados[categoria].map((lugar) => (
                    <TouchableOpacity key={lugar.id} style={styles.card} activeOpacity={0.9} onPress={() => setLugarSeleccionado(lugar)}>
                      <ImageBackground source={{ uri: lugar.imagen_url }} style={styles.cardImage} imageStyle={{ borderRadius: 16 }}>
                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.cardOverlay}>
                          <Text style={styles.cardTitle}>{lugar.nombre}</Text>
                          <Text style={styles.cardCta}>Ver detalles</Text>
                        </LinearGradient>
                        <TouchableOpacity style={styles.cardHeart} onPress={() => toggleFavorito(lugar)}>
                          <Ionicons name={favoritosIds.has(lugar.id) ? "heart" : "heart-outline"} size={20} color={favoritosIds.has(lugar.id) ? "#FF4757" : "white"} />
                        </TouchableOpacity>
                      </ImageBackground>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ))
          )}
          <View style={{height: 50}} />
        </ScrollView>
      )}

      <Modal visible={!!lugarSeleccionado} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setLugarSeleccionado(null)}>
        {lugarSeleccionado && (
          <View style={styles.modalContainer}>
            <ScrollView bounces={false}>
              <View style={styles.heroContainer}>
                <Image source={{ uri: lugarSeleccionado.imagen_url }} style={styles.heroImage} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.heroOverlay}>
                  <Text style={styles.heroTitle}>{lugarSeleccionado.nombre}</Text>
                </LinearGradient>
                <TouchableOpacity style={styles.closeModalBtn} onPress={() => setLugarSeleccionado(null)}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
              <View style={styles.modalContent}>
                <Text style={styles.description}>{getDesc(lugarSeleccionado)}</Text>
                <View style={styles.infoGrid}>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>🕒 HORARIO</Text>
                    <Text style={styles.infoVal}>{getHorario(lugarSeleccionado.nombre)}</Text>
                  </View>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>📍 UBICACIÓN</Text>
                    <Text style={styles.infoVal}>Arequipa, Perú</Text>
                  </View>
                </View>
                <View style={styles.actionButtons}>
                  {(() => {
                    const links = getLinks(lugarSeleccionado.nombre);
                    const webUrl = links?.web || lugarSeleccionado.enlace;
                    const mapUrl = links?.mapa || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lugarSeleccionado.nombre + " Arequipa")}`;
                    return (
                      <>
                        {webUrl && (
                          <TouchableOpacity style={styles.btnPrimary} onPress={() => Linking.openURL(webUrl)}>
                            <Text style={styles.btnPrimaryText}>Visitar Web</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.btnOutline} onPress={() => Linking.openURL(mapUrl)}>
                          <Text style={styles.btnOutlineText}>Ver Mapa</Text>
                        </TouchableOpacity>
                      </>
                    );
                  })()}
                </View>
                <View style={styles.extraActions}>
                  <TouchableOpacity style={styles.btnExtra} onPress={() => setModalEnlacesVisible(true)}>
                    <Text style={styles.btnExtraText}>🔗 Mis Enlaces</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btnExtra, {backgroundColor: '#E0F2F1', borderColor: '#00897B'}]} onPress={() => setModalRecomendadosVisible(true)}>
                    <Text style={[styles.btnExtraText, {color: '#00796B'}]}>⭐ Recomendados</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={[styles.bigFavBtn, favoritosIds.has(lugarSeleccionado.id) && styles.bigFavBtnActive]} onPress={() => toggleFavorito(lugarSeleccionado)}>
                  <Ionicons name={favoritosIds.has(lugarSeleccionado.id) ? "heart" : "heart-outline"} size={22} color={favoritosIds.has(lugarSeleccionado.id) ? "white" : "#FF6B00"} />
                  <Text style={[styles.bigFavText, favoritosIds.has(lugarSeleccionado.id) && {color:'white'}]}>
                    {favoritosIds.has(lugarSeleccionado.id) ? "Guardado en Favoritos" : "Agregar a Favoritos"}
                  </Text>
                </TouchableOpacity>
                <View style={{height: 50}}/>
              </View>
            </ScrollView>

            {/* Sub-Modales */}
            <Modal visible={modalEnlacesVisible} transparent animationType="fade" onRequestClose={()=>setModalEnlacesVisible(false)}>
              <View style={styles.subModalOverlay}>
                <View style={styles.subModalCard}>
                  <View style={styles.subModalHeader}>
                    <Text style={styles.subModalTitle}>Mis Enlaces</Text>
                    <TouchableOpacity onPress={()=>setModalEnlacesVisible(false)}><Ionicons name="close" size={24} color="#333"/></TouchableOpacity>
                  </View>
                  <ScrollView style={{maxHeight: 200}}>
                    {misEnlaces[lugarSeleccionado.id]?.map(link => (
                      <View key={link.id} style={styles.linkRow}>
                        <TouchableOpacity onPress={()=>Linking.openURL(link.url)}>
                          <Text style={styles.linkNote}>{link.nota}</Text>
                          <Text style={styles.linkUrl} numberOfLines={1}>{link.url}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>eliminarEnlacePersonal(link.id)}>
                          <Ionicons name="trash-outline" size={20} color="red"/>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                  <View style={styles.addForm}>
                    <TextInput placeholder="Nota" style={styles.input} value={nuevoEnlaceNota} onChangeText={setNuevoEnlaceNota}/>
                    <TextInput placeholder="URL" style={styles.input} value={nuevoEnlaceUrl} onChangeText={setNuevoEnlaceUrl} autoCapitalize="none"/>
                    <TouchableOpacity style={styles.btnAdd} onPress={guardarEnlacePersonal}>
                      <Text style={{color:'white', fontWeight:'bold'}}>Agregar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            <Modal visible={modalRecomendadosVisible} transparent animationType="fade" onRequestClose={()=>setModalRecomendadosVisible(false)}>
              <View style={styles.subModalOverlay}>
                <View style={[styles.subModalCard, {borderTopWidth: 4, borderTopColor: '#00897B'}]}>
                  <View style={styles.subModalHeader}>
                    <Text style={[styles.subModalTitle, {color: '#00796B'}]}>Recomendaciones</Text>
                    <TouchableOpacity onPress={()=>setModalRecomendadosVisible(false)}><Ionicons name="close" size={24} color="#333"/></TouchableOpacity>
                  </View>
                  {getRecs(lugarSeleccionado.nombre).length === 0 ? (
                    <Text style={{textAlign:'center', color:'#999', padding: 20}}>Pronto agregaremos recomendaciones.</Text>
                  ) : (
                    getRecs(lugarSeleccionado.nombre).map((rec, i) => (
                      <TouchableOpacity key={i} style={styles.recRow} onPress={()=>Linking.openURL(rec.url)}>
                        <Text>⭐</Text>
                        <Text style={styles.recText}>{rec.titulo}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              </View>
            </Modal>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', elevation: 2 },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A202C' },
  headerSubtitle: { fontSize: 12, color: '#718096' },
  scrollContent: { paddingBottom: 40 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 },
  categorySection: { marginTop: 30 },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 10 },
  orangeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF6B00', marginRight: 8 },
  catTitle: { fontSize: 20, fontWeight: '800', color: '#2D3748' },
  badgeCount: { backgroundColor: '#F1F5F9', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, fontSize: 12, fontWeight: 'bold', color: '#64748B' },
  carousel: { paddingHorizontal: 20, gap: 20 },
  card: { width: 260, height: 320, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: {width:0, height:4}, shadowRadius: 8, elevation: 5 },
  cardImage: { width: '100%', height: '100%', justifyContent: 'flex-end' },
  cardOverlay: { padding: 20, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  cardTitle: { color: 'white', fontSize: 18, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
  cardCta: { color: '#FF6B00', fontWeight: '700', fontSize: 12, textTransform: 'uppercase', marginTop: 5, letterSpacing: 1 },
  cardHeart: { position: 'absolute', top: 15, right: 15, backgroundColor: 'rgba(0,0,0,0.3)', padding: 8, borderRadius: 20 },
  modalContainer: { flex: 1, backgroundColor: 'white' },
  heroContainer: { height: 300 },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingTop: 60 },
  heroTitle: { color: 'white', fontSize: 28, fontWeight: '800' },
  closeModalBtn: { position: 'absolute', top: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.4)', padding: 8, borderRadius: 20 },
  modalContent: { padding: 24, transform: [{translateY: -20}], backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  description: { fontSize: 16, color: '#4A5568', lineHeight: 26, marginBottom: 24 },
  infoGrid: { flexDirection: 'row', gap: 15, marginBottom: 24 },
  infoBox: { flex: 1, backgroundColor: '#F8FAFC', padding: 15, borderRadius: 12 },
  infoLabel: { fontSize: 10, fontWeight: '800', color: '#A0AEC0', marginBottom: 4 },
  infoVal: { fontSize: 14, fontWeight: '700', color: '#2D3748' },
  actionButtons: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  btnPrimary: { flex: 1, backgroundColor: '#FF6B00', padding: 14, borderRadius: 12, alignItems: 'center' },
  btnPrimaryText: { color: 'white', fontWeight: '700' },
  btnOutline: { flex: 1, borderWidth: 2, borderColor: '#E2E8F0', padding: 14, borderRadius: 12, alignItems: 'center' },
  btnOutlineText: { color: '#2D3748', fontWeight: '700' },
  extraActions: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  btnExtra: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  btnExtraText: { fontWeight: '600', color: '#475569' },
  bigFavBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, borderWidth: 2, borderColor: '#FF6B00', gap: 10 },
  bigFavBtnActive: { backgroundColor: '#FF6B00' },
  bigFavText: { fontWeight: '700', color: '#FF6B00' },
  subModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  subModalCard: { backgroundColor: 'white', borderRadius: 16, padding: 20 },
  subModalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 10 },
  subModalTitle: { fontSize: 18, fontWeight: '700', color: '#2D3748' },
  linkRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  linkNote: { fontWeight: '600', color: '#2D3748' },
  linkUrl: { fontSize: 12, color: '#FF6B00' },
  addForm: { marginTop: 15, gap: 10 },
  input: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  btnAdd: { backgroundColor: '#2D3748', padding: 12, borderRadius: 8, alignItems: 'center' },
  recRow: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#E0F2F1', borderRadius: 8, marginBottom: 8, gap: 10 },
  recText: { color: '#00695C', fontWeight: '600' }
});