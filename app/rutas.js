import React, { useState, useRef, useEffect } from 'react';
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
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, Polyline, Circle } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';

// 🔑 API Key de Google Maps (la misma de app.json)
const GOOGLE_MAPS_API_KEY = 'AIzaSyDfDlq1x8pnoUHJYVs8X_fSZVVESaCm_Dk';

const { width, height } = Dimensions.get('window');

const AREQUIPA_CENTER = {
  latitude: -16.398866,
  longitude: -71.536961,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

// Lugares de Arequipa - Base de datos actualizada
const LUGARES_DATA = [
  // Aventura
  { id: 1, nombre: 'Canopy y Tirolesa', categoria: 'Aventura', lat: -16.359184, lng: -71.540737 },
  { id: 2, nombre: 'Rafting en río Chili', categoria: 'Aventura', lat: -16.355781286189146, lng: -71.54193641029562 },
  
  // Histórico
  { id: 3, nombre: 'Monasterio de Santa Catalina', categoria: 'Histórico', lat: -16.396068, lng: -71.536601 },
  { id: 4, nombre: 'Plaza de Armas', categoria: 'Histórico', lat: -16.398866, lng: -71.536961 },
  { id: 5, nombre: 'Barrio de San Lázaro', categoria: 'Histórico', lat: -16.393323, lng: -71.533883 },
  { id: 6, nombre: 'Casa del Moral', categoria: 'Histórico', lat: -16.396803, lng: -71.537751 },
  
  // Religioso
  { id: 7, nombre: 'Catedral de Arequipa', categoria: 'Religioso', lat: -16.398111650506294, lng: -71.53669551721907 },
  { id: 8, nombre: 'Iglesia de la Compañía', categoria: 'Religioso', lat: -16.393751, lng: -71.533171 },
  { id: 9, nombre: 'Convento de Santa Teresa', categoria: 'Religioso', lat: -16.39622242687977, lng: -71.53103760600597 },
  
  // Cultural
  { id: 10, nombre: 'Museo Santuarios Andinos', categoria: 'Cultural', lat: -16.399935, lng: -71.537752 },
  { id: 11, nombre: 'Casa Museo Mario Vargas Llosa', categoria: 'Cultural', lat: -16.406356648679385, lng: -71.54080754091886 },
  { id: 12, nombre: 'Mirador de Yanahuara', categoria: 'Cultural', lat: -16.38743925802195, lng: -71.54172877180314 },
  
  // Gastronomía
  { id: 13, nombre: 'Mercado San Camilo', categoria: 'Gastronomía', lat: -16.403022, lng: -71.534986 },
  { id: 14, nombre: 'Picanterías Tradicionales', categoria: 'Gastronomía', lat: -16.395308228223524, lng: -71.53531926309206 },
  
  // Naturaleza
  { id: 15, nombre: 'Volcán Misti', categoria: 'Naturaleza', lat: -16.298723, lng: -71.405672 },
  { id: 16, nombre: 'Cañón del Colca', categoria: 'Naturaleza', lat: -15.610850, lng: -71.906478 },
  { id: 17, nombre: 'Valle de los Volcanes', categoria: 'Naturaleza', lat: -15.537611, lng: -72.301534 },
  { id: 18, nombre: 'Reserva Nacional Salinas y Aguada Blanca', categoria: 'Naturaleza', lat: -16.367749, lng: -71.135861 },
];

const CATEGORIAS = [
  { id: 'todos', nombre: 'Todos', icono: '' },
  { id: 'Aventura', nombre: 'Aventura', icono: '🧗' },
  { id: 'Histórico', nombre: 'Histórico', icono: '🏛️' },
  { id: 'Religioso', nombre: 'Religioso', icono: '⛪' },
  { id: 'Cultural', nombre: 'Cultural', icono: '�' },
  { id: 'Gastronomía', nombre: 'Comida', icono: '�' },
  { id: 'Naturaleza', nombre: 'Naturaleza', icono: '🏔️' },
];

export default function RutasPage() {
  const router = useRouter();
  const mapRef = useRef(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroCat, setFiltroCat] = useState("todos");
  const [lugaresRuta, setLugaresRuta] = useState([]);
  const [lugarSeleccionado, setLugarSeleccionado] = useState(null);
  const [lugaresData, setLugaresData] = useState(LUGARES_DATA); // 🔥 Usar datos locales
  const [loading, setLoading] = useState(false);
  const [rutaCoords, setRutaCoords] = useState([]); // Coordenadas de la ruta siguiendo calles

  // Cargar ruta real cuando cambian los lugares seleccionados
  useEffect(() => {
    if (lugaresRuta.length >= 2) {
      obtenerRutaReal();
    } else {
      setRutaCoords([]);
    }
  }, [lugaresRuta]);

  // Obtener ruta usando Google Directions API
  const obtenerRutaReal = async () => {
    try {
      // Crear waypoints intermedios
      const origin = `${lugaresRuta[0].lat},${lugaresRuta[0].lng}`;
      const destination = `${lugaresRuta[lugaresRuta.length - 1].lat},${lugaresRuta[lugaresRuta.length - 1].lng}`;
      
      let waypoints = '';
      if (lugaresRuta.length > 2) {
        const intermedios = lugaresRuta.slice(1, -1);
        waypoints = intermedios.map(l => `${l.lat},${l.lng}`).join('|');
      }

      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ''}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.routes.length > 0) {
        const points = decodePolyline(data.routes[0].overview_polyline.points);
        setRutaCoords(points);
      } else {
        console.warn('No se pudo obtener la ruta:', data.status);
        // Fallback a línea recta
        setRutaCoords(lugaresRuta.map(l => ({ latitude: l.lat, longitude: l.lng })));
      }
    } catch (error) {
      console.error('Error al obtener ruta:', error);
      // Fallback a línea recta
      setRutaCoords(lugaresRuta.map(l => ({ latitude: l.lat, longitude: l.lng })));
    }
  };

  // Decodificar polyline de Google (formato encoded)
  const decodePolyline = (encoded) => {
    const poly = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      poly.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return poly;
  };

  const lugaresFiltrados = lugaresData.filter(l => {
    const matchNombre = l.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchCat = filtroCat === 'todos' || l.categoria === filtroCat;
    return matchNombre && matchCat;
  });

  const irALugar = (lugar) => {
    setLugarSeleccionado(lugar);
    mapRef.current?.animateToRegion({
      latitude: lugar.lat,
      longitude: lugar.lng,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    }, 1000);
  };

  const toggleRuta = (lugar) => {
    if (lugaresRuta.find(l => l.id === lugar.id)) {
      setLugaresRuta(prev => prev.filter(l => l.id !== lugar.id));
    } else {
      setLugaresRuta(prev => [...prev, lugar]);
    }
  };

  const verRutaCompleta = () => {
    if (lugaresRuta.length < 2) {
      Alert.alert("Ruta vacía", "Selecciona al menos 2 lugares para crear una ruta.");
      return;
    }
    
    const coordenadas = rutaCoords.length > 0 ? rutaCoords : lugaresRuta.map(l => ({
      latitude: l.lat,
      longitude: l.lng
    }));

    mapRef.current?.fitToCoordinates(coordenadas, {
      edgePadding: { top: 50, right: 50, bottom: 350, left: 50 },
      animated: true,
    });
  };

  const limpiarRuta = () => {
    setLugaresRuta([]);
    mapRef.current?.animateToRegion(AREQUIPA_CENTER, 1000);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* MAPA */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={AREQUIPA_CENTER}
        showsUserLocation={true}
        showsCompass={true}
      >
        {/* Círculos en lugar de marcadores */}
        {lugaresFiltrados.map(lugar => {
          const enRuta = lugaresRuta.find(l => l.id === lugar.id);
          return (
            <React.Fragment key={lugar.id}>
              {/* Círculo exterior (borde) */}
              <Circle
                center={{ latitude: lugar.lat, longitude: lugar.lng }}
                radius={50}
                fillColor={enRuta ? 'rgba(255, 107, 0, 0.3)' : 'rgba(102, 126, 234, 0.3)'}
                strokeColor={enRuta ? '#FF6B00' : '#667eea'}
                strokeWidth={3}
              />
              {/* Círculo interior (punto central) */}
              <Circle
                center={{ latitude: lugar.lat, longitude: lugar.lng }}
                radius={15}
                fillColor={enRuta ? '#FF6B00' : '#667eea'}
                strokeColor="#FFF"
                strokeWidth={2}
              />
              {/* Marcador invisible para detectar taps */}
              <Marker
                coordinate={{ latitude: lugar.lat, longitude: lugar.lng }}
                title={lugar.nombre}
                description={lugar.categoria}
                onPress={() => setLugarSeleccionado(lugar)}
                opacity={0}
              />
            </React.Fragment>
          );
        })}

        {/* Ruta siguiendo calles reales */}
        {rutaCoords.length >= 2 && (
          <Polyline
            coordinates={rutaCoords}
            strokeColor="#FF6B00"
            strokeWidth={4}
            lineDashPattern={[1]}
          />
        )}
      </MapView>

      {/* HEADER FLOTANTE */}
      <View style={styles.headerFloating}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput 
            placeholder="Buscar destino..." 
            style={styles.searchInput}
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>
      </View>

      {/* CATEGORÍAS */}
      <View style={styles.chipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 15}}>
          {CATEGORIAS.map(cat => (
            <TouchableOpacity 
              key={cat.id} 
              style={[styles.chip, filtroCat === cat.id && styles.chipActive]}
              onPress={() => setFiltroCat(cat.id)}
            >
              <Text style={[styles.chipText, filtroCat === cat.id && styles.chipTextActive]}>
                {cat.icono} {cat.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* PANEL INFERIOR */}
      <View style={styles.bottomPanel}>
        <View style={styles.panelHandle} />
        
        <View style={styles.rutaStatus}>
          <Text style={styles.listTitle}>
            {lugaresRuta.length} paradas seleccionadas
          </Text>
          {lugaresRuta.length > 0 && (
            <TouchableOpacity onPress={limpiarRuta}>
              <Text style={styles.clearText}>Limpiar</Text>
            </TouchableOpacity>
          )}
        </View>

        {lugaresRuta.length >= 2 ? (
          <TouchableOpacity style={styles.btnRoute} onPress={verRutaCompleta}>
            <LinearGradient
              colors={['#FF6B00', '#FF8C00']}
              style={styles.btnGradient}
            >
              <Text style={styles.btnRouteText}>🗺️ Ver Ruta Completa</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.hintBox}>
            <Text style={styles.hintText}>Selecciona lugares ("+") para armar tu camino</Text>
          </View>
        )}

        <Text style={styles.listTitle}>Lugares</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.placesList}>
          {lugaresFiltrados.map(lugar => {
            const enRuta = lugaresRuta.find(l => l.id === lugar.id);
            return (
              <TouchableOpacity 
                key={lugar.id} 
                style={[styles.placeCard, enRuta && styles.placeCardActive]}
                onPress={() => irALugar(lugar)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardCategory}>{lugar.categoria}</Text>
                  <TouchableOpacity onPress={() => toggleRuta(lugar)}>
                    <Text style={[styles.addIcon, enRuta && styles.addIconActive]}>
                      {enRuta ? '✓' : '+'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardTitle} numberOfLines={2}>{lugar.nombre}</Text>
                <Text style={styles.cardCoords}>
                  {lugar.lat.toFixed(3)}, {lugar.lng.toFixed(3)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: width,
    height: height,
    ...StyleSheet.absoluteFillObject,
  },
  
  headerFloating: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 10,
  },
  backBtn: {
    backgroundColor: 'white',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width:0, height:2},
    shadowOpacity:0.2,
    shadowRadius:4,
  },
  backArrow: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width:0, height:2},
    shadowOpacity:0.2,
    shadowRadius:4,
  },
  searchIcon: { marginRight: 10, fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: '#333' },

  chipsContainer: {
    position: 'absolute',
    top: 110,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  chip: {
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  chipActive: {
    backgroundColor: '#2d3748',
  },
  chipText: { fontWeight: '600', color: '#4a5568', fontSize: 13 },
  chipTextActive: { color: 'white' },

  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: 40,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {width:0, height:-5},
    shadowOpacity:0.1,
    shadowRadius:10,
    height: 320,
  },
  panelHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#e2e8f0',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 15,
  },
  rutaStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  rutaCounter: { fontSize: 14, fontWeight: '700', color: '#2d3748' },
  clearText: { fontSize: 13, color: '#e53e3e', fontWeight: '600' },
  
  btnRoute: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
  },
  btnGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnRouteText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  
  hintBox: {
    backgroundColor: '#f7fafc',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#edf2f7',
  },
  hintText: { color: '#718096', fontSize: 12 },

  listTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a202c', marginBottom: 10 },
  placesList: { gap: 15, paddingRight: 20 },


  textoNegrita: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333',
  },

  placeCard: {
    width: 133, // 5% menor (140 - 7)
    height: 104.5, // 5% menor (110 - 5.5)
    backgroundColor: '#FF6B00', // Fondo naranja
    borderRadius: 8,
    padding: 11,
    borderWidth: 0,
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    // Recortes en las esquinas (forma de clip-path simulada con borde)
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  placeCardActive: {
    backgroundColor: '#FF8C00', // Naranja más claro cuando está activo
    elevation: 5,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start' 
  },
  cardCategory: { 
    fontSize: 9, 
    color: '#FFF', // Texto blanco para contraste
    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
    padding: 3, 
    paddingHorizontal: 6,
    borderRadius: 4,
    fontWeight: '600',
  },
  addIcon: { 
    fontSize: 22, // Más grande
    color: '#1a1a1a', // Negro más oscuro
    fontWeight: '900', // Más negrita
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 28,
    height: 28,
    textAlign: 'center',
    lineHeight: 28,
    borderRadius: 14,
    overflow: 'hidden',
  },
  addIconActive: { 
    color: '#000', // Negro total
    backgroundColor: '#FFF',
  },
  cardTitle: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#FFF', // Texto blanco
    lineHeight: 16,
  },
  cardCoords: { 
    fontSize: 8, 
    color: 'rgba(255, 255, 255, 0.7)', // Blanco semitransparente
  },
});