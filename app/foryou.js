import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  StatusBar, 
  Dimensions,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as API from '../services/api';

const { width } = Dimensions.get('window');

// DATOS ESTÁTICOS DE EJEMPLO (Respaldo)
const POSTS_INICIALES = [
  {
    id: 1,
    userId: 101, 
    usuario: "Tasha de los Backyardigans",
    avatar: "https://fbi.cults3d.com/uploaders/40342033/illustration-file/277a17de-b4a8-4d39-85a9-89edcfdf3e7e/tasha.png",
    ubicacion: "Mirador de Yanahuara",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJjrQRzZ9J-Z-Bby9PaZ-WsCLzD6wxr99udA&s",
    descripcion: "Disfrutando de la vista del Misti con un buen queso helado. 🏔️🍦",
    likes: 124,
    likedByMe: false,
    fecha: "Hace 2 horas",
    comentarios: [
      { user: "Pablo Escobar", text: "¡Qué hermosa vista! 😍" },
      { user: "TurismoPeru", text: "El mejor lugar para fotos." }
    ]
  },
  {
    id: 2,
    userId: 102,
    usuario: "Pablo el explorador",
    avatar: "https://fbi.cults3d.com/uploaders/40342033/illustration-file/40f7a3d4-3a88-427f-8b4b-70e6c5e02e21/pablo-detective.png",
    ubicacion: "Cañón del Colca",
    imagen: "https://www.peru.travel/Contenido/Atractivo/Imagen/es/8/1.2/Principal/Ca%C3%B1on%20del%20Colca.jpg",
    descripcion: "El vuelo del cóndor es algo que tienes que ver al menos una vez en la vida. Majestuoso. pdta:Casi me lleva, asi que tengan cuidado 🦅",
    likes: 89,
    likedByMe: false,
    fecha: "Hace 5 horas",
    comentarios: []
  },
  {
    id: 3,
    userId: 103,
    usuario: "Ricardo Palma",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-5xsn7BPM5X9Wyjfs_5cwWJ7-wUJqlbT9oQ&s",
    ubicacion: "Monasterio de Santa Catalina",
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQT4ZTXV5btAqsuxEX69bAk4YXAKPEfp56h6g&s",
    descripcion: "Perdiéndome en los colores y las calles de esta ciudad dentro de una ciudad. ❤️💙",
    likes: 256,
    likedByMe: true,
    fecha: "Hace 1 día",
    comentarios: [
       { user: "Tasha de los Backyardigans", text: "Esos colores son únicos. me recuerdan a mi" }
    ]
  }
];

