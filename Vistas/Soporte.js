import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView} from 'react-native';
import { Appbar } from 'react-native-paper'; // Importamos AppBar de react-native-paper
import { useNavigation } from '@react-navigation/native'; // Para la navegación entre pantallas
import Icon from 'react-native-vector-icons/FontAwesome5'; // Para usar íconos de Font Awesome 5

const Soporte = () => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    navigation.navigate('Asignar Ruta'); // Regresa a la ruta de tu menú principal
  };

  // Función para abrir el chat de WhatsApp
  const openWhatsApp = () => {
    let url = "whatsapp://send?text=Hola, necesito FeelSafe ayuda&phone=+51 964 282 257"; // Cambia el número de teléfono
    Linking.openURL(url)
      .catch(() => {
        alert('Asegúrate de tener WhatsApp instalado.');
      });
  };

  return (
    <View style={styles.container}>
      {/* AppBar */}
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction onPress={handleBackPress} color="#FFF" />
        <Appbar.Content title="Soporte" titleStyle={styles.appBarTitle} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Ícono de persona con audífonos usando FontAwesome5 */}
        <Icon name="handshake-angle" size={100} color="#000" style={styles.supportIcon} />


        {/* Texto de bienvenida */}
        <Text style={styles.welcomeText}>
          "Bienvenido a soporte, para poder ayudarte a resolver tus dudas puedes verificar la opción de preguntas frecuentes o contactarte con nosotros vía WhatsApp."
        </Text>

        {/* Preguntas frecuentes */}
        <View style={styles.faqContainer}>
          <Text style={styles.faqTitle}>Preguntas Frecuentes</Text>
          <Text style={styles.faqItem}>1. ¿Cómo puedo reportar un incidente?</Text>
          <Text style={styles.faqItem}>2. ¿Cómo funciona la app para encontrar rutas seguras?</Text>
          <Text style={styles.faqItem}>3. ¿Qué hacer si la app no encuentra mi ubicación?</Text>
        </View>

        {/* Botón de WhatsApp */}
        <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsApp}>
          <Icon name="whatsapp" size={25} color="#fff" />
          <Text style={styles.whatsappButtonText}>Contactar vía WhatsApp</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  appBar: {
    backgroundColor: '#2b2b2b',
    left: 30
  },
  appBarTitle: {
    color: '#fff',
    left: 15
  },
  content: {
    padding: 20,
    alignItems: 'center', // Para centrar el ícono y el texto
  },
  supportIcon: {
    marginBottom: 20, // Espacio entre el ícono y el texto
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  faqContainer: {
    marginTop: 20,
    width: '100%',
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  faqItem: {
    fontSize: 14,
    marginBottom: 10,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    width: '100%',
  },
  iconImage: {
    width: 50, // Tamaño del icono de WhatsApp
    height: 50,
    marginRight: 10,
  },
  whatsappButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
});
export default Soporte;