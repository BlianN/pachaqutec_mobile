import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Linking, 
  StatusBar,
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ContactanosPage() {
  const router = useRouter();
  
  // Valores animados
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      })
    ]).start();
  }, []);

  const handleVolver = () => {
    router.back();
  };

  const abrirEnlace = (url) => {
    if(url) Linking.openURL(url).catch(err => console.error("Error al abrir link:", err));
  };

  // DATOS DEL EQUIPO (Configurados según tu solicitud)
  const integrantes = [
    {
      id: 1,
      nombre: "Mijael Pol Escobar Aguilar",
      correo: "mijael.escobar@ucsp.edu.pe",
      linkedin: "https://www.linkedin.com/in/mijael-pol-escobar-aguilar-b12a44306",
      instagram: null, // SOLO LINKEDIN
      telefono: "+51 965 370 265",
      rol: "Backend & IA Lead",
      iniciales: "ME",
      color: ['#0f172a', '#1e293b'] // Azul oscuro elegante
    },
    {
      id: 2,
      nombre: "Diego Miguel Calancho Llerena",
      correo: "diego.calancho@ucsp.edu.pe",
      linkedin: "https://www.linkedin.com/in/diego-miguel-calancho-llerena-515751336/",
      instagram: "https://www.instagram.com/diego2lc13/",
      telefono: "+51 977 972 045",
      rol: "Backend Developer",
      iniciales: "DC",
      color: ['#0f172a', '#334155'] 
    },
    {
      id: 3,
      nombre: "Rodrigo Fredy Sulla Gonzales",
      correo: "rodrigo.sulla@ucsp.edu.pe",
      linkedin: "https://www.linkedin.com/in/rodrigo-fredy-sulla-gonzales-6b1601326/",
      instagram: "https://www.instagram.com/rodrigo.f06",
      telefono: "+51 983 104 472",
      rol: "Frontend & UI/UX",
      iniciales: "RS",
      color: ['#0f172a', '#475569']
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* HEADER DARK */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleVolver} style={styles.btnVolver}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.logoSection}>
          <LinearGradient
            colors={['#ff6b00', '#fbbf24']}
            style={styles.mountainIcon}
          />
          <View style={{flexDirection:'row'}}>
             <Text style={[styles.logoText, { color: '#fff' }]}>Pacha</Text>
             <Text style={[styles.logoText, { color: '#ff6b00' }]}>Qutec</Text>
          </View>
        </View>
        
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HERO TITLE */}
        <Animated.View style={[styles.heroSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.tagline}>TEAM DEVELOPERS</Text>
          <Text style={styles.mainTitle}>Conoce al Equipo</Text>
          <Text style={styles.subtitle}>
            Ingeniería y creatividad arequipeña detrás de tu próxima aventura.
          </Text>
        </Animated.View>

        {/* GRID INTEGRANTES */}
        <View style={styles.integrantesGrid}>
          {integrantes.map((integrante) => (
            <Animated.View 
              key={integrante.id} 
              style={[
                styles.cardContainer, 
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <View style={styles.card}>
                {/* Banner Dark Gradient */}
                <LinearGradient
                  colors={['#1a1a1a', '#000']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardBanner}
                />
                
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{integrante.iniciales}</Text>
                  </View>
                </View>

                {/* Contenido */}
                <View style={styles.cardContent}>
                  <Text style={styles.nombre}>{integrante.nombre}</Text>
                  <View style={styles.rolBadge}>
                    <Text style={styles.rolText}>{integrante.rol}</Text>
                  </View>

                  <View style={styles.divider} />

                  {/* Contacto */}
                  <View style={styles.contactList}>
                    <TouchableOpacity onPress={() => abrirEnlace(`mailto:${integrante.correo}`)} style={styles.contactItem}>
                      <Ionicons name="mail" size={16} color="#ff6b00" />
                      <Text style={styles.contactText}>{integrante.correo}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => abrirEnlace(`tel:${integrante.telefono}`)} style={styles.contactItem}>
                      <Ionicons name="call" size={16} color="#ff6b00" />
                      <Text style={styles.contactText}>{integrante.telefono}</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Redes Sociales (Lógica Específica) */}
                  <View style={styles.socialRow}>
                    {integrante.linkedin && (
                      <TouchableOpacity 
                        style={[styles.socialBtn, { backgroundColor: '#0077b5' }]}
                        onPress={() => abrirEnlace(integrante.linkedin)}
                      >
                        <Ionicons name="logo-linkedin" size={20} color="white" />
                      </TouchableOpacity>
                    )}

                    {integrante.instagram && (
                      <TouchableOpacity 
                        style={[styles.socialBtn, { backgroundColor: '#E1306C' }]}
                        onPress={() => abrirEnlace(integrante.instagram)}
                      >
                        <Ionicons name="logo-instagram" size={20} color="white" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* INFO PROYECTO (Estilo Dark Card) */}
        <View style={styles.projectInfoSection}>
          <Text style={styles.infoTitle}>Detalles del Proyecto</Text>
          
          <View style={styles.infoCardsRow}>
            <View style={styles.infoMiniCard}>
              <Text style={styles.infoIcon}>🏫</Text>
              <View>
                <Text style={styles.infoLabel}>UNIVERSIDAD</Text>
                <Text style={styles.infoValue}>UCSP</Text>
              </View>
            </View>

            <View style={styles.infoMiniCard}>
              <Text style={styles.infoIcon}>💻</Text>
              <View>
                <Text style={styles.infoLabel}>CURSO</Text>
                <Text style={styles.infoValue}>DBP</Text>
              </View>
            </View>

            <View style={styles.infoMiniCard}>
              <Text style={styles.infoIcon}>📅</Text>
              <View>
                <Text style={styles.infoLabel}>AÑO</Text>
                <Text style={styles.infoValue}>2025</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Hecho con ❤️ en Arequipa, Perú</Text>
          <Text style={styles.footerSubText}>© 2025 PachaQutec</Text>
        </View>

      </ScrollView>
    </View>
  );
}

// ESTILOS DARK PREMIUM
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a', // Fondo Negro Web
  },
  
  // HEADER
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(10, 10, 10, 0.9)', // Glass Dark
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  logoSection: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mountainIcon: { width: 24, height: 24, borderRadius: 4, transform: [{ rotate: '45deg' }] },
  logoText: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  btnVolver: { padding: 8, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)' },

  scrollContent: { padding: 20, paddingBottom: 50 },
  
  // HERO
  heroSection: { alignItems: 'center', marginBottom: 40, marginTop: 10 },
  tagline: { color: '#ff6b00', fontWeight: '800', fontSize: 12, letterSpacing: 2, marginBottom: 8 },
  mainTitle: { fontSize: 32, fontWeight: '800', color: 'white', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#a0a0a0', textAlign: 'center', maxWidth: '90%', lineHeight: 22 },

  // GRID
  integrantesGrid: { gap: 30, marginBottom: 50 },
  cardContainer: { width: '100%' },
  
  // CARD
  card: { 
    backgroundColor: '#141414', // Card Dark
    borderRadius: 24, 
    borderWidth: 1,
    borderColor: '#2a2a2a',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.5, 
    shadowRadius: 20, 
    elevation: 5 
  },
  cardBanner: { height: 90, width: '100%', borderTopLeftRadius: 24, borderTopRightRadius: 24, opacity: 0.8 },
  
  avatarContainer: { alignItems: 'center', marginTop: -45 },
  avatar: { 
    width: 90, height: 90, borderRadius: 45, 
    backgroundColor: '#141414', 
    justifyContent: 'center', alignItems: 'center', 
    borderWidth: 4, borderColor: '#141414', 
    elevation: 4 
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#ff6b00' },
  
  cardContent: { padding: 24, paddingTop: 10, alignItems: 'center' },
  nombre: { fontSize: 20, fontWeight: '700', color: 'white', textAlign: 'center', marginBottom: 10 },
  rolBadge: { 
    backgroundColor: 'rgba(255, 107, 0, 0.1)', 
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(255, 107, 0, 0.2)'
  },
  rolText: { color: '#ff6b00', fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },
  
  divider: { width: '100%', height: 1, backgroundColor: '#2a2a2a', marginBottom: 20 },
  
  contactList: { width: '100%', gap: 15, marginBottom: 25 },
  contactItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  contactText: { color: '#a0a0a0', fontSize: 14, fontWeight: '500' },

  socialRow: { flexDirection: 'row', gap: 20 },
  socialBtn: { 
    width: 44, height: 44, borderRadius: 22, 
    justifyContent: 'center', alignItems: 'center', elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5
  },

  // INFO PROYECTO
  projectInfoSection: { 
    backgroundColor: '#141414', 
    borderRadius: 20, padding: 24, 
    borderWidth: 1, borderColor: '#2a2a2a' 
  },
  infoTitle: { fontSize: 18, fontWeight: '800', color: 'white', textAlign: 'center', marginBottom: 20 },
  infoCardsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoMiniCard: { 
    flex: 1, alignItems: 'center', 
    backgroundColor: '#1f1f1f', 
    padding: 15, borderRadius: 12, marginHorizontal: 4,
    borderLeftWidth: 3, borderLeftColor: '#ff6b00'
  },
  infoIcon: { fontSize: 20, marginBottom: 8 },
  infoLabel: { fontSize: 9, fontWeight: '800', color: '#666', marginBottom: 4, letterSpacing: 1 },
  infoValue: { fontSize: 14, fontWeight: '700', color: 'white' },

  // FOOTER
  footer: { marginTop: 40, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#2a2a2a', paddingTop: 20 },
  footerText: { color: '#666', fontSize: 13, fontWeight: '600' },
  footerSubText: { color: '#444', fontSize: 11, marginTop: 4 }
});