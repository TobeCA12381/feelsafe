import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const Email = () => {
  const navigation = useNavigation();
  const currentEmail = "j***@gmail.com";
  const verificationDate = "2024-10-22";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <IconButton icon="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Correo electrónico actual</Text>
      </View>

      <Text style={styles.email}>{currentEmail}</Text>
      <Text style={styles.verificationText}>Tu correo se verificó el {verificationDate}</Text>

      <TouchableOpacity 
        style={styles.changeButton}
        onPress={() => navigation.navigate('ChangeEmail')}
      >
        <Text style={styles.changeButtonText}>Cambiar mi correo electrónico</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    marginBottom: 30,
  },
  backButton: {
    position: 'absolute',
    left: -10,
    zIndex: 1,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginLeft: 30,
  },
  email: {
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
  },
  verificationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  changeButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 15,
    marginTop: 20,
  },
  changeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Email;