export default function ForYouPage() {
  const router = useRouter();
  
  // --- ESTADOS ---
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Interacción
  const [comentarioInputs, setComentarioInputs] = useState({});
  const [mostrarComentarios, setMostrarComentarios] = useState({});
  
  // Chatbot & Inbox
  const [chatVisible, setChatVisible] = useState(false);
  const [inboxVisible, setInboxVisible] = useState(false);
  const [mensajes, setMensajes] = useState([{ id: 1, text: "¡Hola viajero! 🏔️ Soy PachaBot.", sender: 'bot' }]);
  const [chatInput, setChatInput] = useState("");
  const [solicitudes, setSolicitudes] = useState([]);
  const [usuariosMap, setUsuariosMap] = useState({});
  
  const flatListRef = useRef(null);

  // --- LÓGICA DE PERSISTENCIA ---
  const mergeWithLocalData = async (listaPosts) => {
    try {
      const json = await AsyncStorage.getItem("pacha_feed_interactions");
      const savedData = json ? JSON.parse(json) : {};
      
      return listaPosts.map(p => {
        const saved = savedData[p.id];
        if (!saved) return p;
        return {
          ...p,
          likedByMe: saved.likedByMe !== undefined ? saved.likedByMe : p.likedByMe,
          likes: saved.likes !== undefined ? saved.likes : p.likes,
          comentarios: saved.newComments ? [...p.comentarios, ...saved.newComments] : p.comentarios
        };
      });
    } catch (e) {
      return listaPosts;
    }
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    try {
      setLoading(true);
      const userInfo = await API.getUserInfo().catch(() => null);
      
      if (userInfo) {
        setUsuarioLogueado(userInfo);
        
        // Cargar Usuarios (Mapeo de Nombres)
        const usersData = await API.obtenerUsuarios().catch(()=>({success:false}));
        if(usersData && usersData.success){
            const map = {};
            usersData.usuarios.forEach(u => map[u.id] = u.nombre);
            setUsuariosMap(map);
        }

        // Cargar Solicitudes
        const relJson = await AsyncStorage.getItem("pacha_relaciones");
        const relaciones = relJson ? JSON.parse(relJson) : [];
        setSolicitudes(relaciones.filter(r => r.to === userInfo.id && r.status === 'pending'));

        // Cargar Reseñas Reales
        let todosLosPosts = [...POSTS_INICIALES];
        try {
           const resData = await API.obtenerResenas(userInfo.id);
           if (resData && resData.success && resData.resenas) {
              const misPosts = resData.resenas.map(r => ({
                  id: `review-${r.id}`, 
                  userId: userInfo.id,
                  usuario: userInfo.nombre,
                  avatar: `https://ui-avatars.com/api/?name=${userInfo.nombre}&background=ff6b00&color=fff`,
                  ubicacion: r.lugar_nombre || "Arequipa", 
                  imagen: r.lugar_imagen || "https://www.peru.travel/Contenido/Atractivo/Imagen/es/10/1.1/Principal/Yanahuara.jpg", 
                  descripcion: `⭐ ${r.calificacion}/5 — ${r.texto}`, 
                  likes: 0, 
                  likedByMe: false,
                  fecha: "Reciente",
                  comentarios: []
              }));
              todosLosPosts = [...misPosts, ...POSTS_INICIALES];
           }
        } catch (e) { console.log("Sin reseñas nuevas o error API"); }

        const finalPosts = await mergeWithLocalData(todosLosPosts);
        setPosts(finalPosts);
      } else {
         setPosts(await mergeWithLocalData(POSTS_INICIALES));
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  // --- ACCIONES ---
  const handleLike = async (postId) => {
    const nuevosPosts = posts.map(post => {
        if (post.id === postId) {
            const newLikedState = !post.likedByMe;
            const newLikes = newLikedState ? post.likes + 1 : post.likes - 1;
            return { ...post, likedByMe: newLikedState, likes: newLikes };
        }
        return post;
    });
    setPosts(nuevosPosts);

    try {
        const post = nuevosPosts.find(p => p.id === postId);
        const json = await AsyncStorage.getItem("pacha_feed_interactions");
        const savedData = json ? JSON.parse(json) : {};
        savedData[postId] = { ...(savedData[postId] || {}), likedByMe: post.likedByMe, likes: post.likes };
        await AsyncStorage.setItem("pacha_feed_interactions", JSON.stringify(savedData));
    } catch(e) {}
  };

  const handleComentar = async (postId) => {
    const texto = comentarioInputs[postId];
    if (!texto || !texto.trim()) return;

    const nuevoComentario = { user: usuarioLogueado?.nombre || "Yo", text: texto };
    const nuevosPosts = posts.map(p => {
        if (p.id === postId) return { ...p, comentarios: [...p.comentarios, nuevoComentario] };
        return p;
    });
    setPosts(nuevosPosts);
    setComentarioInputs({...comentarioInputs, [postId]: ''});
    setMostrarComentarios({...mostrarComentarios, [postId]: true});

    try {
        const json = await AsyncStorage.getItem("pacha_feed_interactions");
        const savedData = json ? JSON.parse(json) : {};
        const postData = savedData[postId] || {};
        const newComments = [...(postData.newComments || []), nuevoComentario];
        savedData[postId] = { ...postData, newComments };
        await AsyncStorage.setItem("pacha_feed_interactions", JSON.stringify(savedData));
    } catch(e) {}
  };

  const responderSolicitud = async (id, aceptar) => {
    const relJson = await AsyncStorage.getItem("pacha_relaciones");
    const relaciones = relJson ? JSON.parse(relJson) : [];
    if (aceptar) {
        const nuevas = relaciones.map(r => r.id === id ? { ...r, status: 'accepted' } : r);
        await AsyncStorage.setItem("pacha_relaciones", JSON.stringify(nuevas));
        Alert.alert("¡Conectado!", "Ahora son amigos.");
    } else {
        const filtradas = relaciones.filter(r => r.id !== id);
        await AsyncStorage.setItem("pacha_relaciones", JSON.stringify(filtradas));
    }
    setSolicitudes(prev => prev.filter(s => s.id !== id));
  };

  const handleChatSend = () => {
    if(!chatInput.trim()) return;
    const userMsg = { id: Date.now(), text: chatInput, sender: 'user' };
    setMensajes(prev => [...prev, userMsg]);
    setChatInput("");
    setTimeout(() => {
        setMensajes(prev => [...prev, { id: Date.now()+1, text: "¡Qué interesante! Cuéntame más.", sender: 'bot' }]);
    }, 1000);
  };

  // --- COMPONENTE: BARRA DE NAVEGACIÓN SUPERIOR (HISTORIAS - LIMPIA) ---
  const NavBubble = ({ title, icon, route, isAction }) => (
    <TouchableOpacity 
       style={styles.navBubble} 
       onPress={() => isAction ? route() : router.push(route)}
    >
       <LinearGradient colors={['#333', '#111']} style={styles.navBubbleIcon}>
           <Text style={{fontSize: 22}}>{icon}</Text>
       </LinearGradient>
       <Text style={styles.navBubbleText}>{title}</Text>
    </TouchableOpacity>
  );

  const renderHeaderComponent = () => (
      <View>
          <View style={styles.storiesContainer}>
              {/* AQUÍ ESTÁ EL CAMBIO: SOLO LAS OPCIONES QUE FALTAN ABAJO */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 15, gap: 15}}>
                  <NavBubble title="Rutas" icon="📍" route="/rutas" />
                  <NavBubble title="Equipo" icon="👥" route="/contactanos" />
                  <NavBubble title="RDF" icon="🌐" isAction route={() => Alert.alert("RDF", "Datos Semánticos: Pronto")} />
              </ScrollView>
          </View>
          <View style={styles.divider} />
      </View>
  );

  // --- RENDER POST ---
  const renderPost = ({ item }) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <View style={styles.userMeta}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <View>
                    <Text style={styles.username}>{item.usuario}</Text>
                    <Text style={styles.location}>{item.ubicacion}</Text>
                </View>
            </View>
            <TouchableOpacity onPress={() => router.push(`/perfil?id=${item.userId}`)}>
                <Ionicons name="ellipsis-horizontal" size={20} color="#a0a0a0" />
            </TouchableOpacity>
        </View>

        <View style={styles.imageContainer}>
            <Image source={{ uri: item.imagen }} style={styles.postImage} resizeMode="cover" />
        </View>

        <View style={styles.actionsRow}>
            <View style={styles.leftActions}>
                <TouchableOpacity onPress={() => handleLike(item.id)}>
                    <Ionicons name={item.likedByMe ? "heart" : "heart-outline"} size={28} color={item.likedByMe ? "#ff4757" : "white"} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMostrarComentarios({...mostrarComentarios, [item.id]: !mostrarComentarios[item.id]})}>
                    <Ionicons name="chatbubble-outline" size={26} color="white" />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Ionicons name="paper-plane-outline" size={26} color="white" />
                </TouchableOpacity>
            </View>
            <TouchableOpacity><Ionicons name="bookmark-outline" size={26} color="white" /></TouchableOpacity>
        </View>

        <View style={styles.captionContainer}>
            <Text style={styles.likesText}>{item.likes} Me gusta</Text>
            <Text style={styles.captionText}>
                <Text style={styles.usernameCaption}>{item.usuario}</Text> {item.descripcion}
            </Text>
            <Text style={styles.timeAgo}>{item.fecha}</Text>
        </View>

        {mostrarComentarios[item.id] && (
            <View style={styles.commentsSection}>
                {item.comentarios.map((c, i) => (
                    <Text key={i} style={styles.commentText}>
                        <Text style={styles.commentUser}>{c.user} </Text>{c.text}
                    </Text>
                ))}
                <View style={styles.inputContainer}>
                    <TextInput 
                        style={styles.commentInput} 
                        placeholder="Comentar..." 
                        placeholderTextColor="#666"
                        value={comentarioInputs[item.id] || ''}
                        onChangeText={t => setComentarioInputs({...comentarioInputs, [item.id]: t})}
                    />
                    <TouchableOpacity onPress={() => handleComentar(item.id)}>
                        <Text style={styles.postBtnText}>Publicar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* HEADER SUPERIOR */}
      <View style={styles.header}>
         <View style={styles.logoRow}>
             <LinearGradient colors={['#ff6b00', '#fbbf24']} style={styles.mountainIcon} />
             <Text style={styles.logoText}>PachaQutec</Text>
         </View>
         <View style={styles.headerIcons}>
             <TouchableOpacity onPress={() => setInboxVisible(true)} style={styles.iconBtn}>
                 <Ionicons name="heart-outline" size={26} color="white" />
                 {solicitudes.length > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{solicitudes.length}</Text></View>}
             </TouchableOpacity>
             <TouchableOpacity onPress={() => setChatVisible(true)}>
                 <Ionicons name="chatbubble-ellipses-outline" size={26} color="white" />
             </TouchableOpacity>
         </View>
      </View>

      {/* FEED + STORIES */}
      {loading ? (
          <ActivityIndicator size="large" color="#ff6b00" style={{marginTop: 50}} />
      ) : (
          <FlatList
            data={posts}
            keyExtractor={item => item.id.toString()}
            renderItem={renderPost}
            ListHeaderComponent={renderHeaderComponent} // Aquí van las "historias" filtradas
            contentContainerStyle={styles.feedContent}
            showsVerticalScrollIndicator={false}
          />
      )}

      {/* BARRA INFERIOR (TAB BAR) */}
      <View style={styles.tabBar}>
         <TouchableOpacity onPress={() => {}}><Ionicons name="home" size={28} color="#ff6b00" /></TouchableOpacity>
         <TouchableOpacity onPress={() => router.push('/lugares')}><Ionicons name="search" size={28} color="#fff" /></TouchableOpacity>
         <TouchableOpacity onPress={() => router.push('/resenas')}><Ionicons name="add-circle-outline" size={32} color="#fff" /></TouchableOpacity>
         <TouchableOpacity onPress={() => router.push('/favoritos')}><Ionicons name="heart-outline" size={28} color="#fff" /></TouchableOpacity>
         <TouchableOpacity onPress={() => router.push('/perfil')}>
            {usuarioLogueado ? (
                <View style={styles.miniAvatar}><Text style={{color:'white', fontWeight:'bold', fontSize:10}}>{usuarioLogueado.nombre.charAt(0)}</Text></View>
            ) : (
                <Ionicons name="person-circle-outline" size={28} color="#fff" />
            )}
         </TouchableOpacity>
      </View>

      {/* CHAT MODAL */}
      <Modal visible={chatVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={()=>setChatVisible(false)}>
         <View style={styles.modalContainer}>
             <View style={styles.modalHeader}>
                 <Text style={styles.modalTitle}>Asistente Pacha</Text>
                 <TouchableOpacity onPress={()=>setChatVisible(false)}><Ionicons name="close" size={28} color="white"/></TouchableOpacity>
             </View>
             <FlatList 
                data={mensajes} 
                renderItem={({item}) => (
                    <View style={[styles.msgBubble, item.sender==='user' ? styles.msgUser : styles.msgBot]}>
                        <Text style={item.sender==='user' ? styles.textUser : styles.textBot}>{item.text}</Text>
                    </View>
                )}
                keyExtractor={i=>i.id.toString()}
                contentContainerStyle={{padding:20, gap:10}}
             />
             <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                 <View style={styles.chatInputRow}>
                     <TextInput style={styles.chatInput} value={chatInput} onChangeText={setChatInput} placeholder="Escribe..." placeholderTextColor="#888" />
                     <TouchableOpacity onPress={handleChatSend}><Ionicons name="send" size={24} color="#ff6b00"/></TouchableOpacity>
                 </View>
             </KeyboardAvoidingView>
         </View>
      </Modal>

      {/* INBOX MODAL */}
      <Modal visible={inboxVisible} animationType="fade" transparent onRequestClose={()=>setInboxVisible(false)}>
         <View style={styles.inboxOverlay}>
             <View style={styles.inboxCard}>
                 <View style={styles.inboxHeader}>
                     <Text style={styles.inboxTitle}>Notificaciones</Text>
                     <TouchableOpacity onPress={()=>setInboxVisible(false)}><Ionicons name="close" size={24} color="#aaa"/></TouchableOpacity>
                 </View>
                 {solicitudes.length === 0 ? (
                     <Text style={styles.emptyInbox}>No tienes notificaciones pendientes.</Text>
                 ) : (
                     solicitudes.map(s => (
                         <View key={s.id} style={styles.requestRow}>
                             <Text style={styles.reqText}><Text style={{fontWeight:'bold', color:'white'}}>{usuariosMap[s.from] || "Usuario"}</Text> quiere conectar</Text>
                             <View style={{flexDirection:'row', gap:10}}>
                                 <TouchableOpacity onPress={()=>responderSolicitud(s.id, true)} style={styles.btnConfirm}><Text style={{color:'white', fontWeight:'bold'}}>✓</Text></TouchableOpacity>
                                 <TouchableOpacity onPress={()=>responderSolicitud(s.id, false)} style={styles.btnDeny}><Text style={{color:'#ff4757', fontWeight:'bold'}}>✕</Text></TouchableOpacity>
                             </View>
                         </View>
                     ))
                 )}
             </View>
         </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  
  // NAVBAR
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 50, paddingBottom: 10, paddingHorizontal: 15,
    backgroundColor: '#000', borderBottomWidth: 1, borderBottomColor: '#1a1a1a'
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mountainIcon: { width: 24, height: 24, borderRadius: 4, transform: [{rotate:'45deg'}] },
  logoText: { fontSize: 22, fontWeight: '800', color: 'white', letterSpacing: -0.5 },
  headerIcons: { flexDirection: 'row', gap: 20 },
  iconBtn: { position: 'relative' },
  badge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#ff4757', width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

  // NAVIGATION BUBBLES
  storiesContainer: { paddingVertical: 10, backgroundColor: '#000' },
  navBubble: { alignItems: 'center', gap: 5, width: 70 },
  navBubbleIcon: { 
    width: 60, height: 60, borderRadius: 30, 
    justifyContent: 'center', alignItems: 'center', 
    borderWidth: 2, borderColor: '#333' 
  },
  navBubbleText: { color: 'white', fontSize: 11 },
  divider: { height: 1, backgroundColor: '#1a1a1a' },

  // FEED
  feedContent: { paddingBottom: 60 },
  card: { marginBottom: 15, backgroundColor: '#000' },
  
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 },
  userMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#333' },
  username: { color: 'white', fontWeight: '700', fontSize: 13 },
  location: { color: '#a0a0a0', fontSize: 11 },

  imageContainer: { width: width, height: 400 },
  postImage: { width: '100%', height: '100%' },

  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, paddingBottom: 5 },
  leftActions: { flexDirection: 'row', gap: 16 },

  captionContainer: { paddingHorizontal: 12 },
  likesText: { color: 'white', fontWeight: '700', marginBottom: 5, fontSize: 13 },
  captionText: { color: 'white', fontSize: 13, lineHeight: 18 },
  usernameCaption: { fontWeight: '700' },
  timeAgo: { color: '#666', fontSize: 10, marginTop: 5, textTransform: 'uppercase' },

  commentsSection: { paddingHorizontal: 12, marginTop: 8 },
  commentText: { color: '#ddd', fontSize: 13, marginBottom: 2 },
  commentUser: { fontWeight: '700', color: 'white' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  commentInput: { flex: 1, color: 'white', fontSize: 12 },
  postBtnText: { color: '#ff6b00', fontWeight: '600', fontSize: 12 },

  // TAB BAR
  tabBar: { 
    position: 'absolute', bottom: 0, width: '100%', height: 50, backgroundColor: '#000',
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#1a1a1a'
  },
  miniAvatar: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#ff6b00', justifyContent: 'center', alignItems: 'center' },

  // FAB CHAT (Movido para no tapar TabBar)
  fabChat: { position: 'absolute', bottom: 80, right: 20 },
  fabGradient: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5 },

  // MODALES
  modalContainer: { flex: 1, backgroundColor: '#121212' },
  modalHeader: { padding: 15, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#1a1a1a' },
  modalTitle: { color: 'white', fontSize: 16, fontWeight: '700' },
  msgBubble: { padding: 10, borderRadius: 16, maxWidth: '80%' },
  msgBot: { backgroundColor: '#2a2a2a', alignSelf: 'flex-start' },
  msgUser: { backgroundColor: '#ff6b00', alignSelf: 'flex-end' },
  textBot: { color: '#ddd' },
  textUser: { color: 'white' },
  chatInputRow: { flexDirection: 'row', padding: 10, backgroundColor: '#1a1a1a', alignItems: 'center', gap: 10 },
  chatInput: { flex: 1, backgroundColor: '#333', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, color: 'white' },

  inboxOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  inboxCard: { width: '85%', backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20 },
  inboxHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  inboxTitle: { color: 'white', fontSize: 16, fontWeight: '700' },
  requestRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#222' },
  reqText: { color: '#ccc', flex: 1 },
  btnConfirm: { backgroundColor: '#ff6b00', padding: 8, borderRadius: 6, marginRight: 8 },
  btnDeny: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 6 },
  emptyInbox: { color: '#666', textAlign: 'center', padding: 20 }
});