import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, TextInput, Alert, TouchableOpacity, Text, Image, Modal, Button } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

// Reemplaza con tu clave API válida
const GOOGLE_MAPS_APIKEY = 'AIzaSyBED0tLYXBuAV-W_Ms8GO2_mAMvCHhOdA8';

export default function MapScreen({ navigation }) {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [originInput, setOriginInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [selectingOrigin, setSelectingOrigin] = useState(true);
  const [travelMode, setTravelMode] = useState('walking');
  const [mapRegion, setMapRegion] = useState({
    latitude: -11.985,
    longitude: -77.005,
    latitudeDelta: 0.007,
    longitudeDelta: 0.007,
  });
  const [routeSafety, setRouteSafety] = useState('safe');
  const [safetyScore, setSafetyScore] = useState(100);
  const [selectedZone, setSelectedZone] = useState(null); 
  const [modalVisible, setModalVisible] = useState(false); 

  const dangerZones = useMemo(() => [
    { id: 1, latitude: -11.984, longitude: -77.007, description: 'Zona peligrosa 1', type: 'acoso', threshold: 0.001, weight: 30 },
    { id: 2, latitude: -11.982, longitude: -77.003, description: 'Zona peligrosa 2', type: 'crimen', threshold: 0.001, weight: 50 },
    { id: 3, latitude: -11.980, longitude: -77.004, description: 'Tienda 1', type: 'drogas', threshold: 0.001, weight: 20 },
  ], []);

  const getMarkerIcon = (type) => {
    switch (type) {
      case 'acoso':
        return require('./assets/ACOSO_Mesa_de_trabajo_1.png');
      case 'crimen':
        return require('./assets/CRIMEN_Mesa_de_trabajo_1.png');
      case 'drogas':
        return require('./assets/DROGAS_Mesa_de_trabajo_1.png');
      default:
        return require('./assets/ROBO_A_CASA_Mesa_de_trabajo_1.png');
    }
  };

  const updateMapRegion = useCallback((coordinate) => {
    setMapRegion((prevRegion) => ({
      ...prevRegion,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    }));
  }, []);

  const handleZoom = (type) => {
    setMapRegion((prevRegion) => ({
      ...prevRegion,
      latitudeDelta: type === 'in' ? prevRegion.latitudeDelta / 2 : prevRegion.latitudeDelta * 2,
      longitudeDelta: type === 'in' ? prevRegion.longitudeDelta / 2 : prevRegion.longitudeDelta * 2,
    }));
  };

  const decodePolyline = (t) => {
    let index = 0, lat = 0, lng = 0;
    const coordinates = [];
    while (index < t.length) {
      let b, shift = 0, result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1 ? ~(result >> 1) : result >> 1) / 1e5;
      lat += dlat;
      shift = result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1 ? ~(result >> 1) : result >> 1) / 1e5;
      lng += dlng;
      coordinates.push({ latitude: lat, longitude: lng });
    }
    return coordinates;
  };

  const checkSafety = useCallback((routeCoordinates) => {
    let totalDangerScore = 0;

    for (let point of routeCoordinates) {
      for (let zone of dangerZones) {
        const distance = Math.sqrt(
          Math.pow(point.latitude - zone.latitude, 2) +
          Math.pow(point.longitude - zone.longitude, 2)
        );

        if (distance < zone.threshold) {
          totalDangerScore += zone.weight;
        }
      }
    }

    if (totalDangerScore > 100) {
      setRouteSafety('dangerous');
      setSafetyScore(40);
    } else if (totalDangerScore > 50) {
      setRouteSafety('moderate');
      setSafetyScore(70);
    } else {
      setRouteSafety('safe');
      setSafetyScore(100);
    }
  }, [dangerZones]);

  const fetchRoute = useCallback(async () => {
    if (!origin || !destination) {
      Alert.alert('Error', 'Debe seleccionar un origen y un destino');
      return;
    }

    try {
      const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=${travelMode}&key=${GOOGLE_MAPS_APIKEY}`;

      const response = await fetch(directionsUrl);
      const data = await response.json();

      if (data.status === "OK" && data.routes.length > 0) {
        const points = data.routes[0].overview_polyline.points;
        const decodedPoints = decodePolyline(points);
        setRouteCoordinates(decodedPoints);

        checkSafety(decodedPoints);
      } else {
        Alert.alert('Error', 'No se encontraron rutas');
        console.log(data);
      }
    } catch (error) {
      console.error('Error al generar la ruta:', error);
      Alert.alert('Error', 'Hubo un problema al generar la ruta');
    }
  }, [origin, destination, travelMode, checkSafety]);

  useEffect(() => {
    if (origin && destination) {
      fetchRoute();
    }
  }, [origin, destination, travelMode, fetchRoute]);

  const handleMarkerPress = (zone) => {
    setSelectedZone(zone);
    setModalVisible(true);
  };

  const handleMarkerDragEnd = useCallback(
    (coordinate, setCoordinate, setInput) => {
      setCoordinate(coordinate);
      updateMapRegion(coordinate);
      reverseGeocodeCoordinate(coordinate, setInput);
    },
    [updateMapRegion]
  );

  const reverseGeocodeCoordinate = useCallback(async (coordinate, setInput) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate.latitude},${coordinate.longitude}&key=${GOOGLE_MAPS_APIKEY}`
      );
      const data = await response.json();
      if (data.results.length > 0) {
        const address = data.results[0].formatted_address;
        setInput(address);
      } else {
        Alert.alert('Error', 'No se pudo encontrar la dirección');
      }
    } catch (error) {
      console.error('Error en la geocodificación:', error);
    }
  }, []);

  const handleInputChange = useCallback(
    async (text, isOrigin) => {
      if (isOrigin) {
        setOriginInput(text);
        const coordinate = await geocodeAddress(text);
        if (coordinate) {
          setOrigin(coordinate);
          updateMapRegion(coordinate);
        }
      } else {
        setDestinationInput(text);
        const coordinate = await geocodeAddress(text);
        if (coordinate) {
          setDestination(coordinate);
          updateMapRegion(coordinate);
        }
      }
    },
    [updateMapRegion]
  );

  const geocodeAddress = useCallback(async (address) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_APIKEY}`
      );
      const data = await response.json();
      if (data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return { latitude: location.lat, longitude: location.lng };
      }
    } catch (error) {
      console.error('Error en la geocodificación de la dirección:', error);
    }
    return null;
  }, []);

  const handleMapPress = useCallback(
    (e) => {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      const coordinate = { latitude, longitude };
      updateMapRegion(coordinate);
      if (selectingOrigin) {
        setOrigin(coordinate);
        reverseGeocodeCoordinate(coordinate, setOriginInput);
      } else {
        setDestination(coordinate);
        reverseGeocodeCoordinate(coordinate, setDestinationInput);
      }
    },
    [selectingOrigin, updateMapRegion, reverseGeocodeCoordinate]
  );

  const getCurrentLocation = useCallback(async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso de ubicación denegado');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    const coordinate = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    setOrigin(coordinate);
    updateMapRegion(coordinate);
    reverseGeocodeCoordinate(coordinate, setOriginInput);
  }, [updateMapRegion, reverseGeocodeCoordinate]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={mapRegion}
        onRegionChangeComplete={setMapRegion}
        onPress={handleMapPress}
      >
        {origin && (
          <Marker
            coordinate={origin}
            title="Origen"
            draggable
            onDragEnd={(e) => handleMarkerDragEnd(e.nativeEvent.coordinate, setOrigin, setOriginInput)}
          />
        )}
        {destination && (
          <Marker
            coordinate={destination}
            title="Destino"
            draggable
            onDragEnd={(e) => handleMarkerDragEnd(e.nativeEvent.coordinate, setDestination, setDestinationInput)}
          />
        )}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={routeSafety === 'dangerous' ? '#FF0000' : routeSafety === 'moderate' ? '#FFA500' : '#00FF00'}
            strokeWidth={3}
          />
        )}
        {dangerZones.map((zone, index) => (
          <Marker
            key={`${zone.type}-${index}`}
            coordinate={{ latitude: zone.latitude, longitude: zone.longitude }}
            title={zone.description}
            onPress={() => handleMarkerPress(zone)}
          >
            <Image
              source={getMarkerIcon(zone.type)}
              style={{ width: 40, height: 40 }}
            />
          </Marker>
        ))}
      </MapView>

      <View style={styles.zoomContainer}>
        <TouchableOpacity onPress={() => handleZoom('in')} style={styles.zoomButton}>
          <Text style={styles.zoomText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleZoom('out')} style={styles.zoomButton}>
          <Text style={styles.zoomText}>-</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.transportOptionsContainer}>
        <TouchableOpacity
          style={[styles.transportOption, travelMode === 'driving' && styles.selectedOption]}
          onPress={() => setTravelMode('driving')}
        >
          <Text>Automóvil</Text>
        </TouchableOpacity>
  
        <TouchableOpacity
          style={[styles.transportOption, travelMode === 'walking' && styles.selectedOption]}
          onPress={() => setTravelMode('walking')}
        >
          <Text>Caminata</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => navigation.openDrawer()}
      >
        <Ionicons name="menu" size={30} color="black" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.gpsButton}
        onPress={getCurrentLocation}
      >
        <Ionicons name="navigate" size={30} color="black" />
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="¿Dónde estamos?"
          value={originInput}
          onChangeText={(text) => handleInputChange(text, true)}
          onFocus={() => setSelectingOrigin(true)}
        />
        <TextInput
          style={styles.input}
          placeholder="¿Adónde vamos?"
          value={destinationInput}
          onChangeText={(text) => handleInputChange(text, false)}
          onFocus={() => setSelectingOrigin(false)}
        />
      </View>

      <View style={styles.safetyIndicator}>
        <Text style={{ color: routeSafety === 'dangerous' ? '#FF0000' : routeSafety === 'moderate' ? '#FFA500' : '#00FF00' }}>
          Nivel de seguridad: {routeSafety === 'dangerous' ? 'Peligroso' : routeSafety === 'moderado' ? 'Moderado' : 'Seguro'}
        </Text>
        <Text>Puntaje de seguridad: {safetyScore}</Text>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          {selectedZone && (
            <>
              <Text style={styles.modalText}>Información de Peligro</Text>
              <Text>Descripción: {selectedZone.description}</Text>
              <Text>Tipo: {selectedZone.type}</Text>
              <Button title="Cerrar" onPress={() => setModalVisible(false)} />
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  map: {
    width: '100%',
    height: '50%',
    marginBottom: 10,
  },
  zoomContainer: {
    position: 'absolute',
    right: 0,
    bottom: 430, // Mantiene la posición que elegiste
    flexDirection: 'column',
    borderRadius: 10, // Bordes más redondeados
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    zIndex: 1,  // Asegura que los botones estén sobre el mapa
    shadowColor: '#000', // Color de la sombra
    shadowOffset: { width: 0, height: 4 }, // Desplazamiento de la sombra
    shadowOpacity: 0.25, // Opacidad de la sombra
    shadowRadius: 4,  // Radio de la sombra

},
zoomButton: {
    backgroundColor: '#FFF', // Fondo blanco
    borderRadius: 50, // Forma redonda
    width: 50, // Ancho del botón
    height: 50, // Altura del botón
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5, // Espacio entre los botones
    shadowColor: '#000', // Sombra para los botones
    shadowOffset: { width: 0, height: 2 }, // Desplazamiento de la sombra
    shadowOpacity: 0.2, // Opacidad de la sombra
    shadowRadius: 3,  // Radio de la sombra
    elevation: 3,  // Elevación para sombra en Android
},
zoomButtonText: {
    fontSize: 24, // Tamaño del texto para que sea visible
    color: '#333', // Color del texto
},

  inputContainer: {
    width: '100%',
    backgroundColor: '#FFF8E1',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    width: '90%',
    height: 50,
    backgroundColor: '#ECECEC',
    color: '#333',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#C5C5C5',
  },
  menuButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 25,
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  gpsButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 25,
    shadowOpacity: 0.3, 
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  transportOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFF8E1',
    paddingVertical: 15,
    marginBottom: 10,
  },
  transportOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  selectedOption: {
    backgroundColor: '#82B1FF',
  },
  safetyIndicator: {
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalView: {
    margin: 50,
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  modalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
