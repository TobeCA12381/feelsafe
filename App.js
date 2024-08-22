
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const GOOGLE_MAPS_APIKEY = 'YOUR_API_KEY_HERE'; // Reemplaza con tu clave API

export default function App() {
  const [origin, setOrigin] = useState({
    latitude: -11.98485,
    longitude: -77.00489,
  });

  const [destination, setDestination] = useState({
    latitude: -11.98600,
    longitude: -77.00600,
  });

  const [routeCoordinates, setRouteCoordinates] = useState([]);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_APIKEY}`);
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

    fetchRoute();
  }, [origin, destination]);

  const decodePolyline = (t) => {
    // Decode polyline points from Google Maps API
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
        longitude: lng
      });
    }
    return coordinates;
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: (origin.latitude + destination.latitude) / 2,
          longitude: (origin.longitude + destination.longitude) / 2,
          latitudeDelta: 0.007,
          longitudeDelta: 0.007,
        }}
        scrollEnabled={false}      // Disable map scrolling
        zoomEnabled={true}        // Disable zooming
        rotateEnabled={false}      // Disable map rotation
        pitchEnabled={false}       // Disable map tilting
      >
        <Marker
          coordinate={{
            latitude: origin.latitude,
            longitude: origin.longitude,
          }}
          title="Starting Point"
          description="This is the starting point of the route"
        />
        <Marker
          coordinate={{
            latitude: destination.latitude,
            longitude: destination.longitude,
          }}
          title="Destination"
          description="This is the destination of the route"
        />
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#FF0000"      // Color of the route
          strokeWidth={3}            // Width of the route
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
