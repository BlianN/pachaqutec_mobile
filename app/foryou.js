import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ImageBackground, 
  StatusBar, 
  Dimensions,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as API from '../services/api';

const { width } = Dimensions.get('window');

export default function ForYouPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Inicio');
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    cargarUsuario();
  }, []);

  const cargarUsuario = async () => {
    try {
      const userInfo = await API.getUserInfo();
      setUsuario(userInfo);
    } catch (error) {
      console.error('Error cargando usuario:', error);
    }
  };

  const handleNavigation = (tab, route) => {
    setActiveTab(tab);
    if (route) {
      router.push(route);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro que quieres salir?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Salir", 
          style: "destructive",
          onPress: async () => {
            await API.logout();
            router.replace('/');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.mountainIcon} />
          <Text style={styles.logoTextDark}>Pacha</Text>
          <Text style={styles.logoTextOrange}>Qutec</Text>
        </View>
        <View style={styles.userContainer}>
          <Text style={styles.userText}>Hola, {usuario?.nombre || 'Usuario'} 👋</Text>
        </View>
      </View>

      {/* MENÚ DE NAVEGACIÓN HORIZONTAL */}
      <View style={styles.navContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.navScroll}
        >
          
          <TouchableOpacity 
            style={[styles.navItem, activeTab === 'Inicio' && styles.navItemActive]}
            onPress={() => setActiveTab('Inicio')}
          >
            <Text style={[styles.navText, activeTab === 'Inicio' && styles.navTextActive]}>Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation('Lugares', '/lugares')}>
            <Text style={styles.navText}>Lugares</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation('Favoritos', '/favoritos')}>
            <Text style={styles.navText}>Favoritos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation('Rutas', '/rutas')}>
            <Text style={styles.navText}>Rutas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation('Reseñas', '/resenas')}>
            <Text style={styles.navText}>Reseñas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => handleNavigation('Contactanos', '/contactanos')}>
            <Text style={styles.navText}>Contáctanos</Text>
          </TouchableOpacity>

          {/* Botón RDF (Morado) */}
          <TouchableOpacity 
            style={[styles.navItem, styles.btnRDF]} 
            onPress={() => Alert.alert("Próximamente", "El visualizador RDF estará disponible pronto")}
          >
            <Ionicons name="globe-outline" size={16} color="white" style={{marginRight: 4}} />
            <Text style={styles.textRDF}>RDF</Text>
          </TouchableOpacity>

          {/* Botón Salir (Rojo) */}
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={handleLogout}
          >
            <Text style={[styles.navText, { color: '#e53e3e', fontWeight: 'bold' }]}>Salir</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>

      {/* CONTENIDO PRINCIPAL */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        
        {/* HERO CARD */}
        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={() => router.push('/lugares')} 
        >
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1534234828563-02511c59b583?auto=format&fit=crop&w=1000&q=80' }}
            style={styles.heroCard}
            imageStyle={{ borderRadius: 20 }}
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.heroOverlay}
            >
              <Text style={styles.heroLabel}>DESTINO DESTACADO</Text>
              <Text style={styles.heroTitle}>Cañón del Colca</Text>
              <View style={styles.btnExplore}>
                <Text style={styles.btnExploreText}>Explorar ahora</Text>
              </View>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>

        {/* SECCIÓN CATEGORÍAS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categorías</Text>
        </View>

        <View style={styles.categoriesList}>
          {/* Categoría Aventura */}
          <TouchableOpacity style={styles.categoryCard} onPress={() => router.push('/lugares')}>
            <View style={[styles.iconBox, { backgroundColor: '#ffe0b2' }]}>
              <Text style={{ fontSize: 24 }}>🧗</Text>
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryTitle}>Aventura</Text>
              <Text style={styles.categorySubtitle}>Adrenalina pura en los andes.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          {/* Categoría Gastronomía */}
          <TouchableOpacity style={styles.categoryCard} onPress={() => router.push('/lugares')}>
            <View style={[styles.iconBox, { backgroundColor: '#e1bee7' }]}>
              <Text style={{ fontSize: 24 }}>🍲</Text>
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryTitle}>Gastronomía</Text>
              <Text style={styles.categorySubtitle}>El sabor único de Arequipa.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          {/* Categoría Cultura */}
          <TouchableOpacity style={styles.categoryCard} onPress={() => router.push('/lugares')}>
            <View style={[styles.iconBox, { backgroundColor: '#cfd8dc' }]}>
              <Text style={{ fontSize: 24 }}>🏛️</Text>
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryTitle}>Cultura</Text>
              <Text style={styles.categorySubtitle}>Historia en cada sillar.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* BOTÓN FLOTANTE (CHAT) */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => Alert.alert("Próximamente", "El chatbot estará disponible pronto")}
      >
        <LinearGradient
          colors={['#ff6b00', '#ff9100']}
          style={styles.fabGradient}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  mountainIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#ff6b00',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginRight: 5,
  },
  logoTextDark: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a202c',
  },
  logoTextOrange: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ff6b00',
  },
  userContainer: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  userText: {
    fontWeight: '700',
    color: '#1a202c',
    fontSize: 13,
  },

  navContainer: {
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  navScroll: {
    paddingHorizontal: 15,
    alignItems: 'center',
    paddingRight: 30,
  },
  navItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
  },
  navText: {
    fontWeight: '600',
    color: '#718096',
    fontSize: 14,
  },
  navTextActive: {
    color: '#ff6b00',
    fontWeight: '700',
  },
  btnRDF: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  textRDF: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },

  mainContent: {
    flex: 1,
    padding: 20,
  },

  heroCard: {
    width: '100%',
    height: 220,
    justifyContent: 'flex-end',
    borderRadius: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  heroOverlay: {
    padding: 20,
    borderRadius: 20,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 5,
  },
  heroTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 15,
  },
  btnExplore: {
    backgroundColor: '#ff6b00',
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  btnExploreText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },

  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a202c',
  },
  categoriesList: {
    gap: 15,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },

  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#ff6b00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});