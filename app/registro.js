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
// Importamos la API real
import * as API from '../services/api';

const { width, height } = Dimensions.get('window');

export default function Registro() {
  const router = useRouter();
  
  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  
  // Estados de control
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validación simple de email
  const validarEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    // 1. Validaciones
    if (!nombre || !email || !password || !passwordConfirm) {
      Alert.alert("Faltan datos", "Por favor completa todos los campos.");
      return;
    }

    if (!validarEmail(email)) {
      Alert.alert("Correo inválido", "Ingresa un correo válido (ej: usuario@dominio.com).");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Seguridad", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    if (!aceptaTerminos) {
      Alert.alert("Términos", "Debes aceptar los términos de uso para continuar.");
      return;
    }
  
    // 2. Enviar al Backend
    setLoading(true);
    
    try {
      const response = await API.register(nombre, email, password); // Asegúrate de que tu API tenga esta función exportada como 'register' o 'registrarUsuario' según tu archivo api.js
      // Nota: Si en tu api.js se llama registrarUsuario, ajusta la línea de arriba.
      
      if (response.success) {
        Alert.alert("¡Bienvenido!", "Tu cuenta ha sido creada exitosamente.", [
          { 
            text: "Continuar", 
            onPress: () => router.push('/foryou')
          }
        ]);
      } else {
        Alert.alert("Error", response.message || response.error || "No se pudo crear la cuenta");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar con el servidor.");
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* FONDO VISUAL (Igual al Login) */}
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
              
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                   <LinearGradient
                    colors={['#FF6B00', '#FF8C00']}
                    style={styles.mountainIcon}
                  />
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={[styles.logoText, { color: '#f1f5f9' }]}>Pacha</Text>
                    <Text style={[styles.logoText, { color: '#FF6B00' }]}>Qutec</Text>
                  </View>
                </View>
                <Text style={styles.welcomeTitle}>Crea tu cuenta</Text>
                <Text style={styles.subtitle}>Comienza tu aventura hoy mismo</Text>
              </View>

              <View style={styles.form}>
                
                {/* Nombre */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nombre o apodo</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>👤</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej: Juan Perez"
                      placeholderTextColor="#94a3b8"
                      value={nombre}
                      onChangeText={setNombre}
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Email */}
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
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Contraseña */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contraseña</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>🔒</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="••••••"
                      placeholderTextColor="#94a3b8"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Confirmar Contraseña */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirmar Contraseña</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>🔒</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="••••••"
                      placeholderTextColor="#94a3b8"
                      value={passwordConfirm}
                      onChangeText={setPasswordConfirm}
                      secureTextEntry
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Términos Checkbox */}
                <TouchableOpacity 
                  style={styles.checkboxContainer} 
                  onPress={() => setAceptaTerminos(!aceptaTerminos)}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  <View style={[styles.checkbox, aceptaTerminos && styles.checkboxChecked]}>
                    {aceptaTerminos && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.termsText}>
                    Acepto los <Text style={styles.linkText}>Términos y Condiciones</Text>
                  </Text>
                </TouchableOpacity>

                {/* Botón Registro */}
                <TouchableOpacity 
                  onPress={handleSubmit} 
                  activeOpacity={0.8} 
                  disabled={loading || !aceptaTerminos}
                  style={styles.btnContainer}
                >
                  <LinearGradient
                    colors={(!loading && aceptaTerminos) ? ['#FF6B00', '#FF8C00'] : ['#4a5568', '#2d3748']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.registerBtn}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.registerBtnText}>🚀 Crear cuenta</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>o</Text>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.registroFooter}>
                  <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
                  <TouchableOpacity onPress={() => router.back()} disabled={loading}>
                    <Text style={styles.loginLink}>Inicia sesión aquí</Text>
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

// ESTILOS DARK PREMIUM (Consistente con Login)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  backgroundImage: { flex: 1, width: width, height: height },
  backgroundOverlay: { ...StyleSheet.absoluteFillObject },
  
  keyboardView: { flex: 1 },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: 20, 
    paddingTop: 60,
    paddingBottom: 40 
  },
  
  // Tarjeta Oscura Semitransparente
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
    borderRadius: 24,
    padding: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  
  // HEADER
  header: { alignItems: 'center', marginBottom: 25 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  mountainIcon: { width: 30, height: 30, borderRadius: 6, transform: [{ rotate: '45deg' }] },
  
  logoText: { fontSize: 24, fontWeight: '800' },
  
  welcomeTitle: { fontSize: 22, fontWeight: '700', color: '#f1f5f9', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#94a3b8' },

  // FORM
  form: { width: '100%' },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', color: '#94a3b8', marginBottom: 6 },
  
  // INPUTS BLANCOS (Fix de legibilidad)
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Fondo Blanco
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: { fontSize: 16, marginRight: 10, opacity: 0.7, color: '#475569' },
  input: { flex: 1, fontSize: 15, color: '#1e293b', fontWeight: '500' },

  // CHECKBOX
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 5,
  },
  checkbox: {
    width: 22, height: 22,
    borderWidth: 2, borderColor: '#475569', borderRadius: 6,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    borderColor: '#FF6B00',
    backgroundColor: '#FF6B00',
  },
  checkmark: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  
  termsText: { fontSize: 13, color: '#94a3b8', flex: 1 },
  linkText: { color: '#FF6B00', fontWeight: 'bold' },

  // BOTÓN
  btnContainer: {
    width: '100%',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  registerBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // FOOTER & DIVIDER
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: { paddingHorizontal: 10, color: '#94a3b8', fontSize: 12 },

  registroFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  footerText: { color: '#94a3b8', fontSize: 14 },
  loginLink: { color: '#FF6B00', fontWeight: 'bold', fontSize: 14 },
  
  copyright: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 30, fontSize: 12 }
});