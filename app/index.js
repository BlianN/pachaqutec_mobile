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
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* HEADER FLOTANTE (Glass Dark) */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={['#ff6b00', '#fbbf24']}
            style={styles.mountainIcon}
          />
          <View style={{ flexDirection: 'row' }}>
            <Text style={[styles.logoText, { color: '#ffffff' }]}>Pacha</Text>
            <Text style={[styles.logoText, { color: '#ff6b00' }]}>Qutec</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.btnLoginOutline} onPress={handleLogin}>
          <Text style={styles.btnLoginText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* HERO SECTION */}
        <ImageBackground 
          source={{ uri: 'https://www.peru.travel/Contenido/Atractivo/Imagen/es/10/1.1/Principal/Yanahuara.jpg' }} 
          style={styles.heroSection}
        >
          {/* Overlay Dark Premium (Igual a la web) */}
          <LinearGradient
            colors={['rgba(10,10,10,0.7)', 'rgba(10,10,10,0.95)', '#0a0a0a']}
            style={styles.heroOverlay}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>✨ Descubre Arequipa nivel legendario</Text>
              </View>

              <Text style={styles.heroTitle}>
                Vive la magia de la{'\n'}
                <Text style={styles.highlightText}>Ciudad Blanca</Text>
              </Text>

              <Text style={styles.heroDescription}>
                Tu compañero inteligente para explorar los secretos de Arequipa. 
                Rutas con IA y experiencias únicas.
              </Text>

              {/* Estadísticas (Dark Glass) */}
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
                  <Text style={styles.statLabel}>Local</Text>
                </View>
              </View>

              <TouchableOpacity onPress={handleLogin} activeOpacity={0.8} style={styles.heroBtnContainer}>
                <LinearGradient
                  colors={['#ff6b00', '#e65100']}
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

        {/* FEATURES SECTION (Dark) */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>¿Por qué PachaQutec?</Text>
          <Text style={styles.sectionSubtitle}>No es solo una app, es tu "pata" digital.</Text>

          <View style={styles.featuresGrid}>
            {/* Card 1 */}
            <View style={styles.featureCard}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255, 107, 107, 0.1)' }]}>
                <Text style={{ fontSize: 24 }}>🎯</Text>
              </View>
              <Text style={styles.featureTitle}>Rutas IA</Text>
              <Text style={styles.featureDesc}>Nuestro algoritmo aprende qué te gusta y te arma el plan perfecto.</Text>
            </View>

            {/* Card 2 */}
            <View style={styles.featureCard}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(78, 205, 196, 0.1)' }]}>
                <Text style={{ fontSize: 24 }}>🤖</Text>
              </View>
              <Text style={styles.featureTitle}>Asistente 24/7</Text>
              <Text style={styles.featureDesc}>¿Te perdiste? ¿Hambre a las 2 AM? El asistente virtual te salva.</Text>
            </View>

            {/* Card 3 */}
            <View style={styles.featureCard}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255, 230, 109, 0.1)' }]}>
                <Text style={{ fontSize: 24 }}>🏔️</Text>
              </View>
              <Text style={styles.featureTitle}>Local Vibe</Text>
              <Text style={styles.featureDesc}>Te llevamos donde comen los verdaderos arequipeños.</Text>
            </View>
            
             {/* Card 4 */}
             <View style={styles.featureCard}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255, 159, 67, 0.1)' }]}>
                <Text style={{ fontSize: 24 }}>⚡</Text>
              </View>
              <Text style={styles.featureTitle}>A tu ritmo</Text>
              <Text style={styles.featureDesc}>¿Tienes 2 horas o 2 semanas? Optimizamos tu tiempo al máximo.</Text>
            </View>
          </View>
        </View>

        {/* CTA SECTION (Gradient Dark) */}
        <View style={styles.ctaSection}>
          <LinearGradient
            colors={['#1a1a1a', '#0d0d0d']}
            style={styles.ctaPanel}
          >
            <Text style={styles.ctaTitle}>¿Listo para tu próxima aventura?</Text>
            <Text style={styles.ctaDesc}>Únete a los viajeros que ya están descubriendo el verdadero Arequipa.</Text>
            
            <TouchableOpacity style={styles.btnWhite} onPress={handleLogin}>
              <Text style={styles.btnWhiteText}>Crear cuenta gratis</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>PachaQutec</Text>
          <Text style={styles.footerText}>© 2025. Hecho con ❤️ y un buen Adobo.</Text>
          <View style={styles.footerLinks}>
             <Text style={styles.footerLink}>UCSP</Text>
             <Text style={styles.footerLink}>Proyecto DBP</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

