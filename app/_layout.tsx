import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

export default function RootLayout() {
  return (
    <>
      {/* Configuración global de la barra de estado (letras blancas) */}
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <Stack 
        screenOptions={{ 
          headerShown: false,                  // Ocultamos headers nativos
          contentStyle: { backgroundColor: '#000000' }, // Fondo negro base
          animation: 'slide_from_right'        // Animación suave
        }}
      >
        {/* El orden importa: index es la primera pantalla */}
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="registro" />
        <Stack.Screen name="foryou" />
        <Stack.Screen name="lugares" />
        <Stack.Screen name="favoritos" />
        <Stack.Screen name="rutas" />
        <Stack.Screen name="resenas" />
        <Stack.Screen name="contactanos" />
        <Stack.Screen name="perfil" />
      </Stack>
    </>
  );
}