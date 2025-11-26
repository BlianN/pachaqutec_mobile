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
import * as API from '../services/api';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recordarSesion, setRecordarSesion] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Faltan datos", "Por favor ingresa tu correo y contraseña.");
      return;
    }
  
    setIsLoading(true);
    
    try {
      const response = await API.login(email, password);
      
      if (response.success) {
        // Redirigir al ForYou
        router.push('/foryou');
      } else {
        Alert.alert("Error de acceso", response.message || "Credenciales incorrectas.");
      }
    } catch (error) {
      Alert.alert("Error de conexión", "No se pudo conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    Alert.alert("Próximamente", `El inicio con ${provider} estará disponible pronto.`);
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
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={[styles.logoText, { color: '#1A202C' }]}>Pacha</Text>
                    <Text style={[styles.logoText, { color: '#FF6B00' }]}>Qutec</Text>
                  </View>
                </View>
                <Text style={styles.welcomeTitle}>Bienvenido de vuelta</Text>
                <Text style={styles.subtitle}>Ingresa a tu cuenta para continuar</Text>
              </View>

              <View style={styles.form}>
                
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
                      editable={!isLoading} 
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contraseña</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputIcon}>🔒</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="#A0AEC0"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      editable={!isLoading} 
                    />
                  </View>
                </View>

                <View style={styles.optionsRow}>
                  <TouchableOpacity 
                    style={styles.rememberMe} 
                    onPress={() => setRecordarSesion(!recordarSesion)}
                    disabled={isLoading}
                  >
                    <View style={[styles.checkbox, recordarSesion && styles.checkboxChecked]}>
                      {recordarSesion && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.rememberText}>Recordar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity disabled={isLoading}>
                    <Text style={styles.forgotText}>¿Olvidaste pass?</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  onPress={handleLogin} 
                  activeOpacity={0.8} 
                  disabled={isLoading}
                  style={styles.loginBtnContainer}
                >
                  <LinearGradient
                    colors={isLoading ? ['#CBD5E0', '#A0AEC0'] : ['#FF6B00', '#FF8C00']}
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

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>o continúa con</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialContainer}>
                  <TouchableOpacity 
                    style={[styles.socialBtn, styles.googleBtn]} 
                    onPress={() => handleSocialLogin('Google')}
                    disabled={isLoading}
                  >
                    <Text style={styles.socialIcon}>G</Text>
                    <Text style={styles.googleText}>Google</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.socialBtn, styles.facebookBtn]}
                    onPress={() => handleSocialLogin('Facebook')}
                    disabled={isLoading}
                  >
                    <Text style={[styles.socialIcon, { color: 'white' }]}>f</Text>
                    <Text style={styles.facebookText}>Facebook</Text>
                  </TouchableOpacity>
                </View>

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

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1, width: width, height: height },
  backgroundOverlay: { ...StyleSheet.absoluteFillObject },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingTop: 60 },
  
  card: { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 24, padding: 25, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  
  header: { alignItems: 'center', marginBottom: 25 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
  mountainIcon: { width: 36, height: 36, borderRadius: 8, transform: [{ rotate: '45deg' }] },
  logoText: { fontSize: 28, fontWeight: '800' },
  welcomeTitle: { fontSize: 20, fontWeight: '600', color: '#1A202C', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#718096' },

  form: { width: '100%' },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '500', color: '#4A5568', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 12, height: 50 },
  inputIcon: { fontSize: 18, marginRight: 10, opacity: 0.6 },
  input: { flex: 1, fontSize: 16, color: '#1A202C' },

  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  rememberMe: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: { width: 20, height: 20, borderWidth: 2, borderColor: '#CBD5E0', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { borderColor: '#FF6B00', backgroundColor: '#FF6B00' },
  checkmark: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  rememberText: { color: '#718096', fontSize: 13 },
  forgotText: { color: '#FF6B00', fontWeight: '600', fontSize: 13 },

  loginBtnContainer: { borderRadius: 12, overflow: 'hidden', shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  loginBtn: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  loginBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { paddingHorizontal: 10, color: '#718096', fontSize: 12 },

  socialContainer: { flexDirection: 'row', gap: 15, marginBottom: 20 },
  socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8, borderWidth: 1, gap: 8 },
  googleBtn: { backgroundColor: 'white', borderColor: '#E2E8F0' },
  facebookBtn: { backgroundColor: '#1877F2', borderColor: '#1877F2' },
  googleText: { color: '#1A202C', fontWeight: '600' },
  facebookText: { color: 'white', fontWeight: '600' },
  socialIcon: { fontSize: 16, fontWeight: 'bold' },

  footerCard: { alignItems: 'center', paddingTop: 15, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  footerText: { color: '#718096', fontSize: 14, marginBottom: 10 },
  registerBtn: { borderWidth: 1.5, borderColor: '#FF6B00', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8, width: '100%', alignItems: 'center' },
  registerText: { color: '#FF6B00', fontWeight: '600' },
  copyright: { color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 20, fontSize: 12 }
});