// ESTILOS DARK PREMIUM WEB-MATCH
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a', // Fondo negro profundo
  },
  scrollView: {
    flex: 1,
  },
  
  // HEADER GLASS DARK
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
    paddingVertical: 12,
    backgroundColor: 'rgba(10, 10, 10, 0.85)', // Oscuro translúcido
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mountainIcon: {
    width: 28,
    height: 28,
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  btnLoginOutline: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
  },
  btnLoginText: {
    fontWeight: '600',
    fontSize: 13,
    color: '#ffffff',
  },
  
  // HERO SECTION
  heroSection: {
    width: width,
    height: height, // Full screen
    justifyContent: 'center',
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    width: '100%',
    marginTop: 40,
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ff6b00',
    marginBottom: 20,
  },
  heroBadgeText: {
    color: '#fbbf24', // Accent color
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 44,
  },
  highlightText: {
    color: '#ff6b00', // Primary color
    textShadowColor: 'rgba(255, 107, 0, 0.3)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 20,
  },
  heroDescription: {
    color: '#a0aec0',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 35,
    lineHeight: 24,
    maxWidth: 300,
  },
  
  // STATS DARK
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 40,
    gap: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: 'white',
    fontWeight: '800',
    fontSize: 18,
  },
  statLabel: {
    color: '#ff6b00',
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  
  heroBtnContainer: {
    width: '100%',
    shadowColor: '#ff6b00',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  btnPrimary: {
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // FEATURES DARK
  featuresSection: {
    padding: 30,
    paddingVertical: 60,
    backgroundColor: '#0a0a0a', // Dark background
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#a0aec0',
    textAlign: 'center',
    marginBottom: 40,
  },
  featuresGrid: {
    gap: 25,
  },
  featureCard: {
    backgroundColor: '#141414', // Card dark bg
    padding: 25,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 5,
  },
  iconWrapper: {
    width: 55,
    height: 55,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f5f5f5',
    marginBottom: 8,
  },
  featureDesc: {
    color: '#a0aec0',
    lineHeight: 22,
    fontSize: 14,
  },

  // CTA SECTION DARK
  ctaSection: {
    padding: 20,
    backgroundColor: '#0a0a0a',
    paddingBottom: 60,
  },
  ctaPanel: {
    padding: 40,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  ctaTitle: {
    color: 'white',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 15,
  },
  ctaDesc: {
    color: '#a0aec0',
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 15,
    lineHeight: 22,
  },
  btnWhite: {
    backgroundColor: 'white',
    paddingHorizontal: 35,
    paddingVertical: 14,
    borderRadius: 50,
    shadowColor: '#fff',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  btnWhiteText: {
    color: '#0a0a0a',
    fontWeight: '800',
    fontSize: 16,
  },

  // FOOTER DARK
  footer: {
    backgroundColor: '#050505',
    padding: 40,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  footerBrand: {
    color: 'white',
    fontWeight: '800',
    fontSize: 20,
    marginBottom: 8,
  },
  footerText: {
    color: '#718096',
    fontSize: 13,
    marginBottom: 20,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 20,
  },
  footerLink: {
    color: '#a0aec0',
    fontWeight: '600',
    fontSize: 12,
  }
});