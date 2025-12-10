import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ImageBackground, 
  Dimensions, 
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
// Importamos la API real del backend (manteniendo tu lógica)
import * as API from '../services/api';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();
  
  // Estados
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recordarSesion, setRecordarSesion] = useState(false);

  // --- LÓGICA DE CONEXIÓN (INTACTA) ---
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Faltan datos", "Por favor ingresa tu correo y contraseña.");
      return;
    }
  
    setIsLoading(true);
    
    try {
      console.log("Intentando login con:", email);
      const response = await API.login(email, password);
      
      if (response.success) {
        Alert.alert("¡Bienvenido!", `Hola ${response.usuario?.nombre || 'Viajero'}`, [
          { text: "Entrar", onPress: () => router.push('/foryou') }
        ]);
      } else {
        Alert.alert("Error de acceso", response.message || "Correo o contraseña incorrectos.");
      }
    } catch (error) {
      Alert.alert("Error de conexión", "No se pudo conectar con el servidor. Verifica tu internet.");
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* FONDO VISUAL (Igual a la Web) */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1582489720279-db8b8a6b8a7a?auto=format&fit=crop&w=2000&q=80' }}
        style={styles.backgroundImage}
      >
        {/* Overlay Oscuro Premium */}
        <LinearGradient
          colors={['rgba(10, 10, 15, 0.95)', 'rgba(20, 20, 30, 0.85)', 'rgba(255, 107, 0, 0.15)']}
          style={styles.backgroundOverlay}
        />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* TARJETA PRINCIPAL (Dark Glass) */}
            <View style={styles.card}>
              
              {/* HEADER / LOGO */}
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <LinearGradient
                    colors={['#FF6B00', '#FF8C00']}
                    style={styles.mountainIcon}
                  />
                  <View style={{ flexDirection: 'row' }}>
                    {/* Texto Blanco como en la web */}
                    <Text style={[styles.logoText, { color: '#f1f5f9' }]}>Pacha</Text>
                    <Text style={[styles.logoText, { color: '#FF6B00' }]}>Qutec</Text>
                  </View>
                </View>
                <Text style={styles.welcomeTitle}>Bienvenido de vuelta</Text>
                <Text style={styles.subtitle}>Ingresa a tu cuenta para continuar</Text>
              </View>

              {/* FORMULARIO */}
              <View style={styles.form}>
                
                {/* Email Input (Blanco con texto negro para legibilidad) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Correo electrónico</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>✉️</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="tucorreo@ejemplo.com"
                      placeholderTextColor="#94a3b8"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!isLoading} 
                    />
                  </View>
                </View>

                {/* Password Input (Blanco con texto negro) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contraseña</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>🔒</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="#94a3b8"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      editable={!isLoading} 
                    />
                  </View>
                </View>

                {/* Opciones */}
                <View style={styles.optionsRow}>
                  <TouchableOpacity 
                    style={styles.rememberMe} 
                    onPress={() => setRecordarSesion(!recordarSesion)}
                    disabled={isLoading}
                  >
                    <View style={[styles.checkbox, recordarSesion && styles.checkboxChecked]}>
                      {recordarSesion && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.rememberText}>Recordar sesión</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity disabled={isLoading}>
                    <Text style={styles.forgotText}>¿Olvidaste contraseña?</Text>
                  </TouchableOpacity>
                </View>

                {/* BOTÓN LOGIN PRINCIPAL */}
                <TouchableOpacity 
                  onPress={handleLogin} 
                  activeOpacity={0.8} 
                  disabled={isLoading}
                  style={styles.loginBtnContainer}
                >
                  <LinearGradient
                    colors={isLoading ? ['#4a5568', '#2d3748'] : ['#FF6B00', '#FF8C00']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.loginBtn}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.loginBtnText}>Iniciar sesión</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* DIVISOR ESTILO WEB */}
                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>o continúa con</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* BOTÓN GOOGLE (Estilo Visual solamente, si no tienes la lógica aún) */}
                <TouchableOpacity style={styles.googleBtn} disabled={isLoading}>
                    <Text style={styles.googleIcon}>G</Text>
                    <Text style={styles.googleText}>Google</Text>
                </TouchableOpacity>

                {/* Footer Link */}
                <View style={styles.footerCard}>
                  <Text style={styles.footerText}>¿No tienes una cuenta?</Text>
                  <TouchableOpacity 
                    style={styles.registerBtn}
                    onPress={() => router.push('/registro')}
                    disabled={isLoading}
                  >
                    <Text style={styles.registerText}>Crear cuenta nueva</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>

            <Text style={styles.copyright}>© 2025 PachaQutec Mobile</Text>
            
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

