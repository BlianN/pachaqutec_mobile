import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  StatusBar,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- CORRECCIÓN: Ruta de importación correcta (solo un nivel arriba) ---
import { obtenerResenasUsuario, obtenerFavoritos, obtenerUsuarios } from '../services/api'; 

const { width } = Dimensions.get('window');

export default function Perfil() {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  const profileId = params.id;

  // --- ESTADOS ---
  const [perfilUsuario, setPerfilUsuario] = useState(null);
  const [miUsuario, setMiUsuario] = useState(null);
  const [esMiPerfil, setEsMiPerfil] = useState(false);
  const [estadoAmistad, setEstadoAmistad] = useState('none');

  // Datos
  const [resenas, setResenas] = useState([]);
  const [favoritos, setFavoritos] = useState([]);

  // UI
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  
  // Modales
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friendModalTab, setFriendModalTab] = useState('mis_amigos');
  
  // Listas Amigos
  const [todosLosUsuarios, setTodosLosUsuarios] = useState([]);
  const [misAmigos, setMisAmigos] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  // Formulario Editar
  const [editForm, setEditForm] = useState({ nombre: '', bio: '', ubicacion: '' });

  // --- CARGA INICIAL ---
  useEffect(() => {
    cargarDatosDelPerfil();
  }, [profileId]);

  const cargarDatosDelPerfil = async () => {
    setLoading(true);
    try {
      const userJson = await AsyncStorage.getItem("userInfo");
      if (!userJson) {
        // Fallback
        const userAlt = await AsyncStorage.getItem("usuario");
        if(!userAlt) {
             router.replace('/login');
             return;
        }
        setMiUsuario(JSON.parse(userAlt));
      } else {
        setMiUsuario(JSON.parse(userJson));
      }
      
      const userStored = miUsuario || JSON.parse(userJson || '{}');
      let usuarioTarget = null;
      let esMio = false;

      // 1. Obtener usuarios base
      const dataUsers = await obtenerUsuarios();
      const usersDB = dataUsers.success ? dataUsers.usuarios : [];
      setTodosLosUsuarios(usersDB);

      // 2. Determinar a quién vemos
      if (profileId && parseInt(profileId) !== userStored.id) {
        usuarioTarget = usersDB.find(u => u.id === parseInt(profileId));
        if (!usuarioTarget) usuarioTarget = { id: 0, nombre: "Usuario", email: "" };
        esMio = false;
      } else {
        usuarioTarget = userStored;
        esMio = true;
      }

      // 3. RECUPERAR DATOS PERSISTENTES
      const detallesJson = await AsyncStorage.getItem("pacha_usuarios_detalles");
      const detallesGuardados = detallesJson ? JSON.parse(detallesJson) : {};
      const detallesUsuario = detallesGuardados[usuarioTarget.id] || {
        bio: "🎒 Explorador de PachaQutec",
        ubicacion: "Arequipa, Perú"
      };

      const usuarioCompleto = {
        ...usuarioTarget,
        nombre: detallesUsuario.nombre || usuarioTarget.nombre,
        bio: detallesUsuario.bio,
        ubicacion: detallesUsuario.ubicacion
      };

      setPerfilUsuario(usuarioCompleto);
      setEsMiPerfil(esMio);

      if (esMio) {
        setEditForm({
          nombre: usuarioCompleto.nombre,
          bio: usuarioCompleto.bio,
          ubicacion: usuarioCompleto.ubicacion
        });
      }

      // 4. Cargar Amistades y Datos API
      if(userStored && userStored.id) {
          await verificarEstadoAmistad(userStored.id, usuarioTarget.id);
          await cargarAmigosLocales(usuarioTarget.id, usersDB);
      }

      const [resData, favData] = await Promise.all([
        obtenerResenasUsuario(usuarioTarget.id).catch(() => ({ success: false })),
        obtenerFavoritos(usuarioTarget.id).catch(() => ({ success: false }))
      ]);

      if (resData.success) setResenas(resData.resenas || []);
      else setResenas([]);

      if (favData.success) setFavoritos(favData.favoritos || []);
      else setFavoritos([]);

    } catch (e) {
      console.error("Error cargando perfil", e);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA GUARDAR EDICIÓN ---
  const handleGuardarCambios = async () => {
    try {
      const detallesJson = await AsyncStorage.getItem("pacha_usuarios_detalles");
      const detallesGuardados = detallesJson ? JSON.parse(detallesJson) : {};

      detallesGuardados[miUsuario.id] = {
        nombre: editForm.nombre,
        bio: editForm.bio,
        ubicacion: editForm.ubicacion
      };

      await AsyncStorage.setItem("pacha_usuarios_detalles", JSON.stringify(detallesGuardados));

      const usuarioActualizado = { ...miUsuario, nombre: editForm.nombre };
      await AsyncStorage.setItem("userInfo", JSON.stringify(usuarioActualizado));
      
      setMiUsuario(usuarioActualizado);
      setPerfilUsuario({ ...perfilUsuario, ...editForm });
      setShowEditModal(false);
      Alert.alert("Éxito", "Perfil actualizado correctamente");
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar");
    }
  };

  // --- LÓGICA AMIGOS ---
  const verificarEstadoAmistad = async (miId, targetId) => {
    if (miId === targetId) return;
    const relJson = await AsyncStorage.getItem("pacha_relaciones");
    const relaciones = relJson ? JSON.parse(relJson) : [];
    
    const relacion = relaciones.find(r => 
      (r.from === miId && r.to === targetId) || (r.from === targetId && r.to === miId)
    );

    if (!relacion) setEstadoAmistad('none');
    else if (relacion.status === 'accepted') setEstadoAmistad('friend');
    else if (relacion.status === 'pending') {
      if (relacion.from === miId) setEstadoAmistad('pending_sent');
      else setEstadoAmistad('pending_received');
    }
  };

  const cargarAmigosLocales = async (targetId, allUsers) => {
    const relJson = await AsyncStorage.getItem("pacha_relaciones");
    const relaciones = relJson ? JSON.parse(relJson) : [];
    
    const amistades = relaciones.filter(r => 
        r.status === 'accepted' && (r.from === targetId || r.to === targetId)
    );
    
    const listaAmigosReales = amistades.map(r => {
        const amigoId = r.from === targetId ? r.to : r.from;
        return allUsers.find(u => u.id === amigoId);
    }).filter(Boolean);
    
    setMisAmigos(listaAmigosReales);
  };

  const handleEnviarSolicitud = async (destinatarioId) => {
    if (destinatarioId === miUsuario.id || estadoAmistad !== 'none') return;
    
    const relJson = await AsyncStorage.getItem("pacha_relaciones");
    const relaciones = relJson ? JSON.parse(relJson) : [];
    
    relaciones.push({
        id: Date.now(), from: miUsuario.id, to: destinatarioId, status: 'pending', timestamp: new Date().toISOString()
    });
    
    await AsyncStorage.setItem("pacha_relaciones", JSON.stringify(relaciones));
    setEstadoAmistad('pending_sent');
  };

  // --- FILTRADO ---
  const usuariosFiltrados = todosLosUsuarios.filter(u => {
    if (u.id === miUsuario?.id) return false;
    const yaEsAmigo = misAmigos.some(amigo => amigo.id === u.id);
    if (yaEsAmigo) return false;
    if (busqueda === "") return true;
    return u.nombre.toLowerCase().includes(busqueda.toLowerCase()) || u.email.toLowerCase().includes(busqueda.toLowerCase());
  });

  // --- RENDERS ---
  const renderBotonAccion = () => {
    if (esMiPerfil) {
        return (
          <TouchableOpacity style={styles.btnEditProfile} onPress={() => setShowEditModal(true)}>
            <Text style={styles.btnEditText}>Editar perfil</Text>
          </TouchableOpacity>
        );
    }
    switch (estadoAmistad) {
        case 'friend': return <TouchableOpacity style={styles.btnStatusFriend}><Text style={styles.textGreen}>✓ Amigos</Text></TouchableOpacity>;
        case 'pending_sent': return <TouchableOpacity style={styles.btnStatusPending}><Text style={styles.textGray}>Solicitud enviada</Text></TouchableOpacity>;
        case 'pending_received': return <TouchableOpacity style={styles.btnStatusPending}><Text style={styles.textGray}>Pendiente</Text></TouchableOpacity>;
        default: return (
          <TouchableOpacity style={styles.btnFollow} onPress={() => handleEnviarSolicitud(perfilUsuario.id)}>
            <Text style={styles.btnFollowText}>Agregar amigo</Text>
          </TouchableOpacity>
        );
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#ff6b00" />
      </View>
    );
  }

  if (!perfilUsuario) return <View style={styles.container}><Text style={{color:'white', marginTop:50, textAlign:'center'}}>Usuario no encontrado</Text></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.logoContainer} onPress={() => router.push('/foryou')}>
          <LinearGradient colors={['#ff6b00', '#fbbf24']} style={styles.mountainIcon} />
          <View style={{flexDirection:'row'}}>
             <Text style={[styles.logoText, {color:'white'}]}>Pacha</Text>
             <Text style={[styles.logoText, {color:'#ff6b00'}]}>Qutec</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerBtns}>
           <TouchableOpacity onPress={() => router.push('/foryou')}><Text style={styles.navText}>Inicio</Text></TouchableOpacity>
           <TouchableOpacity onPress={async () => { await AsyncStorage.removeItem('userInfo'); await AsyncStorage.removeItem('usuario'); router.replace('/login'); }}>
             <Text style={styles.navTextLogout}>Salir</Text>
           </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* INFO PERFIL */}
        <View style={styles.profileSection}>
           <View style={styles.topSection}>
              <View style={styles.avatarContainer}>
                 <LinearGradient colors={['#ff6b00', '#ff9100']} style={styles.avatarGradient}>
                    <Text style={styles.avatarText}>{perfilUsuario.nombre ? perfilUsuario.nombre.charAt(0).toUpperCase() : '?'}</Text>
                 </LinearGradient>
              </View>
              
              <View style={styles.statsContainer}>
                 <View style={styles.statBox}>
                    <Text style={styles.statNum}>{resenas.length}</Text>
                    <Text style={styles.statLabel}>Posts</Text>
                 </View>
                 <TouchableOpacity style={styles.statBox} onPress={() => setShowFriendsModal(true)}>
                    <Text style={styles.statNum}>{misAmigos.length}</Text>
                    <Text style={styles.statLabel}>Amigos</Text>
                 </TouchableOpacity>
                 <View style={styles.statBox}>
                    <Text style={styles.statNum}>{favoritos.length}</Text>
                    <Text style={styles.statLabel}>Favoritos</Text>
                 </View>
              </View>
           </View>

           <View style={styles.bioSection}>
              <Text style={styles.username}>{perfilUsuario.nombre}</Text>
              {renderBotonAccion()}
              <Text style={styles.location}>📍 {perfilUsuario.ubicacion}</Text>
              <Text style={styles.bio}>{perfilUsuario.bio}</Text>
           </View>
        </View>

        {/* TABS */}
        <View style={styles.tabs}>
           <TouchableOpacity style={[styles.tabItem, activeTab==='posts' && styles.activeTab]} onPress={()=>setActiveTab('posts')}>
              <Text style={[styles.tabText, activeTab==='posts' && styles.activeTabText]}>▦ PUBLICACIONES</Text>
           </TouchableOpacity>
           <TouchableOpacity style={[styles.tabItem, activeTab==='saved' && styles.activeTab]} onPress={()=>setActiveTab('saved')}>
              <Text style={[styles.tabText, activeTab==='saved' && styles.activeTabText]}>🔖 FAVORITOS</Text>
           </TouchableOpacity>
        </View>

        {/* GRID */}
        <View style={styles.gridContainer}>
           {activeTab === 'posts' ? (
              resenas.length === 0 ? (
                 <View style={styles.emptyState}><Text style={styles.emptyIcon}>📷</Text><Text style={styles.emptyText}>Sin publicaciones</Text></View>
              ) : (
                 resenas.map(r => (
                    <View key={r.id} style={styles.gridItem}>
                       <Image source={{ uri: r.lugar_imagen || 'https://via.placeholder.com/150' }} style={styles.gridImage} />
                       <View style={styles.gridOverlay}>
                          <Text style={styles.overlayText}>⭐ {r.calificacion}</Text>
                       </View>
                    </View>
                 ))
              )
           ) : (
              favoritos.length === 0 ? (
                 <View style={styles.emptyState}><Text style={styles.emptyIcon}>❤️</Text><Text style={styles.emptyText}>Lista vacía</Text></View>
              ) : (
                 favoritos.map(f => (
                    <View key={f.favorito_id} style={styles.gridItem}>
                       <Image source={{ uri: f.imagen_url || 'https://via.placeholder.com/150' }} style={styles.gridImage} />
                    </View>
                 ))
              )
           )}
        </View>
        
        <View style={{height: 100}} />
      </ScrollView>

      {/* --- MODAL EDITAR --- */}
      <Modal visible={showEditModal} transparent animationType="slide">
         <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
               <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Editar Perfil</Text>
                  <TouchableOpacity onPress={()=>setShowEditModal(false)}><Text style={styles.closeBtn}>✕</Text></TouchableOpacity>
               </View>
               
               <Text style={styles.label}>Nombre</Text>
               <TextInput 
                  style={styles.input} 
                  value={editForm.nombre} 
                  onChangeText={t => setEditForm({...editForm, nombre: t})} 
               />
               
               <Text style={styles.label}>Ubicación</Text>
               <TextInput 
                  style={styles.input} 
                  value={editForm.ubicacion} 
                  placeholder="Ej: Arequipa" 
                  placeholderTextColor="#666"
                  onChangeText={t => setEditForm({...editForm, ubicacion: t})} 
               />
               
               <Text style={styles.label}>Biografía</Text>
               <TextInput 
                  style={[styles.input, {height: 80, textAlignVertical:'top'}]} 
                  value={editForm.bio} 
                  multiline
                  placeholder="Cuéntanos sobre ti..." 
                  placeholderTextColor="#666"
                  onChangeText={t => setEditForm({...editForm, bio: t})} 
               />

               <TouchableOpacity style={styles.btnSave} onPress={handleGuardarCambios}>
                  <Text style={styles.btnSaveText}>Guardar Cambios</Text>
               </TouchableOpacity>
            </View>
         </View>
      </Modal>

      {/* --- MODAL AMIGOS --- */}
      <Modal visible={showFriendsModal} transparent animationType="fade">
         <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, {height: 500}]}>
               <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Comunidad</Text>
                  <TouchableOpacity onPress={()=>setShowFriendsModal(false)}><Text style={styles.closeBtn}>✕</Text></TouchableOpacity>
               </View>

               <View style={styles.friendTabs}>
                  <TouchableOpacity onPress={()=>setFriendModalTab('mis_amigos')} style={{padding:10}}><Text style={[styles.friendTabText, friendModalTab==='mis_amigos' && styles.activeFriendTab]}>Mis Amigos</Text></TouchableOpacity>
                  <TouchableOpacity onPress={()=>setFriendModalTab('buscar')} style={{padding:10}}><Text style={[styles.friendTabText, friendModalTab==='buscar' && styles.activeFriendTab]}>Buscar</Text></TouchableOpacity>
               </View>

               {friendModalTab === 'buscar' && (
                  <TextInput 
                     style={styles.searchInput} 
                     placeholder="🔍 Buscar personas..." 
                     placeholderTextColor="#888"
                     value={busqueda}
                     onChangeText={setBusqueda}
                  />
               )}

               <ScrollView style={{marginTop: 10}}>
                  {friendModalTab === 'mis_amigos' ? (
                     misAmigos.length > 0 ? misAmigos.map(amigo => (
                        <View key={amigo.id} style={styles.friendItem}>
                           <View style={styles.friendAvatarSmall}><Text style={styles.friendInitial}>{amigo.nombre.charAt(0)}</Text></View>
                           <Text style={styles.friendName}>{amigo.nombre}</Text>
                           <TouchableOpacity style={styles.btnVisit} onPress={() => {setShowFriendsModal(false); router.push({ pathname: '/perfil', params: { id: amigo.id } });}}>
                              <Text style={{color:'white', fontSize:12}}>Ver</Text>
                           </TouchableOpacity>
                        </View>
                     )) : <Text style={styles.emptyTextModal}>No tienes amigos aún.</Text>
                  ) : (
                     usuariosFiltrados.map(user => (
                        <View key={user.id} style={styles.friendItem}>
                           <View style={[styles.friendAvatarSmall, {backgroundColor:'#333'}]}><Text style={styles.friendInitial}>{user.nombre.charAt(0)}</Text></View>
                           <Text style={styles.friendName}>{user.nombre}</Text>
                           <TouchableOpacity style={styles.btnAdd} onPress={() => handleEnviarSolicitud(user.id)}>
                              <Text style={{color:'#ff6b00', fontWeight:'bold'}}>+</Text>
                           </TouchableOpacity>
                        </View>
                     ))
                  )}
               </ScrollView>
            </View>
         </View>
      </Modal>

    </View>
  );
}

