import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper'; // Importamos AppBar de react-native-paper
import { useNavigation } from '@react-navigation/native'; // Para la navegación entre pantallas

const Soporte = () => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    navigation.navigate('Asignar Ruta'); // Regresa a la ruta de tu menú principal
  };
  return (
    <View>
      {/* AppBar */}
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction onPress={handleBackPress} color="#FFF" left={10}/>
        <Appbar.Content title="Soporte" titleStyle={styles.appBarTitle} />
      </Appbar.Header>
    </View>
  );
};
const styles = StyleSheet.create({

  appBar: {
    backgroundColor: '#2b2b2b',
    left: 30
  },
  appBarTitle: {
    color: '#fff',
    left: 15
  },

});
export default Soporte;