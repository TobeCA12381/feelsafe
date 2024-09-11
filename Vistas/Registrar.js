import React, { Component } from 'react';
import { Text, StyleSheet, View, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, ImageBackground } from 'react-native';
import CheckBox from 'react-native-checkbox';

export default class Registrar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: false,
    };
  }

  render() {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <View>
              <Text style={styles.title}>FEEL SAFE</Text>
              <Text style={styles.subtitle}>Siéntete seguro</Text>
            </View>
            <Image source={require('../Imagenes/LogoBN.png')} style={styles.logo} />
          </View>

          <ImageBackground source={require('../Imagenes/FondoRegistro.png')} style={styles.backgroundImage}>
            {/* Form */}
            <View style={styles.formContainer}>
              <Text style={styles.header}>Regístrate</Text>
              <TextInput placeholder="Nombre" style={styles.input} placeholderTextColor="#B0B0B0" />
              <TextInput placeholder="Apellidos" style={styles.input} placeholderTextColor="#B0B0B0" />
              <TextInput placeholder="Teléfono" style={styles.input} placeholderTextColor="#B0B0B0" keyboardType="phone-pad" />
              <TextInput placeholder="Correo" style={styles.input} placeholderTextColor="#B0B0B0" keyboardType="email-address" />
              <TextInput placeholder="Fecha de Nacimiento" style={styles.input} placeholderTextColor="#B0B0B0" />

              <View style={styles.checkboxContainer}>
                <CheckBox
                  value={this.state.checked}
                  onValueChange={() => this.setState({ checked: !this.state.checked })}
                />
                <Text style={styles.checkboxText}>He leído y acepto los términos y políticas de privacidad</Text>
              </View>

              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Image source={require('../Imagenes/developerWhite.png')} style={styles.footerIcon} />
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEED01',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 100, // Add padding to account for footer
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Ultra',
    color: 'black',
  },
  subtitle: {
    fontFamily: 'Ultra',
    fontSize: 10,
    color: 'black',
    top:-15,
    left:22,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 20,
    marginHorizontal: 45,
    alignItems: 'center',
    top:-20,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#EAEAEA',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#000',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxText: {
    marginLeft: 10,
    fontSize: 9,
    color: '#000',
    flexShrink: 1,
  },
  button: {
    width: '80%',
    backgroundColor: '#000',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
    backgroundColor: 'transparent',
  },
  footerIcon: {
    width: 80,
    height: 80,
  },
});