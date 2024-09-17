import React from 'react';
import { StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import Mapa from './Vistas/Mapa';
import Inicio from './Vistas/Inicio';
import Registrar from './Vistas/Registrar';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function MapaStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MapaScreen" component={Mapa} />
    </Stack.Navigator>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        drawerStyle: {
          backgroundColor: '#c6cbef',
          width: 240,
        },
      }}
    >
      <Drawer.Screen
        name="Mapa"
        component={MapaStack}
        options={{
          headerShown: false,
        }}
      />
      {/* Add other drawer screens here */}
    </Drawer.Navigator>
  );
}

function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Inicio} />
      <Stack.Screen name="DrawerScreens" component={DrawerNavigator} />
      <Stack.Screen name="Registro" component={Registrar} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <RootStack />
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
