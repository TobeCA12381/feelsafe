import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Appbar } from 'react-native-paper'; // Importamos AppBar de react-native-paper
import { useNavigation } from '@react-navigation/native'; // Para la navegación entre pantallas

const Seguridad = () => {

  const navigation = useNavigation();

  const handleBackPress = () => {
    navigation.navigate('Asignar Ruta'); // Regresa a la ruta de tu menú principal
  };

  return (
    <View style={styles.container}>
      {/* AppBar */}
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction onPress={handleBackPress} color="#FFF" left={10}/>
        <Appbar.Content title="Seguridad" titleStyle={styles.appBarTitle} />
      </Appbar.Header>

      {/* Contenido principal */}
      <View style={styles.mainContent}>
        {/* Botones principales con imágenes */}
        <View style={styles.row}>
          <TouchableOpacity style={styles.button}>
            <Image
              source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/technical-support.png' }} // Imagen Soporte
              style={styles.iconImage}
            />
            <Text style={styles.buttonText}>Soporte</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Image
              source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/id-verified.png' }} // Imagen Verificación de identidad
              style={styles.iconImage}
            />
            <Text style={styles.buttonText}>Contactos de emergencia</Text>
          </TouchableOpacity>
        </View>

        {/* Botón Llamar a emergencias */}
        <TouchableOpacity style={styles.emergencyButton}>
          <Text style={styles.emergencyText}>Llamar a emergencias</Text>
        </TouchableOpacity>

        {/* Sección 'Cómo estás protegido' */}
        <Text style={styles.sectionTitle}>Cómo estás protegido</Text>

        {/* Botones con imágenes de rutas seguras */}
        <View style={styles.row}>
          <TouchableOpacity style={styles.button}>
            <Image
              source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/bell.png' }} // Imagen Alertas de seguridad
              style={styles.iconImage}
            />
            <Text style={styles.buttonText}>Alertas de seguridad</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Image
              source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/chat.png' }} // Imagen Chat de emergencias
              style={styles.iconImage}
            />
            <Text style={styles.buttonText}>Chat de emergencias 24/7</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={styles.button}>
            <Image
              source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/walking.png' }} // Imagen Zonas con tráfico peatonal
              style={styles.iconImage}
            />
            <Text style={styles.buttonText}>Zonas con más tráfico peatonal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Image
              source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/marker.png' }} // Imagen Rutas seguras cercanas
              style={styles.iconImage}
            />
            <Text style={styles.buttonText}>Rutas seguras cercanas</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={styles.button}>
            <Image
              source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/shield.png' }} // Imagen Funciones de seguridad
              style={styles.iconImage}
            />
            <Text style={styles.buttonText}>Funciones de seguridad</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1c',
  },
  appBar: {
    backgroundColor: '#2b2b2b',
    left: 30
  },
  appBarTitle: {
    color: '#fff',
    left: 15
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#2b2b2b',
    padding: 15,
    margin: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  emergencyButton: {
    backgroundColor: '#ff5c5c',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  emergencyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  iconImage: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
});

export default Seguridad;
