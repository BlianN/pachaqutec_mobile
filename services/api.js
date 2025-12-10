import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api.pachaqutec.com'; // O tu IP local si estás en desarrollo: 'http://192.168.1.X:8080'

// --- HELPER FUNCTIONS ---
const saveUser = async (user) => await AsyncStorage.setItem('userInfo', JSON.stringify(user));
const getUser = async () => {
  const data = await AsyncStorage.getItem('userInfo');
  return data ? JSON.parse(data) : null;
};
const removeUser = async () => await AsyncStorage.removeItem('userInfo');

// --- AUTH ---
export const login = async (email, password) => {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok && data.success) {
      await saveUser(data.usuario);
      return { success: true, usuario: data.usuario };
    }
    return { success: false, message: data.error || 'Error en login' };
  } catch (error) {
    return { success: false, message: 'Error de conexión' };
  }
};

export const register = async (nombre, email, password) => {
  try {
    const response = await fetch(`${BASE_URL}/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });
    const data = await response.json();
    if (response.ok && data.success) {
      await saveUser(data.usuario);
      return { success: true, usuario: data.usuario };
    }
    return { success: false, message: data.error || 'Error en registro' };
  } catch (error) {
    return { success: false, message: 'Error de conexión' };
  }
};

export const logout = async () => { await removeUser(); };
export const getUserInfo = async () => { return await getUser(); };

// --- USUARIOS (NUEVO PARA PERFIL) ---
export const obtenerUsuarios = async () => {
  try {
    const response = await fetch(`${BASE_URL}/usuarios`, { headers: { 'Accept': 'application/json' } });
    const data = await response.json();
    return data; 
  } catch (error) {
    console.error('Error obtenerUsuarios:', error);
    return { success: false };
  }
};

// --- LUGARES ---
export const getTouristLocations = async () => {
  const response = await fetch(`${BASE_URL}/lugares`, { headers: { 'Accept': 'application/json' } });
  const data = await response.json();
  return data.lugares || [];
};

// --- FAVORITOS ---
// Obtener favoritos de CUALQUIER usuario (por ID)
export const obtenerFavoritos = async (usuarioId) => {
  try {
    const response = await fetch(`${BASE_URL}/favoritos/usuario/${usuarioId}`, { headers: { 'Accept': 'application/json' } });
    const data = await response.json();
    return data; // Retorna objeto con { success: true, favoritos: [] }
  } catch (error) {
    console.error('Error obtenerFavoritos:', error);
    return { success: false, favoritos: [] };
  }
};

// Versión "Mis Favoritos" (usa el usuario logueado automáticamente)
export const getFavorites = async () => {
  const userInfo = await getUser();
  if (!userInfo) return [];
  const res = await obtenerFavoritos(userInfo.id);
  return res.favoritos || [];
};

export const addFavorite = async (locationId) => {
  const userInfo = await getUser();
  const response = await fetch(`${BASE_URL}/favoritos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ usuarioId: userInfo.id, lugarId: locationId })
  });
  return await response.json();
};

export const removeFavorite = async (favoritoId) => {
  const response = await fetch(`${BASE_URL}/favoritos/eliminar/${favoritoId}`, { method: 'DELETE' });
  return response.ok;
};

// --- RESEÑAS ---
// Obtener reseñas de CUALQUIER usuario (por ID)
export const obtenerResenasUsuario = async (usuarioId) => {
  try {
    const response = await fetch(`${BASE_URL}/resenas/usuario/${usuarioId}`, { headers: { 'Accept': 'application/json' } });
    const data = await response.json();
    // Normalizamos la respuesta para que siempre devuelva "resenas"
    if (data.data) data.resenas = data.data; 
    return data;
  } catch (error) {
    console.error('Error obtenerResenasUsuario:', error);
    return { success: false, resenas: [] };
  }
};

// Versión "Mis Reseñas" (Legacy support)
export const getMyReviews = async () => {
  const userInfo = await getUser();
  if (!userInfo) return [];
  const res = await obtenerResenasUsuario(userInfo.id);
  return res.resenas || [];
};

export const obtenerResenas = async (userId) => {
    return obtenerResenasUsuario(userId); // Alias para compatibilidad con código web
};

export const createReview = async (locationId, calificacion, texto) => {
  const userInfo = await getUser();
  const response = await fetch(`${BASE_URL}/resenas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ usuarioId: userInfo.id, lugarId: locationId, calificacion, texto })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Error');
  return data;
};