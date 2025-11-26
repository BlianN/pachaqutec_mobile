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
  ActivityIndicator // Importante para el feedback de carga
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
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
  const [showPassword, setShowPassword] = useState(false); // Nuevo: Para mostrar/ocultar pass
  const [loading, setLoading] = useState(false);

  // --- FUNCIÓN PARA VALIDAR CORREO ---
  const validarEmail = (email) => {
    // Esta "magia" verifica que tenga formato: algo @ algo . algo
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    // 1. Validaciones de Campos Vacíos
    if (!nombre || !email || !password || !passwordConfirm) {
      Alert.alert("Faltan datos", "Por favor completa todos los campos.");
      return;
    }

    // 2. Validación de Formato de Correo (Lo que pidió tu profe)
    if (!validarEmail(email)) {
      Alert.alert("Correo inválido", "Por favor ingresa un correo válido (ejemplo: usuario@dominio.com).");
      return;
    }

    // 3. Validaciones de Contraseña
    if (password.length < 6) {
      Alert.alert("Seguridad", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    // 4. Validación de Términos
    if (!aceptaTerminos) {
      Alert.alert("Términos", "Debes aceptar los términos de uso para continuar.");
      return;
    }
  
    // 5. Enviar al Backend
    setLoading(true);
    
    try {
      const response = await API.register(nombre, email, password);
      
      if (response.success) {
        Alert.alert("¡Bienvenido!", "Tu cuenta ha sido creada exitosamente.", [
          { 
            text: "Continuar", 
            onPress: () => router.push('/foryou')
          }
        ]);
      } else {
        // Error que viene del backend (ej: email ya existe)
        Alert.alert("Error", response.message || "No se pudo crear la cuenta");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar con el servidor. Verifica tu conexión.");
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1582489720279-db8b8a6b8a7a?auto=format&fit=crop&w=2000&q=80' }}
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={['rgba(26, 32, 44, 0.85)', 'rgba(255, 107, 0, 0.4)']}
          style={styles.backgroundOverlay}
        />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            <View style={styles.card}>
              
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                   <LinearGradient
                    colors={['#FF6B00', '#FF8C00']}
                    style={styles.mountainIcon}
                  />
                  <Text style={styles.logoText}>
                    <Text style={{ color: '#1A202C' }}>Pacha</Text>
                    <Text style={{ color: '#FF6B00' }}>Qutec</Text>
                  </Text>
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
                      placeholderTextColor="#A0AEC0"
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
                      placeholderTextColor="#A0AEC0"
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
                      placeholderTextColor="#A0AEC0"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword} // Aquí está el truco visual
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
                      placeholderTextColor="#A0AEC0"
                      value={passwordConfirm}
                      onChangeText={setPasswordConfirm}
                      secureTextEntry={!showPassword} // Aquí también afecta
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Checkbox: Mostrar Contraseña */}
                <TouchableOpacity 
                  style={styles.checkboxContainer} 
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, showPassword && styles.checkboxChecked]}>
                    {showPassword && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.termsText}>Mostrar contraseña</Text>
                </TouchableOpacity>

                {/* Checkbox: Términos */}
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
                    colors={(!loading && aceptaTerminos) ? ['#FF6B00', '#FF8C00'] : ['#CBD5E0', '#A0AEC0']}
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

                <View style={styles.footerLinks}>
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>o</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <View style={styles.loginRow}>
                    <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
                    <TouchableOpacity onPress={() => router.back()} disabled={loading}>
                      <Text style={styles.loginLink}>Inicia sesión aquí</Text>
                    </TouchableOpacity>
                  </View>
                </View>

              </View>
            </View>
            
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  
  // CARD STYLE
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  
  // HEADER
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  mountainIcon: {
    width: 30,
    height: 30,
    borderRadius: 6,
    transform: [{ rotate: '45deg' }],
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
  },

  // FORM
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A202C',
  },

  // CHECKBOX
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15, // Un poco menos de margen para que se agrupen mejor
    marginTop: 0,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#CBD5E0',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    borderColor: '#FF6B00',
    backgroundColor: '#FF6B00',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 13,
    color: '#718096',
    flex: 1,
  },
  linkText: {
    color: '#FF6B00',
    fontWeight: 'bold',
  },

  // BUTTON
  btnContainer: {
    width: '100%',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 10,
  },
  registerBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center', // Centra el ActivityIndicator
  },
  registerBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // FOOTER
  footerLinks: {
    marginTop: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    paddingHorizontal: 10,
    color: '#718096',
    fontSize: 12,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    color: '#718096',
    fontSize: 14,
  },
  loginLink: {
    color: '#FF6B00',
    fontWeight: 'bold',
    fontSize: 14,
  },
});