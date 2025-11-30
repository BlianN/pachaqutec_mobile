import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  Share,
  Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';

const BASE_URL = 'https://api.pachaqutec.com';

export default function RDFViewerPage() {
  const router = useRouter();
  const [format, setFormat] = useState('turtle');
  const [rdfData, setRdfData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ categorias: 0, lugares: 0, usuarios: 0 });

  const formats = [
    {
      id: 'turtle',
      name: 'Turtle',
      extension: 'ttl',
      contentType: 'text/turtle',
      icon: '🐢',
      description: 'Formato legible y compacto'
    },
    {
      id: 'rdfxml',
      name: 'RDF/XML',
      extension: 'rdf',
      contentType: 'application/rdf+xml',
      icon: '📄',
      description: 'Estándar XML para RDF'
    },
    {
      id: 'jsonld',
      name: 'JSON-LD',
      extension: 'jsonld',
      contentType: 'application/ld+json',
      icon: '📦',
      description: 'JSON con contexto semántico'
    },
    {
      id: 'ntriples',
      name: 'N-Triples',
      extension: 'nt',
      contentType: 'application/n-triples',
      icon: '📝',
      description: 'Tripletas individuales'
    }
  ];

  const currentFormat = formats.find(f => f.id === format);

  useEffect(() => {
    loadRDFData();
    loadStats();
  }, [format]);

  const loadRDFData = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${BASE_URL}/rdf/data?format=${format}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar datos RDF');
      }

      const data = await response.text();
      setRdfData(data);
    } catch (err) {
      console.error('Error:', err);
      setError('No se pudieron cargar los datos RDF');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [categoriasRes, lugaresRes, usuariosRes] = await Promise.all([
        fetch(`${BASE_URL}/categorias`),
        fetch(`${BASE_URL}/lugares`),
        fetch(`${BASE_URL}/usuarios`)
      ]);

      const categorias = await categoriasRes.json();
      const lugares = await lugaresRes.json();
      const usuarios = await usuariosRes.json();

      setStats({
        categorias: categorias.count || 0,
        lugares: lugares.count || 0,
        usuarios: usuarios.count || 0
      });
    } catch (err) {
      console.error('Error cargando stats:', err);
    }
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(rdfData);
    Alert.alert('✅ Copiado', 'Datos RDF copiados al portapapeles');
  };

  const handleDownload = async () => {
    try {
      const filename = `pachaqutec-data.${currentFormat.extension}`;
      const fileUri = FileSystem.documentDirectory + filename;

      await FileSystem.writeAsStringAsync(fileUri, rdfData);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: currentFormat.contentType,
          dialogTitle: 'Guardar archivo RDF'
        });
      } else {
        Alert.alert('✅ Guardado', `Archivo guardado en: ${fileUri}`);
      }
    } catch (err) {
      console.error('Error descargando:', err);
      Alert.alert('❌ Error', 'No se pudo descargar el archivo');
    }
  };

  const openLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerText}>Datos RDF</Text>
          <Text style={styles.headerSubtext}>Web Semántica</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoBadge}>
            <Text style={styles.badgeIcon}>🌐</Text>
            <Text style={styles.badgeText}>Web Semántica 3.0</Text>
          </View>
          <Text style={styles.infoTitle}>Explora los Datos en Formatos Linked Data</Text>
          <Text style={styles.infoDescription}>
            Descarga los datos turísticos de PachaQutec en formato RDF.
            Compatible con SPARQL endpoints, triple stores y herramientas semánticas.
          </Text>

          {/* Estadísticas */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.categorias}</Text>
              <Text style={styles.statLabel}>Categorías</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.lugares}</Text>
              <Text style={styles.statLabel}>Lugares</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.usuarios}</Text>
              <Text style={styles.statLabel}>Usuarios</Text>
            </View>
          </View>
        </View>

        {/* Selector de Formato */}
        <View style={styles.formatCard}>
          <Text style={styles.sectionTitle}>Selecciona el Formato</Text>
          <View style={styles.formatsGrid}>
            {formats.map(fmt => (
              <TouchableOpacity
                key={fmt.id}
                style={[
                  styles.formatOption,
                  format === fmt.id && styles.formatOptionSelected
                ]}
                onPress={() => setFormat(fmt.id)}
              >
                <Text style={styles.formatIcon}>{fmt.icon}</Text>
                <View style={styles.formatInfo}>
                  <Text style={styles.formatName}>{fmt.name}</Text>
                  <Text style={styles.formatExt}>.{fmt.extension}</Text>
                </View>
                <Text style={styles.formatDescription}>{fmt.description}</Text>
                {format === fmt.id && (
                  <View style={styles.formatCheck}>
                    <Ionicons name="checkmark" size={20} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Visualizador */}
        <View style={styles.viewerCard}>
          <View style={styles.viewerHeader}>
            <View style={styles.viewerTitleContainer}>
              <Text style={styles.viewerIcon}>{currentFormat.icon}</Text>
              <Text style={styles.viewerTitle}>
                Vista Previa - {currentFormat.name}
              </Text>
            </View>
            <View style={styles.viewerActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleCopy}
                disabled={loading}
              >
                <Ionicons name="copy-outline" size={18} color="#667eea" />
                <Text style={styles.actionButtonText}>Copiar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.downloadButton]}
                onPress={handleDownload}
                disabled={loading}
              >
                <Ionicons name="download-outline" size={18} color="#FFF" />
                <Text style={styles.downloadButtonText}>Descargar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {loading && (
            <View style={styles.viewerLoading}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Generando RDF...</Text>
            </View>
          )}

          {error && (
            <View style={styles.viewerError}>
              <Text style={styles.errorText}>❌ {error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadRDFData}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && !error && (
            <ScrollView 
              horizontal 
              style={styles.viewerContent}
              contentContainerStyle={styles.viewerContentInner}
            >
              <Text style={styles.codeText}>{rdfData}</Text>
            </ScrollView>
          )}
        </View>

        {/* Enlaces útiles */}
        <View style={styles.linksCard}>
          <Text style={styles.sectionTitle}>📚 Recursos Útiles</Text>
          <View style={styles.linksGrid}>
            <TouchableOpacity 
              style={styles.linkItem}
              onPress={() => openLink('https://www.w3.org/RDF/')}
            >
              <Text style={styles.linkIcon}>🌐</Text>
              <View style={styles.linkInfo}>
                <Text style={styles.linkTitle}>W3C RDF</Text>
                <Text style={styles.linkDesc}>Estándar de datos enlazados</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkItem}
              onPress={() => openLink('https://www.easyrdf.org/converter')}
            >
              <Text style={styles.linkIcon}>🔄</Text>
              <View style={styles.linkInfo}>
                <Text style={styles.linkTitle}>Conversor RDF</Text>
                <Text style={styles.linkDesc}>Validar y convertir entre formatos</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkItem}
              onPress={() => openLink('https://schema.org/')}
            >
              <Text style={styles.linkIcon}>📖</Text>
              <View style={styles.linkInfo}>
                <Text style={styles.linkTitle}>Schema.org</Text>
                <Text style={styles.linkDesc}>Vocabulario estándar web</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkItem}
              onPress={() => openLink('http://dbpedia.org/')}
            >
              <Text style={styles.linkIcon}>🗃️</Text>
              <View style={styles.linkInfo}>
                <Text style={styles.linkTitle}>DBpedia</Text>
                <Text style={styles.linkDesc}>Datos enlazados de Wikipedia</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Datos generados dinámicamente desde PostgreSQL{'\n'}
            Ontología PachaQutec v1.0.0 - Compatible con Linked Open Data
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtext: {
    fontSize: 12,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  badgeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  badgeText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  formatCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  formatsGrid: {
    gap: 12,
  },
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F7F9FC',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  formatOptionSelected: {
    borderColor: '#667eea',
    backgroundColor: '#EEF2FF',
  },
  formatIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  formatInfo: {
    marginRight: 12,
  },
  formatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  formatExt: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  formatDescription: {
    flex: 1,
    fontSize: 12,
    color: '#666',
  },
  formatCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  viewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewerIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  viewerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  viewerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F0F4FF',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  downloadButton: {
    backgroundColor: '#667eea',
  },
  downloadButtonText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  viewerLoading: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  viewerError: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 14,
    color: '#e53e3e',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#667eea',
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  viewerContent: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    maxHeight: 300,
  },
  viewerContentInner: {
    padding: 16,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#d4d4d4',
    lineHeight: 18,
  },
  linksCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },
  linksGrid: {
    gap: 12,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F7F9FC',
    borderRadius: 10,
  },
  linkIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  linkInfo: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  linkDesc: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});
