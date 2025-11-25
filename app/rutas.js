import React, { useState, useRef } from 'react';
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
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const AREQUIPA_CENTER = {
  latitude: -16.398866,
  longitude: -71.536961,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

// Lugares hardcodeados (después puedes conectar con API)
const LUGARES_DATA = [
  { id: 1, nombre: 'Plaza de Armas', categoria: 'Histórico', lat: -16.398866, lng: -71.536961 },
  { id: 2, nombre: 'Monasterio Santa Catalina', categoria: 'Histórico', lat: -16.396067, lng: -71.536600 },
  { id: 3, nombre: 'Mirador de Yanahuara', categoria: 'Mirador', lat: -16.387572, lng: -71.541974 },
  { id: 4, nombre: 'Mundo Alpaca', categoria: 'Cultura', lat: -16.392918, lng: -71.535439 },
  { id: 5, nombre: 'Mercado San Camilo', categoria: 'Gastronomía', lat: -16.402852, lng: -71.534973 },
];

const CATEGORIAS = [
  { id: 'todos', nombre: 'Todos', icono: '🌎' },
  { id: 'Histórico', nombre: 'Histórico', icono: '🏛️' },
  { id: 'Aventura', nombre: 'Aventura', icono: '🧗' },
  { id: 'Gastronomía', nombre: 'Comida', icono: '🍲' },
];

export default function RutasPage() {
  const router = useRouter();
  const mapRef = useRef(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroCat, setFiltroCat] = useState("todos");
  const [lugaresRuta, setLugaresRuta] = useState([]);
  const [lugarSeleccionado, setLugarSeleccionado] = useState(null);

  const lugaresFiltrados = LUGARES_DATA.filter(l => {
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
    
    const coordenadas = lugaresRuta.map(l => ({
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
        {lugaresFiltrados.map(lugar => (
          <Marker
            key={lugar.id}
            coordinate={{ latitude: lugar.lat, longitude: lugar.lng }}
            title={lugar.nombre}
            description={lugar.categoria}
            onPress={() => setLugarSeleccionado(lugar)}
            pinColor={lugaresRuta.find(l => l.id === lugar.id) ? '#FF6B00' : '#667eea'}
          />
        ))}

        {lugaresRuta.length >= 2 && (
          <Polyline
            coordinates={lugaresRuta.map(l => ({ latitude: l.lat, longitude: l.lng }))}
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
          <Text style={styles.rutaCounter}>
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

        <Text style={styles.listTitle}>Lugares cercanos</Text>
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
  
  placeCard: {
    width: 140,
    height: 110,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'space-between',
    elevation: 2,
  },
  placeCardActive: {
    borderColor: '#FF6B00',
    backgroundColor: '#fffaf0',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardCategory: { fontSize: 10, color: '#718096', backgroundColor: '#f7fafc', padding: 3, borderRadius: 5 },
  addIcon: { fontSize: 18, color: '#cbd5e0', fontWeight: 'bold' },
  addIconActive: { color: '#FF6B00' },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#2d3748' },
  cardCoords: { fontSize: 9, color: '#a0aec0' },
});