import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Mapa from './Vistas/Mapa';
import Inicio from './Vistas/Inicio';
import Registrar from './Vistas/Registrar';
import UserCard from './Vistas/UserCard'; 
import Configuracion from './Vistas/Configuracion';
import Seguridad from './Vistas/Seguridad';
import Soporte from './Vistas/Soporte';
import CustomDrawerContent from './Componentes/CustomDrawerContent';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function withFloatingMenu(WrappedComponent) {
  return function MenuWrapper({ navigation, ...props }) {
    const abrirMenuLateral = () => {
      navigation.openDrawer();
    };

    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={styles.botonMenu} onPress={abrirMenuLateral}>
          <Ionicons name="menu" size={30} color="#FFF" />
        </TouchableOpacity>
        <WrappedComponent {...props} />
      </View>
    );
  };
}

function MapaStack({}) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MapaScreen" component={Mapa} />
    </Stack.Navigator>
  );
}



// Aquí envolvemos todo en el DrawerNavigator
function DrawerNavigator() {
  return (
    <Drawer.Navigator

      drawerContent={(props) => <CustomDrawerContent {...props} />}  // Aquí pasamos el drawer personalizado
      screenOptions={{
        headerShown: true,
        drawerStyle: {
          backgroundColor: '#c6cbef',
          width: 240,
        },
      }}
    >
      <Drawer.Screen
        name="Asignar Ruta"
        component={MapaStack}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="Usuario"
        component={withFloatingMenu(UserCard)}
        options={{
           headerShown: false,
         }}
      />
      <Drawer.Screen
        name="Seguridad"
        component={withFloatingMenu(Seguridad)}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="Soporte"
        component={withFloatingMenu(Soporte)}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="Configuración"
        component={withFloatingMenu(Configuracion)}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="Salir"
        component={Inicio}
        options={{
          headerShown: false,
        }}
      />
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
      <RootStack/> 
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

  botonMenu: {
    position: 'absolute',
    top: 10,
    
    borderRadius: 25,
    padding: 10,
    zIndex: 1,
  },
});