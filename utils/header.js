import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Mapa from './Vistas/Mapa';
import Usuario from './Vistas/Usuario';
import Servicio from './Vistas/Servicio';
import Soporte from './Vistas/Soporte';
import Ayuda from './Vistas/Ayuda';

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator>
        <Drawer.Screen 
          name="Mapa" 
          component={Mapa} 
          options={{
            headerTitle: '',
          }} 
        />
        <Drawer.Screen name="User" component={Usuario} />
        <Drawer.Screen name="Services" component={Servicio} />
        <Drawer.Screen name="Sport" component={Soporte} />
        <Drawer.Screen name="Help" component={Ayuda} />
      </Drawer.Navigator>
    </NavigationContainer>
  );


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
