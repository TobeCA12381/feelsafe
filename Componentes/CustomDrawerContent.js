import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker'; // Importa expo-image-picker para seleccionar imágenes
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Avatar } from 'react-native-paper'; // Usamos react-native-paper para el avatar

const CustomDrawerContent = (props) => {
  const [imageUri, setImageUri] = useState(null); // Estado para la imagen seleccionada

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri); // Establecemos la imagen seleccionada
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
              style={{ width: 50, height: 50, borderRadius: 25 }}
            />
          ) : (
            <Avatar.Text size={50} label="A" style={styles.avatar} />
          )}
        </TouchableOpacity>
        
        {/* Información del usuario */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>Adarsh</Text>
          <Text style={styles.email}>adarshthakur210@gmail.com</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#d3d3d3',
  },
  infoContainer: {
    marginLeft: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: '#555',
  },
});

export default CustomDrawerContent;
