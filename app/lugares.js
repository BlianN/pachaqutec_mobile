import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as API from '../services/api';

export default function LugaresPage() {
  const router = useRouter();
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);
  
  // Estados para el modal de reseña
  const [modalVisible, setModalVisible] = useState(false);
  const [lugarSeleccionado, setLugarSeleccionado] = useState(null);
  const [textoResena, setTextoResena] = useState('');
  const [calificacion, setCalificacion] = useState(0);
  const [enviandoResena, setEnviandoResena] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const userInfo = await API.getUserInfo();
      setUsuario(userInfo);
      
      const lugaresData = await API.getTouristLocations();
      setLugares(Array.isArray(lugaresData) ? lugaresData : []);
    } catch (error) {
      console.error('Error cargando lugares:', error);
      Alert.alert("Error", "No se pudieron cargar los lugares");
      setLugares([]);
    } finally {
      setLoading(false);
    }
  };

  const agregarFavorito = async (lugar) => {
    try {
      if (!usuario) {
        Alert.alert("Error", "Debes iniciar sesión primero");
        return;
      }
      
      await API.addFavorite(lugar.id);
      Alert.alert("¡Éxito!", `${lugar.nombre} agregado a favoritos`);
    } catch (error) {
      console.error('Error con favorito:', error);
      Alert.alert("Error", error.message || "No se pudo agregar a favoritos");
    }
  };

  const abrirModalResena = (lugar) => {
    if (!usuario) {
      Alert.alert("Error", "Debes iniciar sesión primero");
      return;
    }
    
    setLugarSeleccionado(lugar);
    setTextoResena('');
    setCalificacion(0);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setLugarSeleccionado(null);
    setTextoResena('');
    setCalificacion(0);
  };

  const enviarResena = async () => {
    if (calificacion === 0) {
      Alert.alert("Error", "Por favor selecciona una calificación");
      return;
    }
    
    if (!textoResena.trim()) {
      Alert.alert("Error", "Por favor escribe tu reseña");
      return;
    }

    setEnviandoResena(true);
    
    try {
      await API.createReview(lugarSeleccionado.id, calificacion, textoResena.trim());
      Alert.alert("¡Éxito!", "Tu reseña ha sido publicada");
      cerrarModal();
    } catch (error) {
      console.error('Error creando reseña:', error);
      Alert.alert("Error", error.message || "No se pudo crear la reseña");
    } finally {
      setEnviandoResena(false);
    }
  };

  const renderStars = (rating, onPress) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => onPress(star)}>
            <Ionicons
              name={star <= rating ? "star" : "star-outline"}
              size={32}
              color="#FFB800"
              style={{ marginHorizontal: 4 }}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Cargando lugares...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lugares Turísticos</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {lugares.map((lugar) => (
          <View key={lugar.id} style={styles.card}>
            <Image 
              source={{ uri: lugar.imagen_url }} 
              style={styles.cardImage}
              resizeMode="cover"
            />
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{lugar.nombre}</Text>
                <TouchableOpacity onPress={() => agregarFavorito(lugar)}>
                  <Ionicons name="heart-outline" size={24} color="#FF6B35" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.cardCategory}>{lugar.categoria}</Text>
              <Text style={styles.cardDescription} numberOfLines={3}>
                {lugar.descripcion}
              </Text>
              
              <View style={styles.cardButtons}>
                <TouchableOpacity style={styles.buttonPrimary}>
                  <Text style={styles.buttonPrimaryText}>Ver más</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.buttonSecondary}
                  onPress={() => abrirModalResena(lugar)}
                >
                  <Ionicons name="chatbox-outline" size={16} color="#FF6B35" />
                  <Text style={styles.buttonSecondaryText}>Añadir Reseña</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal para crear reseña */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={cerrarModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Añadir Reseña</Text>
              <TouchableOpacity onPress={cerrarModal}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {lugarSeleccionado && (
              <>
                <View style={styles.modalLugar}>
                  <Image 
                    source={{ uri: lugarSeleccionado.imagen_url }} 
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.modalLugarNombre}>{lugarSeleccionado.nombre}</Text>
                </View>

                <Text style={styles.modalLabel}>Calificación</Text>
                {renderStars(calificacion, setCalificacion)}

                <Text style={styles.modalLabel}>Tu reseña</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Comparte tu experiencia..."
                  multiline
                  numberOfLines={4}
                  value={textoResena}
                  onChangeText={setTextoResena}
                  maxLength={500}
                />
                <Text style={styles.charCounter}>{textoResena.length}/500</Text>

                <TouchableOpacity 
                  style={[styles.submitButton, enviandoResena && styles.submitButtonDisabled]}
                  onPress={enviarResena}
                  disabled={enviandoResena}
                >
                  {enviandoResena ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Publicar Reseña</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  cardCategory: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  buttonPrimary: {
    flex: 1,
    backgroundColor: '#FF6B35',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  buttonSecondaryText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  modalLugar: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 12,
  },
  modalLugarNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCounter: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});