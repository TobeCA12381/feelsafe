import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Appbar } from 'react-native-paper'; // Importamos AppBar de react-native-paper
import { useNavigation } from '@react-navigation/native'; // Para la navegación entre pantallas

const ContactosEmergencia = () => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    navigation.goBack(); // Regresa a la ruta anterior
  };

  return (
    <View style={styles.container}>
      {/* AppBar */}
      <Appbar.Header style={styles.appBar}>
        {/*<Appbar.BackAction onPress={handleBackPress} color="#FFF" />*/}
        <Appbar.Content title="Contactos de emergencia" titleStyle={styles.appBarTitle} />
        <TouchableOpacity onPress={handleBackPress}>
          <Text style={styles.closeButton}>X</Text>
        </TouchableOpacity>
      </Appbar.Header>

      {/* Contenido principal */}
      <View style={styles.mainContent}>
        {/* Imagen superior */}
        <Image
          source={{ uri: 'https://img.icons8.com/ios-filled/100/4caf50/smartphone.png' }} // Imagen de ejemplo
          style={styles.image}
        />

        {/* Texto descriptivo */}
        <Text style={styles.descriptionText}>
          Agregue hasta 5 contactos de emergencia. Nos comunicaremos con ellos en caso de una emergencia.
        </Text>

        {/* Botón para añadir contacto */}
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Añadir contacto</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  appBarTitle: {
    color: '#fff',
    fontSize: 18,
  },
  closeButton: {
    color: '#fff',
    fontSize: 24,
    paddingRight: 15,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  descriptionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  addButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ContactosEmergencia;
