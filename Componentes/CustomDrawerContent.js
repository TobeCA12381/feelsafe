import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Avatar, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const CustomDrawerContent = (props) => {
  const [imageUri, setImageUri] = useState(null);
  const { userName } = props;
  const navigation = useNavigation();

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

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      {/* Encabezado gris degradado */}
      <LinearGradient
        colors={['#FEED01', '#434343']} // Degradado de gris claro a gris oscuro
        style={styles.headerContainer}
      >
        <TouchableOpacity onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatar} />
          ) : (
            <Avatar.Text size={50} label="A" style={styles.avatar} />
          )}
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.name}>Torbe</Text>
          <TouchableOpacity 
            style={styles.editProfile} 
            onPress={() => navigation.navigate('EditPerfil')}
          >
            <Text style={styles.editText}>Editar mi perfil</Text>
            <IconButton icon="chevron-right" size={20} style={styles.arrowIcon} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Barra amarilla del menú */}
      <View style={styles.menuContainer}>
        <DrawerItemList {...props} 
        />
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  // Estilo del encabezado degradado
  headerContainer: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderBottomRightRadius: 20,
    top:1,
  },
  avatar: {
    backgroundColor: '#d3d3d3',
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#333',
    marginTop: 10,
  },
  editProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editText: {
    fontSize: 14,
    color: '#fff',
    marginTop: -15,
  },
  arrowIcon: {
    marginLeft: -5,
    marginTop: -5,
  },

  // Estilo para la barra amarilla del menú
  menuContainer: {
    flex: 1,
    backgroundColor: '#aeaea9', 
    paddingTop: 20, 
    paddingHorizontal: 10,
    borderTopRightRadius: 20,  
    borderBottomRightRadius: 30, 
  },
});

export default CustomDrawerContent;
