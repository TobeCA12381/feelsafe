import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Appbar, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Importamos Icon para las flechas

const Configuracion = () => {
  const navigation = useNavigation();
  const [isMapEnabled, setIsMapEnabled] = React.useState(true);

  const handleBackPress = () => {
    navigation.navigate('Asignar Ruta'); // Regresa a la ruta de tu menú principal
  };

  const toggleSwitch = () => setIsMapEnabled(previousState => !previousState);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Quieres cerrar la sesión?',
      [
        {
          text: 'Cancelar',
          onPress: () => console.log('Cancelado'),
          style: 'cancel'
        },
        { 
          text: 'Sí', 
          onPress: () => {
            navigation.navigate('Login'); 
          }
        }
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      {/* AppBar */}
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction onPress={handleBackPress} color="#FFF" />
        <Appbar.Content title="Configuración" titleStyle={styles.appBarTitle} />
      </Appbar.Header>

      {/* Opciones de Configuración */}
      <ScrollView>
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('EditPerfil')}>
          <Text style={styles.optionText}>Mi Perfil</Text>
          <Icon name="chevron-right" size={24} color="#888" />
        </TouchableOpacity>
        <Divider />
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Idioma')}>
          <Text style={styles.optionText}>Idioma</Text>
          <Text style={styles.subText}>Idioma predeterminado</Text>
          <Icon name="chevron-right" size={24} color="#888" />
        </TouchableOpacity>
        <Divider />
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Notificaciones</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#aea30b' }}
            thumbColor={isMapEnabled ? '#feed01' : '#434343'}
            onValueChange={toggleSwitch}
            value={isMapEnabled}
          />
        </TouchableOpacity>
        <Divider />
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Privacidad</Text>
          <Icon name="chevron-right" size={24} color="#888" />
        </TouchableOpacity>
        <Divider />
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Términos y Condiciones</Text>
          <Icon name="chevron-right" size={24} color="#888" />
        </TouchableOpacity>
        <Divider />
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Acerca de la aplicación</Text>
          <Icon name="chevron-right" size={24} color="#888" />
        </TouchableOpacity>
        <Divider />
        <TouchableOpacity style={styles.option} onPress={handleLogout}>
          <Text style={styles.optionText}>Cerrar sesión</Text>
          <Icon name="chevron-right" size={24} color="#888" />
        </TouchableOpacity>
        <Divider />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1e', // Fondo oscuro
  },
  appBar: {
    backgroundColor: '#000',
    left: 30
  },
  appBarTitle: {
    color: '#fff',
    left: 15
  },
  option: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#1c1c1e',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  optionText: {
    fontSize: 16,
    color: '#fff',
  },
  subText: {
    fontSize: 12,
    color: '#888',
  },
  optionDelete: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#1c1c1e',
  },
});

export default Configuracion;
