import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { IconButton } from 'react-native-paper'; // Usaremos esto para el ícono del checkbox

class DeleteAccount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isChecked: false, // Estado para el checkbox
    };
  }

  handleBackPress = () => {
    this.props.navigation.goBack(); // Volver a la pantalla anterior
  };

  handleCheckboxToggle = () => {
    this.setState({ isChecked: !this.state.isChecked }); // Cambia el estado del checkbox
  };

  handleNext = () => {
    if (this.state.isChecked) {
      Alert.alert("Cuenta eliminada", "Tu cuenta ha sido eliminada exitosamente.");
      // Aquí puedes agregar la navegación o acción correspondiente
    } else {
      Alert.alert("Advertencia", "Por favor, acepta la declaración para continuar.");
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <IconButton icon="arrow-left" size={24} onPress={this.handleBackPress} />
          <Text style={styles.title}>Eliminar mi cuenta</Text>
        </View>
        <Text style={styles.question}>
          ¿Deseas eliminar tu cuenta vinculada al correo: j****@gmail.com?
        </Text>
        <Text style={styles.description}>
          Esta acción eliminará tu cuenta de usuario y tus datos de Feelsafe.
        </Text>
        <View style={styles.bulletContainer}>
          <Text style={styles.bulletPoint}>Por ejemplo:</Text>
          <Text style={styles.bulletPoint}>• Al eliminar tu cuenta, tu historial de rutas e información personal se perderán de forma permanente. Esta acción no puede deshacerse. Cualquier solicitud enviada para descargar tu información personal se cancelará si eliminas tu cuenta.</Text>
          <Text style={styles.bulletPoint}> </Text>
          <Text style={styles.bulletPoint}>La solicitud para eliminar tu cuenta tendrá efecto inmediato y es irreversible. Asegúrate de querer eliminar tu cuenta antes de hacerlo.</Text>
        </View>

        <View style={styles.checkboxContainer}>
          <TouchableOpacity onPress={this.handleCheckboxToggle} style={styles.checkbox}>
            <IconButton
              icon={this.state.isChecked ? "checkbox-marked" : "checkbox-blank-outline"}
              size={24}
              color={this.state.isChecked ? "#333" : "#ccc"}
            />
          </TouchableOpacity>
          <Text style={styles.checkboxText}>He leído y estoy de acuerdo con la declaración anterior.</Text>
        </View>

        <TouchableOpacity onPress={this.handleNext}
          style={[styles.button, { backgroundColor: this.state.isChecked ? '#333' : '#ccc' }]}
          disabled={!this.state.isChecked} // Desactiva el botón si el checkbox no está marcado
        >
          <Text style={styles.buttonText}>Siguiente</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 40,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  bulletContainer: {
    marginBottom: 15,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxText: {
    fontSize: 14,
    marginLeft: 8,
    color: '#666',
  },
  button: {
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default DeleteAccount;
