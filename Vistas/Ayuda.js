import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ScrollView } from 'react-native';
import { Appbar } from 'react-native-paper'; 
import { useNavigation } from '@react-navigation/native';

const Ayuda = () => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    navigation.navigate('Asignar Ruta'); // Regresa a la ruta de tu menú principal
  };

  // Datos para la segunda lista de opciones de ayuda (FeelSafe)
  const opciones = [
    { id: '1', icon: 'https://img.icons8.com/ios-filled/50/000000/marker.png', text: 'Problema con la ruta' },
    { id: '2', icon: 'https://img.icons8.com/ios-filled/50/000000/faq.png', text: 'Consultas más frecuentes' },
    { id: '3', icon: 'https://img.icons8.com/ios-filled/50/000000/alarm.png', text: 'Problema con las alertas de notificaciones' },
    { id: '4', icon: 'https://img.icons8.com/ios-filled/50/000000/document.png', text: 'Términos y condiciones' },
    { id: '5', icon: 'https://img.icons8.com/ios-filled/50/000000/lock.png', text: 'Política de privacidad' },
  ];

  // Renderiza cada opción en la primera lista de problemas
  const renderProblema = ({ item }) => (
    <TouchableOpacity style={styles.option}>
      <Text style={styles.optionText}>{item.text}</Text>
      <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/chevron-right.png' }} style={styles.chevron} />
    </TouchableOpacity>
  );

  // Renderiza cada opción en la segunda lista de FeelSafe
  const renderOpcion = ({ item }) => (
    <TouchableOpacity style={styles.option}>
      <Image source={{ uri: item.icon }} style={styles.icon} />
      <Text style={styles.optionText}>{item.text}</Text>
      <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/chevron-right.png' }} style={styles.chevron} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* AppBar */}
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction onPress={handleBackPress} color="#FFF" left={10}/>
        <Appbar.Content title="Ayuda" titleStyle={styles.appBarTitle} />
      </Appbar.Header>

      {/* ScrollView para permitir desplazamiento completo */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerText}>Centro de ayuda</Text>
        <Text style={styles.infoText}>Resuelve tus dudas sobre FeelSafe</Text>
        {opciones.map((item) => renderOpcion({ item }))}

        {/* Espacio al final */}
        <View style={styles.footerSpace} />
      </ScrollView>
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
    fontWeight: 'bold',
    fontSize: 20,
    left: 15
  },
  scrollContainer: {
    paddingBottom: 50, // Asegura que todo el contenido tenga suficiente espacio para desplazarse
  },
  problemList: {
    marginVertical: 15,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginLeft: 15,
  },
  subHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
    marginLeft: 15,
  },
  infoText: {
    fontSize: 16,
    color: '#777',
    marginTop: 5,
    marginLeft: 15,
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  chevron: {
    width: 20,
    height: 20,
    tintColor: '#777',
  },
});

export default Ayuda;