// ESTILOS DARK PREMIUM
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  loaderContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  
  // HEADER
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 40, paddingBottom: 15, paddingHorizontal: 20,
    backgroundColor: 'rgba(15,15,15,0.9)', borderBottomWidth: 1, borderBottomColor: '#2a2a2a'
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mountainIcon: { width: 24, height: 24, borderRadius: 4 },
  logoText: { fontSize: 18, fontWeight: '800' },
  headerBtns: { flexDirection: 'row', gap: 15 },
  navText: { color: 'white', fontWeight: '600' },
  navTextLogout: { color: '#ef4444', fontWeight: '600' },

  // PROFILE INFO
  profileSection: { padding: 20 },
  topSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatarContainer: { marginRight: 20 },
  avatarGradient: { 
    width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#000'
  },
  avatarText: { color: 'white', fontSize: 36, fontWeight: '300' },
  
  statsContainer: { flexDirection: 'row', flex: 1, justifyContent: 'space-around' },
  statBox: { alignItems: 'center' },
  statNum: { color: 'white', fontSize: 18, fontWeight: '700' },
  statLabel: { color: '#a0a0a0', fontSize: 12 },

  bioSection: { marginTop: 5 },
  username: { color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 5 },
  location: { color: '#ff6b00', fontSize: 13, marginBottom: 5 },
  bio: { color: '#e0e0e0', fontSize: 14, lineHeight: 20, marginBottom: 15 },

  // BOTONES
  btnEditProfile: { borderWidth: 1, borderColor: '#444', borderRadius: 6, paddingVertical: 6, alignItems: 'center', marginBottom: 10 },
  btnEditText: { color: 'white', fontWeight: '600', fontSize: 13 },
  btnFollow: { backgroundColor: '#ff6b00', borderRadius: 6, paddingVertical: 6, alignItems: 'center', marginBottom: 10 },
  btnFollowText: { color: 'white', fontWeight: '600', fontSize: 13 },
  btnStatusFriend: { backgroundColor: 'rgba(0, 230, 118, 0.1)', padding: 6, borderRadius: 6, alignItems: 'center', marginBottom: 10 },
  btnStatusPending: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 6, borderRadius: 6, alignItems: 'center', marginBottom: 10 },
  textGreen: { color: '#00e676', fontWeight: '600' },
  textGray: { color: '#aaa', fontWeight: '600' },

  // TABS
  tabs: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#222' },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: 'white' },
  tabText: { color: '#666', fontSize: 12, fontWeight: 'bold' },
  activeTabText: { color: 'white' },

  // GRID
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  gridItem: { width: width / 3, height: width / 3, padding: 1, position: 'relative' },
  gridImage: { width: '100%', height: '100%', backgroundColor: '#222' },
  gridOverlay: { position: 'absolute', bottom: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, borderRadius: 4 },
  overlayText: { color: 'white', fontSize: 10 },
  
  emptyState: { width: width, padding: 50, alignItems: 'center' },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { color: '#666' },

  // MODAL
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '90%', backgroundColor: '#121212', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#333' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 10 },
  modalTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
  closeBtn: { color: '#aaa', fontSize: 20 },
  
  label: { color: '#aaa', fontSize: 12, marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#ffffff', borderRadius: 8, padding: 10, color: '#000', fontSize: 14 }, 
  
  btnSave: { backgroundColor: '#ff6b00', marginTop: 20, padding: 12, borderRadius: 8, alignItems: 'center' },
  btnSaveText: { color: 'white', fontWeight: 'bold' },

  // AMIGOS LIST
  friendTabs: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 15 },
  friendTabText: { color: '#666', fontWeight: '600' },
  activeFriendTab: { color: '#ff6b00' },
  searchInput: { backgroundColor: '#222', color: 'white', padding: 10, borderRadius: 8, marginBottom: 10 },
  
  friendItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#222' },
  friendAvatarSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ff6b00', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  friendInitial: { color: 'white', fontWeight: 'bold' },
  friendName: { flex: 1, color: 'white', fontSize: 14, fontWeight: '600' },
  btnVisit: { backgroundColor: '#333', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 4 },
  btnAdd: { padding: 5 },
  emptyTextModal: { color: '#666', textAlign: 'center', marginTop: 20 }
});