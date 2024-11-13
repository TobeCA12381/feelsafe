import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  Alert,
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import { Overlay } from "react-native-elements";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const Reportar = () => {
  const [isMenuVisible, setMenuVisible] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [ubicacionActual, setUbicacionActual] = useState(null);
  const navigation = useNavigation();

  const incidentImages = [
    { image: require("../assets/ACOSO_Mesa_de_trabajo_1.png"), label: "Acoso" },
    {
      image: require("../assets/CRIMEN_Mesa_de_trabajo_1.png"),
      label: "Crimen",
    },
    {
      image: require("../assets/DROGAS_Mesa_de_trabajo_1.png"),
      label: "Drogas",
    },
    {
      image: require("../assets/ROBO_A_CASA_Mesa_de_trabajo_1.png"),
      label: "Robo a Casa",
    },
    {
      image: require("../assets/ROBO_A_COMERCIO_Mesa_de_trabajo_1.png"),
      label: "Robo a Comercio",
    },
    {
      image: require("../assets/ROBO_A_PERSONA_Mesa_de_trabajo_1.png"),
      label: "Robo a Persona",
    },
    {
      image: require("../assets/ROBO_A_VEHICULO_Mesa_de_trabajo_1.png"),
      label: "Robo a Vehículo",
    },
    {
      image: require("../assets/SOSPECHOSO_Mesa_de_trabajo_1.png"),
      label: "Sospechoso",
    },
    {
      image: require("../assets/VANDALISMO_Mesa_de_trabajo_1.png"),
      label: "Vandalismo",
    },
  ];

  useEffect(() => {
    const iniciarUbicacion = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Por favor habilita el acceso a la ubicación"
        );
        return;
      }
      const locationWatcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          setUbicacionActual({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );
      return () => locationWatcher.remove();
    };
    iniciarUbicacion();
  }, []);

  const toggleMenu = () => {
    setMenuVisible(!isMenuVisible);
  };

  const handleMapPress = (e) => {
    if (selectedImage) {
      const coordinate = e?.nativeEvent?.coordinate;
      if (!coordinate) {
        Alert.alert("Error", "No se pudo obtener la coordenada del mapa.");
        return;
      }

      setMarkers((prevMarkers) => [
        ...prevMarkers,
        {
          coordinate,
          image: selectedImage.image,
          label: selectedImage.label,
        },
      ]);
      setSelectedImage(null);
      Alert.alert(
        "¡Gracias por reportar!",
        "Feelsafe te ayuda a estar seguro."
      );
    } else {
      Alert.alert(
        "Selecciona un ícono",
        "Primero selecciona un tipo de incidente."
      );
    }
  };

  const handleImageSelect = (image) => {
    setSelectedImage(image);
    setMenuVisible(false);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: ubicacionActual?.latitude || -12.0464,
          longitude: ubicacionActual?.longitude || -77.0428,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        region={
          ubicacionActual && {
            latitude: ubicacionActual.latitude,
            longitude: ubicacionActual.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }
        }
        onPress={handleMapPress}
      >
        {ubicacionActual && (
          <>
            <Circle
              center={ubicacionActual}
              radius={50}
              fillColor="rgba(0, 0, 255, 0.1)"
              strokeColor="rgba(0, 0, 255, 0.5)"
            />
            <Marker coordinate={ubicacionActual}>
              <Image
                source={require("../assets/inicio.png")}
                style={styles.realTimeIcon}
              />
            </Marker>
          </>
        )}
        {markers.map((marker, index) => (
          <>
            <Circle
              key={`circle-${index}`}
              center={marker.coordinate}
              radius={50}
              fillColor="rgba(255, 0, 0, 0.1)"
              strokeColor="rgba(255, 0, 0, 0.5)"
            />
            <Marker key={index} coordinate={marker.coordinate}>
              <Image source={marker.image} style={styles.markerImage} />
            </Marker>
          </>
        ))}
      </MapView>

      {/* Botón de barra lateral */}
      <TouchableOpacity
        style={styles.menuIcon}
        onPress={() => navigation.openDrawer()}
      >
        <Ionicons name="menu" size={30} color="#FFF" />
      </TouchableOpacity>

      {/* Botón de Guardar */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() =>
          Alert.alert(
            "¡Gracias por reportar!",
            "Feelsafe te ayuda a estar seguro."
          )
        }
      >
        <Text style={styles.saveButtonText}>Guardar</Text>
      </TouchableOpacity>

      {/* Botón más */}
      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
        <Text style={styles.menuButtonText}>+</Text>
      </TouchableOpacity>

      <Overlay
        isVisible={isMenuVisible}
        onBackdropPress={toggleMenu}
        overlayStyle={styles.overlay}
      >
        <View style={styles.menuContainer}>
          {incidentImages.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleImageSelect(item)}
            >
              <View style={styles.imageLabelContainer}>
                <Image source={item.image} style={styles.incidentImage} />
                <Text style={styles.imageLabel}>{item.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Overlay>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  menuIcon: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 10,
  },
  saveButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  saveButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  menuButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#000",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  menuButtonText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
  menuContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: 10,
  },
  overlay: {
    borderRadius: 15,
    padding: 15,
    width: "90%",
  },
  incidentImage: {
    width: 60,
    height: 60,
    margin: 5,
    borderRadius: 30,
  },
  imageLabelContainer: {
    alignItems: "center",
    margin: 5,
  },
  imageLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  markerImage: {
    width: 40,
    height: 40,
  },
  realTimeIcon: {
    width: 50,
    height: 50,
  },
});

export default Reportar;
