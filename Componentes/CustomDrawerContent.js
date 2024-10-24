import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker'; // Para seleccionar imágenes
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Avatar, IconButton } from 'react-native-paper'; // Usamos react-native-paper para el avatar
import { useNavigation } from '@react-navigation/native';

const CustomDrawerContent = (props) => {
  const [imageUri, setImageUri] = useState(null); // Imagen seleccionada
  const { userName } = props; // Asumimos que el nombre del usuario viene en las props
  const navigation = useNavigation(); // Para navegar a la pantalla de edición de perfil

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri); // Establecer la imagen seleccionada
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.profileContainer}>
        {/* Avatar del usuario */}
        <TouchableOpacity onPress={pickImage}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.avatar}
            />
          ) : (
            <Avatar.Text size={50} label="A" style={styles.avatar} />
          )}
        </TouchableOpacity>
        
        {/* Información del usuario */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>Torbe</Text>
          <TouchableOpacity 
            style={styles.editProfile} 
            onPress={() => navigation.navigate('EditPerfil')} // Navegar a EditProfileScreen
          >
            <Text style={styles.editText}>Editar mi perfil</Text>
            <IconButton icon="chevron-right" size={20} style={styles.arrowIcon} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Mostrar las otras opciones del drawer */}
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    padding: 20,
    flexDirection: 'row', // Alineamos en fila (horizontal)
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#d3d3d3',
    width: 50, // Tamaño del avatar para que coincida con la imagen
    height: 50,
    borderRadius: 25,
    marginRight: 15, // Espacio entre el avatar y el texto
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'column', // Columna para el nombre y "Editar mi perfil"
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left', // Alinear a la izquierda
    marginTop:10,
  },
  editProfile: {
    flexDirection: 'row', // Alinear el texto "Editar mi perfil" y la flecha en una fila
    alignItems: 'center',
  },
  editText: {
    fontSize: 14,
    color: '#555',
    marginTop:-15,
  },
  arrowIcon: {
    marginLeft: -5, // Espacio entre el texto y la flecha
    marginTop: -5,
  },
});

export default CustomDrawerContent;
