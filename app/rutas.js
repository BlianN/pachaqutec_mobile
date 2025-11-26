import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, Polyline, Callout } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as API from '../services/api';

const { width, height } = Dimensions.get('window');

// Coordenadas por defecto (Arequipa) por si el lugar no tiene lat/lng
const AREQUIPA_CENTER = {
  latitude: -16.398866,
  longitude: -71.536961,
  latitudeDelta: 0.03,
  longitudeDelta: 0.03,
};

// Estilo de mapa limpio (elimina ruido de Google Maps)
const MAP_STYLE = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] }
];

export default function RutasPage() {
  const router = useRouter();
  const mapRef = useRef(null);

  // --- ESTADOS ---
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCat, setFiltroCat] = useState("todos");
  
  // Ruta
  const [lugaresRuta, setLugaresRuta] = useState([]);
  const [lugarSeleccionado, setLugarSeleccionado] = useState(null);
  const [modoRuta, setModoRuta] = useState(false); // Para mostrar info de ruta

  // --- CARGAR DATOS ---
  useEffect(() => {
    const init = async () => {
      try {
        const data = await API.getTouristLocations();
        // Aseguramos que tengan lat/lng (si vienen vacíos del backend, ponemos random cerca al centro para que no explote)
        const lugaresMapeados = data.map(l => ({
          ...l,
          lat: l.lat || (AREQUIPA_CENTER.latitude + (Math.random() - 0.5) * 0.01),
          lng: l.lng || (AREQUIPA_CENTER.longitude + (Math.random() - 0.5) * 0.01),
          // Asignar icono según categoría si no viene
          icono: l.categoria?.includes('Gastr') ? '🍲' : 
                 l.categoria?.includes('Hist') ? '🏛️' : 
                 l.categoria?.includes('Avent') ? '🧗' : '📍'
        }));
        setLugares(lugaresMapeados);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // --- FILTROS ---
  // Extraemos categorías únicas de los lugares cargados
  const categorias = useMemo(() => {
    const cats = new Set(lugares.map(l => l.categoria || 'Otros'));
    return ['todos', ...Array.from(cats)];
  }, [lugares]);

  const lugaresFiltrados = lugares.filter(l => {
    const matchNombre = l.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchCat = filtroCat === 'todos' || l.categoria === filtroCat;
    return matchNombre && matchCat;
  });

  // --- ACCIONES MAPA ---
  const irALugar = (lugar) => {
    setLugarSeleccionado(lugar);
    mapRef.current?.animateToRegion({
      latitude: lugar.lat,
      longitude: lugar.lng,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 800);
  };

  const toggleRuta = (lugar) => {
    const existe = lugaresRuta.find(l => l.id === lugar.id);
    if (existe) {
      setLugaresRuta(prev => prev.filter(l => l.id !== lugar.id));
    } else {
      if (lugaresRuta.length >= 10) return Alert.alert("Límite", "Máximo 10 paradas.");
      setLugaresRuta(prev => [...prev, lugar]);
    }
  };

  const generarRuta = () => {
    if (lugaresRuta.length < 2) return Alert.alert("Ruta", "Selecciona al menos 2 lugares.");
    
    setModoRuta(true);
    // Zoom para ver toda la ruta
    const coords = lugaresRuta.map(l => ({ latitude: l.lat, longitude: l.lng }));
    mapRef.current?.fitToCoordinates(coords, {
      edgePadding: { top: 100, right: 50, bottom: 350, left: 50 },
      animated: true
    });
  };

  const limpiarRuta = () => {
    setLugaresRuta([]);
    setModoRuta(false);
    mapRef.current?.animateToRegion(AREQUIPA_CENTER, 1000);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* --- MAPA DE FONDO --- */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={AREQUIPA_CENTER}
        customMapStyle={MAP_STYLE}
        showsUserLocation
      >
        {/* Línea de Ruta */}
        {lugaresRuta.length >= 2 && (
          <Polyline
            coordinates={lugaresRuta.map(l => ({ latitude: l.lat, longitude: l.lng }))}
            strokeColor="#FF6B00"
            strokeWidth={4}
            lineDashPattern={[1]}
          />
        )}

        {/* Marcadores */}
        {lugaresFiltrados.map((lugar, index) => {
          const enRuta = lugaresRuta.findIndex(r => r.id === lugar.id);
          const esSeleccionado = lugarSeleccionado?.id === lugar.id;

          return (
            <Marker
              key={lugar.id}
              coordinate={{ latitude: lugar.lat, longitude: lugar.lng }}
              onPress={() => setLugarSeleccionado(lugar)}
              zIndex={esSeleccionado ? 999 : 1}
            >
              <View style={[styles.markerContainer, esSeleccionado && styles.markerSelected]}>
                {enRuta !== -1 ? (
                  <View style={styles.markerBadge}>
                    <Text style={styles.markerNumber}>{enRuta + 1}</Text>
                  </View>
                ) : (
                  <View style={styles.markerDot}>
                    <Text style={{fontSize: 12}}>{lugar.icono}</Text>
                  </View>
                )}
                {esSeleccionado && <View style={styles.markerArrow} />}
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* --- HEADER FLOTANTE --- */}
      <View style={styles.topContainer}>
        <View style={styles.searchBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
            <Ionicons name="arrow-back" size={24} color="#4A5568" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="¿A dónde quieres ir?"
            value={busqueda}
            onChangeText={setBusqueda}
          />
          <Ionicons name="search" size={20} color="#A0AEC0" style={{marginRight: 10}} />
        </View>

        {/* Categorías Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {categorias.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, filtroCat === cat && styles.chipActive]}
              onPress={() => setFiltroCat(cat)}
            >
              <Text style={[styles.chipText, filtroCat === cat && styles.chipTextActive]}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* --- PANEL INFERIOR (Lista o Ruta) --- */}
      <View style={styles.bottomSheet}>
        
        {/* Handle para deslizar (visual) */}
        <View style={styles.handleBar} />

        {/* Header del Panel: Resumen Ruta */}
        <View style={styles.routeHeader}>
          <View>
            <Text style={styles.routeTitle}>
              {lugaresRuta.length === 0 ? "Crea tu Ruta" : `${lugaresRuta.length} paradas`}
            </Text>
            <Text style={styles.routeSubtitle}>
              {lugaresRuta.length === 0 ? "Selecciona (+) lugares para empezar" : "Ruta personalizada"}
            </Text>
          </View>
          
          {lugaresRuta.length > 0 && (
            <View style={{flexDirection: 'row', gap: 10}}>
              <TouchableOpacity style={styles.iconBtn} onPress={limpiarRuta}>
                <Ionicons name="trash-outline" size={20} color="#E53E3E" />
              </TouchableOpacity>
              
              {lugaresRuta.length >= 2 && (
                <TouchableOpacity onPress={generarRuta}>
                  <LinearGradient colors={['#FF6B00', '#FF8C00']} style={styles.btnGo}>
                    <Text style={styles.btnGoText}>IR</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Lista Horizontal de Lugares */}
        {loading ? (
          <ActivityIndicator color="#FF6B00" style={{marginTop: 20}} />
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.placesList}
          >
            {lugaresFiltrados.map(lugar => {
              const enRuta = lugaresRuta.some(r => r.id === lugar.id);
              
              return (
                <TouchableOpacity 
                  key={lugar.id} 
                  style={[styles.card, enRuta && styles.cardActive]}
                  activeOpacity={0.9}
                  onPress={() => irALugar(lugar)}
                >
                  <Image source={{ uri: lugar.imagen_url }} style={styles.cardImg} />
                  
                  {/* Botón Agregar/Quitar */}
                  <TouchableOpacity 
                    style={[styles.addBtn, enRuta && styles.addBtnActive]}
                    onPress={() => toggleRuta(lugar)}
                  >
                    <Ionicons name={enRuta ? "remove" : "add"} size={20} color="white" />
                  </TouchableOpacity>

                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{lugar.nombre}</Text>
                    <Text style={styles.cardCat}>{lugar.categoria}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { ...StyleSheet.absoluteFillObject },

  // HEADER FLOTANTE
  topContainer: { position: 'absolute', top: 50, left: 0, right: 0, paddingHorizontal: 20 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
    borderRadius: 16, padding: 5, elevation: 5, shadowColor: '#000',
    shadowOffset: {width:0, height:2}, shadowOpacity:0.15, shadowRadius:5
  },
  backIcon: { padding: 10 },
  input: { flex: 1, fontSize: 16, color: '#2D3748' },
  
  chipsScroll: { marginTop: 12 },
  chip: {
    backgroundColor: 'white', paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: 20, marginRight: 8, elevation: 3, shadowColor:'#000',
    shadowOpacity:0.1, shadowRadius:3
  },
  chipActive: { backgroundColor: '#2D3748' },
  chipText: { fontWeight: '600', color: '#4A5568' },
  chipTextActive: { color: 'white' },

  // MARKERS
  markerContainer: { alignItems: 'center' },
  markerSelected: { transform: [{scale: 1.2}] },
  markerDot: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: 'white',
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FF6B00',
    shadowColor:'#000', shadowOpacity:0.3, elevation: 5
  },
  markerBadge: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: '#FF6B00',
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white',
    shadowColor:'#000', shadowOpacity:0.3, elevation: 5
  },
  markerNumber: { color: 'white', fontWeight: 'bold' },
  markerArrow: {
    width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8,
    borderStyle: 'solid', backgroundColor: 'transparent', borderLeftColor: 'transparent',
    borderRightColor: 'transparent', borderTopColor: '#FF6B00', marginTop: -2
  },

  // BOTTOM SHEET
  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingVertical: 10, paddingBottom: 30, elevation: 20, shadowColor:'#000',
    shadowOffset:{width:0, height:-5}, shadowOpacity:0.1, shadowRadius:10,
    height: 280 // Altura fija para mostrar lista
  },
  handleBar: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 15 },
  
  routeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  routeTitle: { fontSize: 18, fontWeight: '800', color: '#1A202C' },
  routeSubtitle: { fontSize: 12, color: '#718096' },
  
  iconBtn: { padding: 10, backgroundColor: '#FFF5F5', borderRadius: 12 },
  btnGo: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  btnGoText: { color: 'white', fontWeight: '800', fontSize: 14 },

  // CARDS
  placesList: { paddingHorizontal: 20, gap: 15 },
  card: {
    width: 160, height: 180, backgroundColor: 'white', borderRadius: 16,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3,
    borderWidth: 2, borderColor: 'transparent', overflow: 'hidden'
  },
  cardActive: { borderColor: '#FF6B00' },
  cardImg: { width: '100%', height: 110 },
  cardContent: { padding: 10 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#2D3748' },
  cardCat: { fontSize: 11, color: '#718096', marginTop: 2 },
  
  addBtn: {
    position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'white'
  },
  addBtnActive: { backgroundColor: '#FF6B00', borderColor: '#FF6B00' }
});