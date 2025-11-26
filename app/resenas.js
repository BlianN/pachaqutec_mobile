import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as API from '../services/api';

export default function ResenasPage() {
  const router = useRouter();
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const userInfo = await API.getUserInfo();
      setUsuario(userInfo);
      
      if (userInfo) {
        const reviews = await API.getMyReviews();
        console.log('✅ Reseñas cargadas:', reviews);
        setResenas(Array.isArray(reviews) ? reviews : []);
      }
    } catch (error) {
      console.error('Error cargando reseñas:', error);
      Alert.alert("Error", "No se pudieron cargar las reseñas");
      setResenas([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (calificacion) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= calificacion ? "star" : "star-outline"}
            size={16}
            color="#FFB800"
          />
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Cargando reseñas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Reseñas</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {resenas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbox-outline" size={80} color="#CCC" />
            <Text style={styles.emptyText}>No tienes reseñas aún</Text>
            <Text style={styles.emptySubtext}>Visita lugares y comparte tu experiencia</Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => router.push('/lugares')}
            >
              <Text style={styles.exploreButtonText}>Explorar Lugares</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.reviewsList}>
            {resenas.map((item) => (
              <View key={item.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Image 
                    source={{ uri: item.lugar_imagen }} 
                    style={styles.reviewImage}
                    resizeMode="cover"
                  />
                  <View style={styles.reviewInfo}>
                    <Text style={styles.reviewLugar} numberOfLines={2}>
                      {item.lugar_nombre}
                    </Text>
                    {renderStars(item.calificacion)}
                    <Text style={styles.reviewDate}>
                      {new Date(item.created_at).toLocaleDateString('es-ES')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.reviewText}>{item.texto}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => Alert.alert(
          "Crear Reseña",
          "Ve a la pantalla de Lugares y selecciona un lugar para dejar tu reseña.",
          [{ text: "Entendido" }]
        )}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewsList: {
    gap: 16,
  },
  reviewCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  reviewInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  reviewLugar: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  fabButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
});