import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="registro" />
      <Stack.Screen name="foryou" />
      <Stack.Screen name="lugares" />
      <Stack.Screen name="favoritos" />
      <Stack.Screen name="rutas" />
      <Stack.Screen name="resenas" />
      <Stack.Screen name="contactanos" />
    </Stack>
  );
}