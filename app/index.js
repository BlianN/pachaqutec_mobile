import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ImageBackground, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  StatusBar 
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Presentacion() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER FIJO */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.mountainIcon} />
          <View style={{ flexDirection: 'row' }}>
            <Text style={[styles.logoText, { color: '#1a202c' }]}>Pacha</Text>
            <Text style={[styles.logoText, { color: '#ff6b00' }]}>Qutec</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.btnLoginOutline} onPress={handleLogin}>
          <Text style={styles.btnLoginText}>Entrar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* HERO SECTION */}
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1582489720279-db8b8a6b8a7a?auto=format&fit=crop&w=2000&q=80' }} 
          style={styles.heroSection}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(26,32,44,0.9)']}
            style={styles.heroOverlay}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>✨ Descubre Arequipa</Text>
              </View>

              <Text style={styles.heroTitle}>
                Vive la magia de la{'\n'}
                <Text style={styles.highlightText}>Ciudad Blanca</Text>
              </Text>

              <Text style={styles.heroDescription}>
                Tu compañero inteligente para explorar los secretos de Arequipa.
              </Text>

              {/* Estadísticas */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>50+</Text>
                  <Text style={styles.statLabel}>Destinos</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>AI</Text>
                  <Text style={styles.statLabel}>Powered</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>100%</Text>
                  <Text style={styles.statLabel}>Arequipeño</Text>
                </View>
              </View>

              <TouchableOpacity onPress={handleLogin} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#ff6b00', '#ff8c00']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.btnPrimary}
                >
                  <Text style={styles.btnPrimaryText}>🚀 Comenzar mi aventura</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ImageBackground>

        {/* FEATURES SECTION */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>¿Por qué PachaQutec?</Text>
          <Text style={styles.sectionSubtitle}>Tu "pata" digital en Arequipa.</Text>

          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255, 107, 0, 0.1)' }]}>
                <Text style={{ fontSize: 24 }}>🎯</Text>
              </View>
              <Text style={styles.featureTitle}>Rutas IA</Text>
              <Text style={styles.featureDesc}>Nuestro algoritmo aprende qué te gusta y te arma el plan perfecto.</Text>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(102, 126, 234, 0.1)' }]}>
                <Text style={{ fontSize: 24 }}>🤖</Text>
              </View>
              <Text style={styles.featureTitle}>Asistente 24/7</Text>
              <Text style={styles.featureDesc}>¿Te perdiste? El asistente virtual te salva al toque.</Text>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(118, 75, 162, 0.1)' }]}>
                <Text style={{ fontSize: 24 }}>🏔️</Text>
              </View>
              <Text style={styles.featureTitle}>Local Vibe</Text>
              <Text style={styles.featureDesc}>Te llevamos donde comen los verdaderos arequipeños.</Text>
            </View>
          </View>
        </View>

        {/* CTA SECTION */}
        <View style={styles.ctaSection}>
          <LinearGradient
            colors={['#1a202c', '#434343']}
            style={styles.ctaPanel}
          >
            <Text style={styles.ctaTitle}>¿Listo para tu próxima aventura?</Text>
            <Text style={styles.ctaDesc}>Únete a los viajeros que ya están descubriendo Arequipa.</Text>
            <TouchableOpacity style={styles.btnWhite} onPress={handleLogin}>
              <Text style={styles.btnWhiteText}>Crear cuenta gratis</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>PachaQutec</Text>
          <Text style={styles.footerText}>© 2025. Hecho con ❤️ y un buen Adobo.</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mountainIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#ff6b00',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
  },
  btnLoginOutline: {
    borderWidth: 1.5,
    borderColor: '#1a202c',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },
  btnLoginText: {
    fontWeight: '600',
    fontSize: 12,
    color: '#1a202c',
  },
  
  heroSection: {
    width: width,
    height: height,
    justifyContent: 'center',
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    width: '100%',
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 107, 0, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ff6b00',
    marginBottom: 20,
  },
  heroBadgeText: {
    color: '#ff9f43',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 40,
  },
  highlightText: {
    color: '#ff9f43',
  },
  heroDescription: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 22,
  },
  
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 30,
    gap: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  
  btnPrimary: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#ff6b00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  btnPrimaryText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  featuresSection: {
    padding: 30,
    backgroundColor: '#f8fafc',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a202c',
    textAlign: 'center',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 30,
  },
  featuresGrid: {
    gap: 20,
  },
  featureCard: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: 8,
  },
  featureDesc: {
    color: '#718096',
    lineHeight: 20,
  },

  ctaSection: {
    padding: 20,
    backgroundColor: 'white',
    paddingBottom: 50,
  },
  ctaPanel: {
    padding: 40,
    borderRadius: 25,
    alignItems: 'center',
  },
  ctaTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  ctaDesc: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 25,
  },
  btnWhite: {
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  btnWhiteText: {
    color: '#1a202c',
    fontWeight: 'bold',
    fontSize: 16,
  },

  footer: {
    backgroundColor: 'black',
    padding: 30,
    alignItems: 'center',
  },
  footerBrand: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  footerText: {
    color: '#718096',
    fontSize: 12,
  },
});