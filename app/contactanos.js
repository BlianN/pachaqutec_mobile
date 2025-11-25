import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Linking, 
  StatusBar,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ContactanosPage() {
  const router = useRouter();

  const handleVolver = () => {
    router.back();
  };

  const abrirEnlace = (url) => {
    Linking.openURL(url).catch(err => console.error("Error al abrir link:", err));
  };

  const integrantes = [
    {
      id: 1,
      nombre: "Mijael Pol Escobar Aguilar",
      correo: "mijael.escobar@ucsp.edu.pe",
      linkedin: "https://linkedin.com/in/mijael-escobar",
      facebook: "https://facebook.com/mijael.escobar",
      instagram: "https://instagram.com/mijael.escobar",
      telefono: "+51 123 456 789",
      rol: "Backend & IA Lead",
      iniciales: "ME"
    },
    {
      id: 2,
      nombre: "Diego Miguel Calancho Llerena",
      correo: "diego.calancho@ucsp.edu.pe",
      linkedin: "https://linkedin.com/in/diego-calancho",
      facebook: "https://facebook.com/diego.calancho",
      instagram: "https://instagram.com/diego.calancho",
      telefono: "+51 987 654 321",
      rol: "Backend Developer",
      iniciales: "DC"
    },
    {
      id: 3,
      nombre: "Rodrigo Fredy Sulla Gonzales",
      correo: "rodrigo.sulla@ucsp.edu.pe",
      linkedin: "https://linkedin.com/in/rodrigo-sulla",
      facebook: "https://facebook.com/rodrigo.sulla",
      instagram: "https://instagram.com/rodrigo.sulla",
      telefono: "+51 456 789 123",
      rol: "Frontend & UI/UX",
      iniciales: "RS"
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
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
        
        <TouchableOpacity onPress={handleVolver} style={styles.btnVolver}>
          <Text style={styles.btnVolverText}>← Volver</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HERO TITLE */}
        <View style={styles.heroSection}>
          <Text style={styles.mainTitle}>Nuestro Equipo</Text>
          <Text style={styles.subtitle}>
            Mentes creativas detrás de tu próxima aventura.
          </Text>
        </View>

        {/* GRID INTEGRANTES */}
        <View style={styles.integrantesGrid}>
          {integrantes.map((integrante) => (
            <View key={integrante.id} style={styles.card}>
              {/* Banner Gradiente */}
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.cardBanner}
              />
              
              {/* Avatar Flotante */}
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
                    <Text style={styles.icon}>📧</Text>
                    <Text style={styles.contactText} numberOfLines={1}>{integrante.correo}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={() => abrirEnlace(`tel:${integrante.telefono}`)} style={styles.contactItem}>
                    <Text style={styles.icon}>📱</Text>
                    <Text style={styles.contactText}>{integrante.telefono}</Text>
                  </TouchableOpacity>
                </View>

                {/* Redes Sociales */}
                <View style={styles.socialRow}>
                  <TouchableOpacity 
                    style={[styles.socialBtn, { backgroundColor: '#0077b5' }]}
                    onPress={() => abrirEnlace(integrante.linkedin)}
                  >
                    <Text style={styles.socialText}>in</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.socialBtn, { backgroundColor: '#1877f2' }]}
                    onPress={() => abrirEnlace(integrante.facebook)}
                  >
                    <Text style={styles.socialText}>f</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.socialBtn, { backgroundColor: '#d6249f' }]}
                    onPress={() => abrirEnlace(integrante.instagram)}
                  >
                    <Text style={styles.socialText}>ig</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* INFO PROYECTO */}
        <View style={styles.projectInfoSection}>
          <Text style={styles.infoTitle}>Sobre el Proyecto</Text>
          
          <View style={styles.infoCardsRow}>
            <View style={styles.infoMiniCard}>
              <Text style={styles.infoIcon}>🏫</Text>
              <View>
                <Text style={styles.infoLabel}>UNIVERSIDAD</Text>
                <Text style={styles.infoValue}>Católica San Pablo</Text>
              </View>
            </View>

            <View style={styles.infoMiniCard}>
              <Text style={styles.infoIcon}>📚</Text>
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
          <Text style={styles.footerText}>© 2025 PachaQutec | Arequipa, Perú</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mountainIcon: {
    width: 28,
    height: 28,
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
  },
  btnVolver: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ff6b00',
    borderRadius: 20,
  },
  btnVolverText: {
    color: '#ff6b00',
    fontWeight: '600',
    fontSize: 12,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2d3748',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },

  integrantesGrid: {
    gap: 25,
    marginBottom: 40,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  cardBanner: {
    height: 80,
    width: '100%',
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: -40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
    elevation: 2,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#667eea',
  },
  
  cardContent: {
    padding: 20,
    alignItems: 'center',
  },
  nombre: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 5,
  },
  rolBadge: {
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    marginBottom: 15,
  },
  rolText: {
    color: '#ff6b00',
    fontWeight: '600',
    fontSize: 12,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#edf2f7',
    marginBottom: 15,
  },
  contactList: {
    width: '100%',
    gap: 10,
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 16,
  },
  contactText: {
    color: '#718096',
    fontSize: 14,
  },

  socialRow: {
    flexDirection: 'row',
    gap: 15,
  },
  socialBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  socialText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  projectInfoSection: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoCardsRow: {
    gap: 15,
  },
  infoMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#a0aec0',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
  },

  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    color: '#cbd5e1',
    fontSize: 12,
  }
});