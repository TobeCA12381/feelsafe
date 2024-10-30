import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { IconButton, Avatar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

const EditPerfil = () => {
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState('julio');
  const [lastName, setLastName] = useState('cuba');
  const [email, setEmail] = useState('j***@gmail.com');
  const [phoneNumber, setPhoneNumber] = useState('992***072');
  const [imageUri, setImageUri] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Función para obtener las iniciales del usuario de manera segura
  const getInitials = () => {
    return firstName ? firstName.charAt(0).toUpperCase() : 'A';
  };
  const handleBackPress = () => {
    navigation.goBack(); // Regresa a la ruta anterior
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="close" size={24} onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Mi perfil</Text>
      </View>

      <View style={styles.profileSection}>
        <TouchableOpacity onPress={pickImage} style={styles.profilePictureContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.profilePicture} />
          ) : (
            <View style={styles.avatarContainer}>
              <Avatar.Text 
                size={50} 
                label={getInitials()} 
                style={styles.avatar}
              />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={pickImage}>
          <Text style={styles.editPhotoText}>Editar mi foto de perfil</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          value={firstName}
          onChangeText={setFirstName}
          style={styles.input}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Apellido</Text>
        <TextInput
          value={lastName}
          onChangeText={setLastName}
          style={styles.input}
        />
      </View>

      {/*<View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Número de teléfono</Text>
        <Text style={styles.infoText}>
          {phoneNumber || 'Número no disponible'}
        </Text>
      </View>*/}
      <TouchableOpacity 
        style={styles.option}
        onPress={() => navigation.navigate('Email')}
        >
        <View>
            <Text style={styles.infoLabel}>Correo electrónico</Text>
            <View style={styles.emailContainer}>
                <Text style={styles.infoText}>{email || 'Correo no disponible'}</Text>
            </View>
        </View>
        <IconButton icon="chevron-right" size={20} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('ChangePassword')}>
        <Text style={styles.optionText}>Cambiar mi contraseña</Text>
        <IconButton icon="chevron-right" size={20} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Dispositivos')}>
        <Text style={styles.optionText}>Mis dispositivos</Text>
        <IconButton icon="chevron-right" size={20} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('DeleteAccount')} >
        <Text style={styles.optionText}>Eliminar mi cuenta</Text>
        <IconButton icon="chevron-right" size={20} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#1c1c1c',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    color:'#fff',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePictureContainer: {
    marginRight: 15,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarContainer: {
    width: 50,
    height: 50,
  },
  avatar: {
    backgroundColor: '#d3d3d3',
  },
  editPhotoText: {
    fontSize: 16,
    color: '#007AFF',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#888',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    fontSize: 16,
    paddingVertical: 5,
    color:'#fff',
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 14,
    color: '#888',
  },
  infoText: {
    fontSize: 16,
    marginTop: 5,
    color:'#fff',
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unverified: {
    color: 'red',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default EditPerfil;