// ESTILOS DARK PREMIUM (Igualando la Web)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  backgroundImage: { flex: 1, width: width, height: height },
  backgroundOverlay: { ...StyleSheet.absoluteFillObject }, 
  
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingTop: 60 },
  
  // Tarjeta Oscura Semitransparente (El corazón del diseño)
  card: { 
    backgroundColor: 'rgba(15, 23, 42, 0.9)', // Dark Slate casi negro
    borderRadius: 24, 
    padding: 25, 
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.5, 
    shadowRadius: 20, 
    elevation: 10 
  },
  
  header: { alignItems: 'center', marginBottom: 25 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
  mountainIcon: { width: 36, height: 36, borderRadius: 8, transform: [{ rotate: '45deg' }] },
  
  logoText: { fontSize: 28, fontWeight: '800' },
  
  welcomeTitle: { fontSize: 20, fontWeight: '600', color: '#f1f5f9', marginBottom: 5 }, // Texto blanco
  subtitle: { fontSize: 14, color: '#94a3b8' }, // Texto gris claro

  form: { width: '100%' },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '500', color: '#94a3b8', marginBottom: 8 },
  
  // INPUTS BLANCOS (El fix visual clave)
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#ffffff', // Fondo Blanco Sólido
    borderRadius: 12, 
    paddingHorizontal: 12, 
    height: 50 
  },
  inputIcon: { fontSize: 18, marginRight: 10, opacity: 0.7, color: '#475569' },
  input: { flex: 1, fontSize: 16, color: '#1e293b', fontWeight: '500' }, // Texto Oscuro

  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  rememberMe: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  
  checkbox: { width: 20, height: 20, borderWidth: 2, borderColor: '#475569', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { borderColor: '#FF6B00', backgroundColor: '#FF6B00' },
  checkmark: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  
  rememberText: { color: '#94a3b8', fontSize: 13 },
  forgotText: { color: '#FF6B00', fontWeight: '600', fontSize: 13 },

  loginBtnContainer: { 
    borderRadius: 12, 
    overflow: 'hidden', 
    shadowColor: '#FF6B00', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 10, 
    elevation: 5 
  },
  loginBtn: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  loginBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  // Divisor Estilo Web
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: { color: '#94a3b8', paddingHorizontal: 10, fontSize: 13 },

  // Botón Google Estilo Dark (Ghost)
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20
  },
  googleIcon: { color: '#DB4437', fontSize: 18, fontWeight: 'bold', marginRight: 10 },
  googleText: { color: '#f1f5f9', fontSize: 15, fontWeight: '600' },

  footerCard: { alignItems: 'center', paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  footerText: { color: '#94a3b8', fontSize: 14, marginBottom: 10 },
  
  registerBtn: { 
    borderWidth: 1.5, 
    borderColor: '#FF6B00', 
    paddingVertical: 10, 
    paddingHorizontal: 25, 
    borderRadius: 8, 
    width: '100%', 
    alignItems: 'center' 
  },
  registerText: { color: '#FF6B00', fontWeight: '700' },
  
  copyright: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 30, fontSize: 12 }
});