import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import { Appbar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome5";

const Soporte = () => {
  const navigation = useNavigation();
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const handleBackPress = () => {
    navigation.navigate("Asignar Ruta");
  };

  // Función para abrir el chat de WhatsApp
  const openWhatsApp = () => {
    let url =
      "whatsapp://send?text=Hola FeelSafe, necesito ayuda&phone=+51 964 282 257";
    Linking.openURL(url).catch(() => {
      alert("Asegúrate de tener WhatsApp instalado.");
    });
  };

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <View style={styles.container}>
      {/* AppBar */}
      <Appbar.Header style={styles.appBar}>
        <Appbar.BackAction onPress={handleBackPress} color="#FFF" />
        <Appbar.Content title="Soporte" titleStyle={styles.appBarTitle} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Ícono de persona con audífonos usando FontAwesome */}
        <Icon
          name="headset"
          size={80}
          color="#000"
          style={styles.supportIcon}
        />

        {/* Texto de bienvenida */}
        <Text style={styles.welcomeText}>
          "Bienvenido a soporte, para poder ayudarte a resolver tus dudas puedes
          verificar la opción de preguntas frecuentes o contactarte con nosotros
          vía WhatsApp."
        </Text>

        {/* Preguntas frecuentes en cuadros */}
        <TouchableOpacity style={styles.card} onPress={() => toggleFAQ(1)}>
          <View style={styles.cardContent}>
            <Icon name="map-marker-alt" size={25} color="#000" />
            <Text style={styles.cardText}>Problema con la ruta</Text>
            <Icon
              name={expandedFAQ === 1 ? "chevron-up" : "chevron-right"}
              size={16}
              color="#000"
            />
          </View>
          {expandedFAQ === 1 && (
            <Text style={styles.faqAnswer}>
              Aquí puedes reportar cualquier problema relacionado con las rutas.
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => toggleFAQ(2)}>
          <View style={styles.cardContent}>
            <Icon name="question-circle" size={25} color="#000" />
            <Text style={styles.cardText}>Consultas más frecuentes</Text>
            <Icon
              name={expandedFAQ === 2 ? "chevron-up" : "chevron-right"}
              size={16}
              color="#000"
            />
          </View>
          {expandedFAQ === 2 && (
            <Text style={styles.faqAnswer}>
              Aquí encontrarás respuestas a las preguntas más comunes.
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => toggleFAQ(3)}>
          <View style={styles.cardContent}>
            <Icon name="bell" size={25} color="#000" />
            <Text style={styles.cardText}>
              Problema con las alertas de notificaciones
            </Text>
            <Icon
              name={expandedFAQ === 3 ? "chevron-up" : "chevron-right"}
              size={16}
              color="#000"
            />
          </View>
          {expandedFAQ === 3 && (
            <Text style={styles.faqAnswer}>
              Puedes gestionar los problemas relacionados con las notificaciones
              desde esta sección.
            </Text>
          )}
        </TouchableOpacity>

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
    flex: 5,
    backgroundColor: "#f4f4f4",
  },
  appBar: {
    backgroundColor: "#2b2b2b",
  },
  appBarTitle: {
    color: "#fff",
  },
  content: {
    padding: 50,
    alignItems: "center",
  },
  supportIcon: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    width: "100%",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    fontWeight: "bold",
  },
  faqAnswer: {
    marginTop: 10,
    color: "#555",
  },
  whatsappButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#25D366",
    padding: 15,
    borderRadius: 30,
    marginTop: 50,
    width: "100%",
  },
  whatsappButtonText: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 20,
  },
});

export default Soporte;
