import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RouteInputPanel = ({ onClose, setOrigenInput, setDestinoInput, origenValue, destinoValue }) => {
  const [inputDe, setInputDe] = useState('');
  const [inputA, setInputA] = useState('');

  useEffect(() => {
    // Cuando el panel se abre, usa los valores actuales de origen y destino
    setInputDe(origenValue || '');
    setInputA(destinoValue || '');
  }, [origenValue, destinoValue]);

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.title}>Introduce tu ruta</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="De (Origen)"
          placeholderTextColor="#8E8E93"
          value={inputDe}
          onChangeText={text => setInputDe(text)} // Capturar el valor del origen
        />
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="A (Destino)"
          placeholderTextColor="#8E8E93"
          value={inputA}
          onChangeText={text => setInputA(text)} // Capturar el valor del destino
        />
      </View>
      
      <TouchableOpacity 
        onPress={() => {
          // Actualizamos los valores en el componente principal
          setOrigenInput(inputDe); 
          setDestinoInput(inputA); 
          onClose(); // Cerramos el panel
        }} 
        style={styles.confirmButton}
      >
        <Text style={styles.confirmButtonText}>Confirmar ruta</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  confirmButton: {
    backgroundColor: '#1E90FF', // Un color visible, como azul
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',  // Centrar el texto dentro del botón
    marginTop: 20, // Añadir margen superior para separarlo de otros elementos
  },
  confirmButtonText: {
    color: 'white', // Asegúrate de que el texto sea visible
    fontSize: 16,
    fontWeight: 'bold',
  },
  panel: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    padding: 10,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    marginRight: 10,
  },
  addressText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  mapOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  mapOptionText: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default RouteInputPanel;