import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Mapa from './Vistas/Mapa';
import Inicio from './Vistas/Inicio';
import Registrar from './Vistas/Registrar';

export default function App() {
  const Stack = createStackNavigator();

  function MyStack() {
    return (
      <Stack.Navigator>
        <Stack.Screen 
          name="Login" 
          component={Inicio} 
          options={{ headerShown: false }} // Oculta el encabezado en la pantalla de inicio de sesión
        />
         <Stack.Screen 
          name="Mapa" 
          component={Mapa} 
          options={{ headerShown: false }} // Oculta el encabezado en la pantalla del mapa
        />
        <Stack.Screen name="Registro" component={Registrar} />
      </Stack.Navigator>
    );
  }

  return (
    <NavigationContainer>
      <MyStack />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '70%',
  },
  inputContainer: {
    width: '100%',
    height: '30%',
    backgroundColor: '#FFFDC5',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '90%',
    height: 50,
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  menuButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 25,
  },
  gpsButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 25,
  },
});
