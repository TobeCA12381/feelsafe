import React from 'react';
import { Text, StyleSheet, View, TextInput, Dimensions, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { useFonts } from 'expo-font';
import Boton from '../Componentes/Boton.js'; // Asegúrate de que la ruta sea correcta
import { useNavigation } from '@react-navigation/native';

const App = () => {
  const [fontsLoaded] = useFonts({
    Ultra: require("../fonts/Poppins-ExtraBold.ttf"),
  });

  const navigation = useNavigation();

  if (!fontsLoaded) return null;

  return (
    <ImageBackground source={require('../Imagenes/mesaTrabajo2.png')} style={styles.fondo}>
      <View style={styles.container}>
        <Image source={require('../Imagenes/LogoBN.png')} style={styles.logo} />

        <Text style={styles.title}>FEEL SAFE</Text>
        <Text style={styles.subtitle}>siéntete seguro</Text>

        <View style={styles.inputContainer}>
          <TextInput placeholder='Ingresa Correo' style={styles.input} />
          <TextInput placeholder='Ingresa contraseña' style={styles.input} secureTextEntry />
        </View>

        <Boton text="Iniciar Sesión" style={styles.botoningresar} onPress={() => navigation.navigate('Mapa')} />

        <View style={styles.socialLoginContainer}>
          <Text style={styles.socialLoginText}>Iniciar con:</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton}>
              <Image source={require('../Imagenes/google.png')} style={styles.socialIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Image source={require('../Imagenes/facebook.png')} style={styles.socialIcon} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
          <Text style={styles.registerText}>¿No tienes cuenta? <Text style={styles.registerLink}>Regístrate</Text></Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton}>
              <Image source={require('../Imagenes/developers.png')} style={styles.socialIcon} />
            </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  fondo: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Ultra',
    fontSize: 36,
    color: 'black',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Ultra',
    fontSize: 16,
    color: 'black',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: '200', // Usando el 100% para responsividad
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#fff',
    marginBottom: 15,
    fontSize: 16,
  },
  botoningresar: {
    backgroundColor: '#000000',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 50,
    alignItems: 'center',
    marginBottom: 20,
  },
  socialLoginContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  socialLoginText: {
    fontSize: 16,
    color: 'black',
    marginBottom: 10,
  },
  socialButtons: {
    flexDirection: 'row',
  },
  socialButton: {
    marginHorizontal: 10,
  },
  socialIcon: {
    width: 40,
    height: 40,
  },
  registerText: {
    fontSize: 14,
    color: 'black',
  },
  registerLink: {
    color: '#00FFFF',
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 30,
    fontSize: 12,
    color: 'black',
  },
  developer: {
    fontWeight: 'bold',
  },
});

export default App;
