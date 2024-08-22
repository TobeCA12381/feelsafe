import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TextInput, Alert, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location'; // Módulo para la ubicación
import { Ionicons } from '@expo/vector-icons';

const GOOGLE_MAPS_APIKEY = 'AIzaSyBED0tLYXBuAV-W_Ms8GO2_mAMvCHhOdA8'; // Reemplaza con tu clave API válida

export default function MapScreen({ navigation }) {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [originInput, setOriginInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [selectingOrigin, setSelectingOrigin] = useState(true);
  const [travelMode, setTravelMode] = useState('walking'); // Modo de viaje por defecto

  // Función para decodificar la polilínea del resultado de la API de Google Directions
  const decodePolyline = (t) => {
    let index = 0, len = t.length;
    let lat = 0, lng = 0;
    const coordinates = [];
    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1)) / 1e5;
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1)) / 1e5;
      lng += dlng;
      coordinates.push({
        latitude: lat,
        longitude: lng,
      });
    }
    return coordinates;
  };

  // Función para buscar la ruta entre origen y destino
  const fetchRoute = async () => {
    if (!origin || !destination) return;
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=${travelMode}&key=${GOOGLE_MAPS_APIKEY}`
      );
      const data = await response.json();
      if (data.routes.length > 0) {
        const points = data.routes[0].overview_polyline.points;
        const decodedPoints = decodePolyline(points);
        setRouteCoordinates(decodedPoints);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error al generar la ruta', error.message);
    }
  };

  // Función que busca la dirección de acuerdo a las coordenadas proporcionadas
  const reverseGeocodeCoordinate = async (coordinate, setInput, updateRoute = false) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate.latitude},${coordinate.longitude}&key=${GOOGLE_MAPS_APIKEY}`
      );
      const data = await response.json();
      if (data.results.length > 0) {
        const address = data.results[0].formatted_address;
        setInput(address);
        if (updateRoute && destination) {
          fetchRoute(); // Actualiza la ruta después de establecer la ubicación
        }
      } else {
        Alert.alert('No se pudo encontrar la dirección');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = async (text, isOrigin) => {
    if (isOrigin) {
      setOriginInput(text);
      await geocodeAddress(text, setOrigin);
    } else {
      setDestinationInput(text);
      await geocodeAddress(text, setDestination);
    }
  };

  const geocodeAddress = async (address, setCoordinate) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_APIKEY}`
      );
      const data = await response.json();
      if (data.results.length > 0) {
        const location = data.results[0].geometry.location;
        setCoordinate({
          latitude: location.lat,
          longitude: location.lng,
        });
        // Actualizar la ruta si ya hay un destino
        if (destination && setCoordinate === setOrigin) {
          fetchRoute();
        }
        if (origin && setCoordinate === setDestination) {
          fetchRoute();
        }
      } else {
        Alert.alert('No se pudo encontrar la dirección');
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (origin && destination) {
      fetchRoute();
    }
  }, [origin, destination, travelMode]);

  const handleMarkerDragEnd = (coordinate, setCoordinate, setInput) => {
    setCoordinate(coordinate);
    reverseGeocodeCoordinate(coordinate, setInput, true);
  };

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const coordinate = { latitude, longitude };
    if (selectingOrigin) {
      handleMarkerDragEnd(coordinate, setOrigin, setOriginInput);
    } else {
      handleMarkerDragEnd(coordinate, setDestination, setDestinationInput);
    }
  };

  const getCurrentLocation = async () => {
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
    // Actualiza la ubicación del origen y la ruta
    setOrigin(coordinate);
    reverseGeocodeCoordinate(coordinate, setOriginInput, true);

    // Después de establecer el origen, actualiza la ruta si hay un destino definido
    if (destination) {
      fetchRoute();
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -11.985,
          longitude: -77.005,
          latitudeDelta: 0.007,
          longitudeDelta: 0.007,
        }}
        onPress={handleMapPress}
      >
        {origin && (
          <Marker
            coordinate={origin}
            title="Origen"
            draggable
            onDragEnd={(e) => handleMarkerDragEnd(e.nativeEvent.coordinate, setOrigin, setOriginInput)}
            image={require('./assets/sospechoso.png')}
          />
        )}
        {destination && (
          <Marker
            coordinate={destination}
            title="Destino"
            draggable
            onDragEnd={(e) => handleMarkerDragEnd(e.nativeEvent.coordinate, setDestination, setDestinationInput)}
            image={require('./assets/sospechoso.png')}
          />
        )}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#FF0000"
            strokeWidth={3}
          />
        )}
      </MapView>

      <View style={styles.transportOptionsContainer}>
        <TouchableOpacity
          style={[styles.transportOption, travelMode === 'driving' && styles.selectedOption]}
          onPress={() => setTravelMode('driving')}
        >
          <Text>Automóvil</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.transportOption, travelMode === 'transit' && styles.selectedOption]}
          onPress={() => setTravelMode('transit')}
        >
          <Text>Transporte Público</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.transportOption, travelMode === 'walking' && styles.selectedOption]}
          onPress={() => setTravelMode('walking')}
        >
          <Text>Caminata</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.transportOption, travelMode === 'bicycling' && styles.selectedOption]}
          onPress={() => setTravelMode('bicycling')}
        >
          <Text>Bicicleta</Text>
        </TouchableOpacity>
      </View>

      {/* Botón de menú */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => navigation.openDrawer()}
      >
        <Ionicons name="menu" size={30} color="black" />
      </TouchableOpacity>

      {/* Botón de GPS */}
      <TouchableOpacity
        style={styles.gpsButton}
        onPress={getCurrentLocation}
      >
        <Ionicons name="navigate" size={30} color="black" />
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Donde estamos?"
          value={originInput}
          onChangeText={(text) => handleInputChange(text, true)}
          onFocus={() => setSelectingOrigin(true)}
        />
        <TextInput
          style={styles.input}
          placeholder="Adonde vamos?"
          value={destinationInput}
          onChangeText={(text) => handleInputChange(text, false)}
          onFocus={() => setSelectingOrigin(false)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '60%',
  },
  inputContainer: {
    width: '100%',
    height: '15%',
    backgroundColor: '#FFFDC5',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '90%',
    height: 50,
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  menuButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 25,
  },
  gpsButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 25,
  },
  transportOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#FFFDC5',
    paddingVertical: 10,
  },
  transportOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
  },
  selectedOption: {
    backgroundColor: '#8DF683',
  },
});
