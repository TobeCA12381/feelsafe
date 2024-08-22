import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TextInput, Button, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location'; // Módulo de ubicación
import { Ionicons } from '@expo/vector-icons';

const GOOGLE_MAPS_APIKEY = 'YOUR_API_KEY_HERE';

export default function MapScreen({ navigation }) {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [originInput, setOriginInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [selectingOrigin, setSelectingOrigin] = useState(true);

  const fetchRoute = async () => {
    if (!origin || !destination) return;
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_APIKEY}`
      );
      const data = await response.json();
      if (data.routes.length > 0) {
        const points = data.routes[0].overview_polyline.points;
        const decodedPoints = decodePolyline(points);
        setRouteCoordinates(decodedPoints);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchRoute();
  }, [origin, destination]);

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

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    if (selectingOrigin) {
      setOrigin({ latitude, longitude });
    } else {
      setDestination({ latitude, longitude });
    }
  };

  const geocodeAddress = async (address, setCoordinate) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${GOOGLE_MAPS_APIKEY}`
      );
      const data = await response.json();
      if (data.results.length > 0) {
        const location = data.results[0].geometry.location;
        setCoordinate({
          latitude: location.lat,
          longitude: location.lng,
        });
      } else {
        Alert.alert('No se pudo encontrar la dirección');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRouteSearch = () => {
    if (originInput) {
      geocodeAddress(originInput, setOrigin);
    }
    if (destinationInput) {
      geocodeAddress(destinationInput, setDestination);
    }
  };

  // Función para obtener la ubicación del usuario
  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso de ubicación denegado');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    setOrigin({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
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
            pinColor="blue"
            draggable
            onDragEnd={(e) => setOrigin(e.nativeEvent.coordinate)}
          />
        )}
        {destination && (
          <Marker
            coordinate={destination}
            title="Destino"
            pinColor="green"
            draggable
            onDragEnd={(e) => setDestination(e.nativeEvent.coordinate)}
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
          onChangeText={(text) => setOriginInput(text)}
          onFocus={() => setSelectingOrigin(true)}
        />
        <TextInput
          style={styles.input}
          placeholder="Adonde vamos?"
          value={destinationInput}
          onChangeText={(text) => setDestinationInput(text)}
          onFocus={() => setSelectingOrigin(false)}
        />
        <Button title="Buscar ruta" onPress={handleRouteSearch} color="#8DF683" />
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
    height: '70%',
  },
  inputContainer: {
    width: '100%',
    height: '30%',
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
});
