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

  const integrantes = [
    {
      id: 1,
      nombre: "Mijael Pol Escobar Aguilar",
      correo: "mijael.escobar@ucsp.edu.pe",
      linkedin: "https://www.linkedin.com/in/mijael-pol-escobar-aguilar-b12a44306",
      facebook: null,
      instagram: null, // Sin IG
      telefono: "+51 965 370 265",
      rol: "Backend & IA Lead",
      iniciales: "ME",
      color: ['#4facfe', '#00f2fe'] // Azul
    },
    {
      id: 2,
      nombre: "Diego Miguel Calancho Llerena",
      correo: "diego.calancho@ucsp.edu.pe",
      linkedin: "https://www.linkedin.com/in/diego-miguel-calancho-llerena-515751336/?originalSubdomain=pe",
      facebook: null,
      instagram: "https://www.instagram.com/diego2lc13/?utm_source=ig_web_button_share_sheet",
      telefono: "+51 977 972 045",
      rol: "Backend Developer",
      iniciales: "DC",
      color: ['#43e97b', '#38f9d7'] // Verde
    },
    {
      id: 3,
      nombre: "Rodrigo Fredy Sulla Gonzales",
      correo: "rodrigo.sulla@ucsp.edu.pe",
      linkedin: "https://www.linkedin.com/in/rodrigo-fredy-sulla-gonzales-6b1601326/?originalSubdomain=pe",
      facebook: null,
      instagram: "https://www.instagram.com/rodrigo.f06",
      telefono: "+51 983 104 472",
      rol: "Frontend & UI/UX",
      iniciales: "RS",
      color: ['#fa709a', '#fee140'] // Rosa/Naranja
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleVolver} style={styles.btnVolver}>
          <Ionicons name="arrow-back" size={24} color="#1A202C" />
        </TouchableOpacity>
        <View style={styles.logoSection}>
          <LinearGradient
            colors={['#ff6b00', '#ff9f43']}
            style={styles.mountainIcon}
          />
          <Text style={styles.logoText}>
            <Text style={{ color: '#2d3748' }}>Pacha</Text>
            <Text style={{ color: '#ff6b00' }}>Qutec</Text>
          </Text>
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
                {/* Banner */}
                <LinearGradient
                  colors={integrante.color}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardBanner}
                />
                
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={[styles.avatarText, { color: '#2D3748' }]}>{integrante.iniciales}</Text>
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
                      <View style={styles.iconCircle}>
                        <Ionicons name="mail" size={16} color="#4A5568" />
                      </View>
                      <Text style={styles.contactText} numberOfLines={1}>{integrante.correo}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => abrirEnlace(`tel:${integrante.telefono}`)} style={styles.contactItem}>
                      <View style={styles.iconCircle}>
                        <Ionicons name="call" size={16} color="#4A5568" />
                      </View>
                      <Text style={styles.contactText}>{integrante.telefono}</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Redes Sociales (Condicionales) */}
                  <View style={styles.socialRow}>
                    {integrante.linkedin && (
                      <TouchableOpacity 
                        style={[styles.socialBtn, { backgroundColor: '#0077b5' }]}
                        onPress={() => abrirEnlace(integrante.linkedin)}
                      >
                        <Ionicons name="logo-linkedin" size={20} color="white" />
                      </TouchableOpacity>
                    )}

                    {integrante.facebook && (
                      <TouchableOpacity 
                        style={[styles.socialBtn, { backgroundColor: '#1877f2' }]}
                        onPress={() => abrirEnlace(integrante.facebook)}
                      >
                        <Ionicons name="logo-facebook" size={20} color="white" />
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

        {/* INFO PROYECTO */}
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
              <Text style={styles.infoIcon}>🚀</Text>
              <View>
                <Text style={styles.infoLabel}>VERSION</Text>
                <Text style={styles.infoValue}>1.0.0</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    elevation: 2,
  },
  logoSection: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mountainIcon: { width: 24, height: 24, borderRadius: 6, transform: [{ rotate: '45deg' }] },
  logoText: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  btnVolver: { padding: 8, borderRadius: 20, backgroundColor: '#F7FAFC' },

  scrollContent: { padding: 20, paddingBottom: 50 },
  
  heroSection: { alignItems: 'center', marginBottom: 35, marginTop: 10 },
  tagline: { color: '#FF6B00', fontWeight: '800', fontSize: 12, letterSpacing: 1.5, marginBottom: 5 },
  mainTitle: { fontSize: 32, fontWeight: '800', color: '#1A202C', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#718096', textAlign: 'center', maxWidth: '80%', lineHeight: 22 },

  integrantesGrid: { gap: 30, marginBottom: 40 },
  cardContainer: { width: '100%' },
  card: { backgroundColor: 'white', borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 5 },
  cardBanner: { height: 90, width: '100%', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  avatarContainer: { alignItems: 'center', marginTop: -45 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'white', elevation: 4 },
  avatarText: { fontSize: 32, fontWeight: '800' },
  
  cardContent: { padding: 24, paddingTop: 10, alignItems: 'center' },
  nombre: { fontSize: 20, fontWeight: '700', color: '#2D3748', textAlign: 'center', marginBottom: 8 },
  rolBadge: { backgroundColor: '#EDF2F7', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 20 },
  rolText: { color: '#4A5568', fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },
  divider: { width: '100%', height: 1, backgroundColor: '#E2E8F0', marginBottom: 20 },
  
  contactList: { width: '100%', gap: 12, marginBottom: 24 },
  contactItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 4 },
  iconCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F7FAFC', justifyContent: 'center', alignItems: 'center' },
  contactText: { color: '#718096', fontSize: 14, fontWeight: '500' },

  socialRow: { flexDirection: 'row', gap: 20 },
  socialBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 3 },

  projectInfoSection: { backgroundColor: 'white', borderRadius: 20, padding: 24, elevation: 2, borderWidth: 1, borderColor: '#F0F0F0' },
  infoTitle: { fontSize: 18, fontWeight: '800', color: '#2D3748', textAlign: 'center', marginBottom: 20 },
  infoCardsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoMiniCard: { flex: 1, alignItems: 'center', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, marginHorizontal: 4 },
  infoIcon: { fontSize: 20, marginBottom: 8 },
  infoLabel: { fontSize: 9, fontWeight: '800', color: '#A0AEC0', marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '700', color: '#2D3748' },

  footer: { marginTop: 40, alignItems: 'center' },
  footerText: { color: '#718096', fontSize: 13, fontWeight: '600' },
  footerSubText: { color: '#A0AEC0', fontSize: 11, marginTop: 4 }
});