import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api.pachaqutec.com';

const saveUser = async (user) => await AsyncStorage.setItem('userInfo', JSON.stringify(user));
const getUser = async () => {
  const data = await AsyncStorage.getItem('userInfo');
  return data ? JSON.parse(data) : null;
};
const removeUser = async () => await AsyncStorage.removeItem('userInfo');

// AUTH
export const login = async (email, password) => {
  try {
    console.log('🔵 Login URL:', `${BASE_URL}/login`);
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    console.log('📡 Status:', response.status);
    const data = await response.json();
    console.log('📦 Data:', data);
    
    if (response.ok && data.success && data.usuario) {
      await saveUser(data.usuario);
      return { success: true, usuario: data.usuario };
    } else {
      return { success: false, message: data.error || 'Error en login' };
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    return { success: false, message: 'Error de conexión' };
  }
};

export const register = async (nombre, email, password) => {
  try {
    console.log('🔵 Register URL:', `${BASE_URL}/registro`);
    const response = await fetch(`${BASE_URL}/registro`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ nombre, email, password })
    });
    
    console.log('📡 Status:', response.status);
    const data = await response.json();
    console.log('📦 Data:', data);
    
    if (response.ok && data.success && data.usuario) {
      await saveUser(data.usuario);
      return { success: true, usuario: data.usuario };
    } else {
      return { success: false, message: data.error || 'Error en registro' };
    }
  } catch (error) {
    console.error('❌ Register error:', error);
    return { success: false, message: 'Error de conexión' };
  }
};

export const logout = async () => {
  await removeUser();
};

export const getUserInfo = async () => {
  return await getUser();
};

// LUGARES
export const getTouristLocations = async () => {
  console.log('🔵 Obteniendo lugares:', `${BASE_URL}/lugares`);
  const response = await fetch(`${BASE_URL}/lugares`, {
    headers: { 'Accept': 'application/json' }
  });
  
  if (!response.ok) throw new Error('Error al cargar lugares');
  
  const data = await response.json();
  console.log('📦 Lugares data:', data);
  
  return data.lugares || [];
};

// FAVORITOS
export const getFavorites = async () => {
  const userInfo = await getUser();
  
  if (!userInfo || !userInfo.id) {
    throw new Error('Usuario no encontrado');
  }
  
  console.log('🔵 Obteniendo favoritos:', `${BASE_URL}/favoritos/usuario/${userInfo.id}`);
  const response = await fetch(`${BASE_URL}/favoritos/usuario/${userInfo.id}`, {
    headers: { 'Accept': 'application/json' }
  });
  
  if (!response.ok) throw new Error('Error al cargar favoritos');
  
  const data = await response.json();
  console.log('📦 Favoritos data:', data);
  
  return data.favoritos || [];
};

export const addFavorite = async (locationId) => {
  const userInfo = await getUser();
  
  if (!userInfo || !userInfo.id) {
    throw new Error('Usuario no encontrado');
  }
  
  console.log('🔵 Agregando favorito:', `${BASE_URL}/favoritos`);
  const response = await fetch(`${BASE_URL}/favoritos`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ 
      usuarioId: userInfo.id,  // ✅ camelCase
      lugarId: locationId       // ✅ camelCase
    })
  });
  
  const data = await response.json();
  console.log('📦 Add favorito response:', data);
  
  if (!response.ok) throw new Error(data.error || 'Error al agregar favorito');
  
  return data;
};

export const removeFavorite = async (favoritoId) => {
  console.log('🔵 Eliminando favorito:', `${BASE_URL}/favoritos/eliminar/${favoritoId}`);
  const response = await fetch(`${BASE_URL}/favoritos/eliminar/${favoritoId}`, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json' }
  });
  
  const data = await response.json();
  console.log('📦 Remove favorito response:', data);
  
  return response.ok;
};

// RESEÑAS
export const getMyReviews = async () => {
  const userInfo = await getUser();
  
  if (!userInfo || !userInfo.id) {
    throw new Error('Usuario no encontrado');
  }
  
  console.log('🔵 Obteniendo reseñas:', `${BASE_URL}/resenas/usuario/${userInfo.id}`);
  const response = await fetch(`${BASE_URL}/resenas/usuario/${userInfo.id}`, {
    headers: { 'Accept': 'application/json' }
  });
  
  if (!response.ok) throw new Error('Error al cargar reseñas');
  
  const data = await response.json();
  console.log('📦 Reseñas data:', data);
  
  return data.resenas || data.data || [];
};

export const createReview = async (locationId, calificacion, texto) => {
  const userInfo = await getUser();
  
  if (!userInfo || !userInfo.id) {
    throw new Error('Usuario no encontrado');
  }
  
  console.log('🔵 Creando reseña:', `${BASE_URL}/resenas`);
  const response = await fetch(`${BASE_URL}/resenas`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ 
      usuarioId: userInfo.id,  // ✅ camelCase
      lugarId: locationId,      // ✅ camelCase
      calificacion,
      texto 
    })
  });
  
  const data = await response.json();
  console.log('📦 Create reseña response:', data);
  
  if (!response.ok) throw new Error(data.error || 'Error al crear reseña');
  
  return data;
};