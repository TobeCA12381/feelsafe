import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, TextInput, Alert, TouchableOpacity, Text, Image, Modal } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { AnimatedRegion } from 'react-native-maps';


const GOOGLE_MAPS_APIKEY = 'AIzaSyBbrJUdLQRmOA2lXi0KYXy30Sm8HTk8WvY';
const UMBRAL_PELIGRO_METROS = 100; // Por ejemplo, 100 metros

export default function PantallaMapa({ navigation }) {
  const { colors } = useTheme();
  const [origen, setOrigen] = useState(null);
  const [destino, setDestino] = useState(null);
  const [coordenadasRuta, setCoordenadasRuta] = useState([]);
  const [inputOrigen, setInputOrigen] = useState('');
  const [inputDestino, setInputDestino] = useState('');
  const [seleccionandoOrigen, setSeleccionandoOrigen] = useState(true);
  const [modoViaje, setModoViaje] = useState('walking');
  const [regionMapa, setRegionMapa] = useState({
    latitude: -11.985, longitude: -77.005, latitudeDelta: 0.007, longitudeDelta: 0.007,
  });
  const [seguridadRuta, setSeguridadRuta] = useState('seguro');
  const [puntuacionSeguridad, setPuntuacionSeguridad] = useState(100);
  const [zonaSeleccionada, setZonaSeleccionada] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [rutaAlternativa, setRutaAlternativa] = useState(null);
  const [ubicacionActual, setUbicacionActual] = useState(null);

  const zonasPeligrosas = useMemo(() => [
    { id: 1, latitude: -11.984, longitude: -77.007, descripcion: 'Zona peligrosa 1', tipo: 'ACOSO', umbral: UMBRAL_PELIGRO_METROS, peso: 30 },
    { id: 2, latitude: -11.982, longitude: -77.003, descripcion: 'Zona peligrosa 2', tipo: 'CRIMEN', umbral: UMBRAL_PELIGRO_METROS, peso: 50 },
    { id: 3, latitude: -11.980, longitude: -77.004, descripcion: 'Tienda 1', tipo: 'DROGAS', umbral: UMBRAL_PELIGRO_METROS, peso: 20 },
    { id: 4, latitude: -11.979, longitude: -77.005, descripcion: 'Robo a Casa', tipo: 'ROBO_A_CASA', umbral: UMBRAL_PELIGRO_METROS, peso: 40 },
    { id: 5, latitude: -11.978, longitude: -77.006, descripcion: 'Robo a Comercio', tipo: 'ROBO_A_COMERCIO', umbral: UMBRAL_PELIGRO_METROS, peso: 45 },
    { id: 6, latitude: -11.977, longitude: -77.007, descripcion: 'Robo a Persona', tipo: 'ROBO_A_PERSONA', umbral: UMBRAL_PELIGRO_METROS, peso: 35 },
    { id: 7, latitude: -11.976, longitude: -77.008, descripcion: 'Robo a Vehículo', tipo: 'ROBO_A_VEHICULO', umbral: UMBRAL_PELIGRO_METROS, peso: 30 },
    { id: 8, latitude: -11.975, longitude: -77.009, descripcion: 'Sospechoso', tipo: 'SOSPECHOSO', umbral: UMBRAL_PELIGRO_METROS, peso: 25 },
    { id: 9, latitude: -11.974, longitude: -77.010, descripcion: 'Vandalismo', tipo: 'VANDALISMO', umbral: UMBRAL_PELIGRO_METROS, peso: 30 },
], [UMBRAL_PELIGRO_METROS]);

  
const obtenerIconoMarcador = useCallback((tipo) => {
  const iconos = {
      ACOSO: require('./assets/ACOSO_Mesa_de_trabajo_1.png'),
      CRIMEN: require('./assets/CRIMEN_Mesa_de_trabajo_1.png'),
      DROGAS: require('./assets/DROGAS_Mesa_de_trabajo_1.png'),
      ROBO_A_CASA: require('./assets/ROBO_A_CASA_Mesa_de_trabajo_1.png'),
      ROBO_A_COMERCIO: require('./assets/ROBO_A_COMERCIO_Mesa_de_trabajo_1.png'),
      ROBO_A_PERSONA: require('./assets/ROBO_A_PERSONA_Mesa_de_trabajo_1.png'),
      ROBO_A_VEHICULO: require('./assets/ROBO_A_VEHICULO_Mesa_de_trabajo_1.png'),
      SOSPECHOSO: require('./assets/SOSPECHOSO_Mesa_de_trabajo_1.png'),
      VANDALISMO: require('./assets/VANDALISMO_Mesa_de_trabajo_1.png'),
  };
  return iconos[tipo] || require('./assets/VANDALISMO_Mesa_de_trabajo_1.png');
}, []);



  const actualizarRegionMapa = useCallback((coordenada) => {
    setRegionMapa(prevRegion => ({
      ...prevRegion,
      latitude: coordenada.latitude,
      longitude: coordenada.longitude,
    }));
  }, []);

  const calcularDistancia = useCallback((punto1, punto2) => {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = punto1.latitude * Math.PI / 180;
    const φ2 = punto2.latitude * Math.PI / 180;
    const Δφ = (punto2.latitude - punto1.latitude) * Math.PI / 180;
    const Δλ = (punto2.longitude - punto1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distancia = R * c; // en metros
    return distancia;
}, []);

const renderZonasPeligrosas = useMemo(() => {
  return zonasPeligrosas.map((zona) => (
    <Marker
    key={zona.id} // `key` debe ser estable y única
    coordinate={{ latitude: zona.latitude, longitude: zona.longitude }}
    title={zona.descripcion}
    onPress={() => manejarPresionMarcador(zona)}
>
    <Image
        source={obtenerIconoMarcador(zona.tipo)}
        style={{ width: 40, height: 40 }}
    />
</Marker>

  ));
}, [zonasPeligrosas, manejarPresionMarcador]);

const verificarSeguridadLogaritmica = useCallback((coordenadasRuta, zonasPeligrosas) => {
  let puntuacionPeligroTotal = 0;
  let zonasPeligrosasUnicas = new Set();

  coordenadasRuta.forEach((punto) => {
      zonasPeligrosas.forEach(zona => {
          const distancia = calcularDistancia(punto, zona);
          if (distancia < zona.umbral) {
              if (!zonasPeligrosasUnicas.has(zona.id)) {
                  puntuacionPeligroTotal += zona.peso;
                  zonasPeligrosasUnicas.add(zona.id);
              }
          }
      });
  });

  console.log(`Puntuación de peligro total: ${puntuacionPeligroTotal}`);
  
  const porcentajeSeguridad = Math.max(0, 100 - 100 * (Math.log(puntuacionPeligroTotal + 1) / Math.log(zonasPeligrosas.length * 50 + 1)));
  console.log(`Porcentaje de seguridad calculado (Logarítmico): ${porcentajeSeguridad}`);
  
  setPuntuacionSeguridad(Math.round(porcentajeSeguridad));

  if (porcentajeSeguridad < 50) {
      setSeguridadRuta('peligroso');
  } else if (porcentajeSeguridad < 75) {
      setSeguridadRuta('moderado');
  } else {
      setSeguridadRuta('seguro');
  }

  return Array.from(zonasPeligrosasUnicas);
}, [calcularDistancia]);



  const ajustarRegionMapa = () => {
    if (coordenadasRuta.length > 0) {
        const latitudes = coordenadasRuta.map(point => point.latitude);
        const longitudes = coordenadasRuta.map(point => point.longitude);
        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLon = Math.min(...longitudes);
        const maxLon = Math.max(...longitudes);

        setRegionMapa({
            latitude: (minLat + maxLat) / 2,
            longitude: (minLon + maxLon) / 2,
            latitudeDelta: maxLat - minLat + 0.005,
            longitudeDelta: maxLon - minLon + 0.005,
        });
    }
};

// Uso en el código
useEffect(() => {
  if (origen && destino) {
      obtenerRuta();
  }
}, [origen, destino]);

const obtenerRuta = useCallback(async () => {
  if (!origen || !destino) {
      Alert.alert('Error', 'Debe seleccionar un origen y un destino');
      return;
  }

  try {
      const urlDirecciones = `https://maps.googleapis.com/maps/api/directions/json?origin=${origen.latitude},${origen.longitude}&destination=${destino.latitude},${destino.longitude}&mode=${modoViaje}&key=${GOOGLE_MAPS_APIKEY}`;
      const respuesta = await fetch(urlDirecciones);
      const datos = await respuesta.json();

      if (datos.status === "OK" && datos.routes.length > 0) {
          const ruta = datos.routes[0];
          const puntosDecodificados = decodificarPolilinea(ruta.overview_polyline.points);
          setCoordenadasRuta(puntosDecodificados);

          const puntosPeligrosos = verificarSeguridadLogaritmica(puntosDecodificados, zonasPeligrosas);

          if (puntosPeligrosos.length > 0) {
              Alert.alert('Advertencia', `La ruta pasa cerca de ${puntosPeligrosos.length} zonas peligrosas.`);
          }
      } else {
          Alert.alert('Error', 'No se encontraron rutas. Por favor, verifique las ubicaciones e intente de nuevo.');
      }
  } catch (error) {
      console.error('Error al obtener la ruta:', error);
      Alert.alert('Error', 'Hubo un problema al generar la ruta. Por favor, intente de nuevo.');
  }
}, [origen, destino, verificarSeguridadLogaritmica]);

  
 
  useEffect(() => {
    if (origen && destino) {
      obtenerRuta();
    }
  }, [origen, destino, modoViaje, obtenerRuta]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (ubicacionActual) {
        const zonaCercana = zonasPeligrosas.find(zona => 
          calcularDistancia(ubicacionActual, zona) < zona.umbral
        );
        if (zonaCercana) {
          Alert.alert('Advertencia', `Estás entrando en una zona peligrosa: ${zonaCercana.descripcion}`);
        }
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [ubicacionActual, zonasPeligrosas, calcularDistancia]);

  const obtenerUbicacionActual = useCallback(async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso de ubicación denegado');
      return;
    }
    let ubicacion = await Location.getCurrentPositionAsync({});
    const coordenada = {
      latitude: ubicacion.coords.latitude,
      longitude: ubicacion.coords.longitude,
    };
    setUbicacionActual(coordenada);
    setOrigen(coordenada);
    actualizarRegionMapa(coordenada);
    geocodificarInversoCoordenada(coordenada, setInputOrigen);
  }, [actualizarRegionMapa, geocodificarInversoCoordenada]);

  const decodificarPolilinea = useCallback((t) => {
    let index = 0, lat = 0, lng = 0;
    const coordenadas = [];
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
      coordenadas.push({ latitude: lat, longitude: lng });
    }
    return coordenadas;
  }, []);
  const manejarPresionMarcador = useCallback((zona) => {
    setZonaSeleccionada(zona);
    setModalVisible(true);
  }, []);

  const manejarFinArrastreMarcador = useCallback((coordenada, setCoordenada, setInput) => {
    setCoordenada(coordenada);
    actualizarRegionMapa(coordenada);
    geocodificarInversoCoordenada(coordenada, setInput);
  }, [actualizarRegionMapa, geocodificarInversoCoordenada]);

  const geocodificarInversoCoordenada = useCallback(async (coordenada, setInput) => {
    try {
      const respuesta = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordenada.latitude},${coordenada.longitude}&key=${GOOGLE_MAPS_APIKEY}`
      );
      const datos = await respuesta.json();
      if (datos.results.length > 0) {
        const direccion = datos.results[0].formatted_address;
        setInput(direccion);
      } else {
        Alert.alert('Error', 'No se pudo encontrar la dirección');
      }
    } catch (error) {
      console.error('Error en la geocodificación inversa:', error);
    }
  }, []);

  const manejarCambioInput = useCallback(async (texto, esOrigen) => {
    if (esOrigen) {
      setInputOrigen(texto);
      const coordenada = await geocodificarDireccion(texto);
      if (coordenada) {
        setOrigen(coordenada);
        actualizarRegionMapa(coordenada);
      }
    } else {
      setInputDestino(texto);
      const coordenada = await geocodificarDireccion(texto);
      if (coordenada) {
        setDestino(coordenada);
        actualizarRegionMapa(coordenada);
      }
    }
  }, [actualizarRegionMapa, geocodificarDireccion]);

  const geocodificarDireccion = useCallback(async (direccion) => {
    if (!direccion) {
        Alert.alert('Error', 'Por favor, ingrese una dirección válida.');
        return null;
    }

    try {
        const respuesta = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(direccion)}&key=${GOOGLE_MAPS_APIKEY}`
        );
        const datos = await respuesta.json();

        if (datos.status === 'OK' && datos.results.length > 0) {
            const ubicacion = datos.results[0].geometry.location;
            return { latitude: ubicacion.lat, longitude: ubicacion.lng };
        } else {
            Alert.alert('Error', 'No se pudo geocodificar la dirección. Verifique la dirección e intente nuevamente.');
            return null;
        }
    } catch (error) {
        console.error('Error en la geocodificación de la dirección:', error);
        Alert.alert('Error', 'Hubo un problema al procesar la dirección. Intente nuevamente más tarde.');
        return null;
    }
}, []);


  const manejarPresionMapa = useCallback((e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const coordenada = { latitude, longitude };
    actualizarRegionMapa(coordenada);
    if (seleccionandoOrigen) {
      setOrigen(coordenada);
      geocodificarInversoCoordenada(coordenada, setInputOrigen);
    } else {
      setDestino(coordenada);
      geocodificarInversoCoordenada(coordenada, setInputDestino);
    }
  }, [seleccionandoOrigen, actualizarRegionMapa, geocodificarInversoCoordenada]);

  const manejarZoom = useCallback((tipo) => {
    setRegionMapa(prevRegion => ({
      ...prevRegion,
      latitudeDelta: tipo === 'in' ? prevRegion.latitudeDelta / 2 : prevRegion.latitudeDelta * 2,
      longitudeDelta: tipo === 'in' ? prevRegion.longitudeDelta / 2 : prevRegion.longitudeDelta * 2,
    }));
  }, []);

  return (
    <View style={estilos.contenedor}>
      <MapView
        style={estilos.mapa}
        region={regionMapa}
        onRegionChangeComplete={setRegionMapa}
        onPress={manejarPresionMapa}
      >
        {renderZonasPeligrosas}
        {origen && (
          <Marker
            coordinate={origen}
            title="Origen"
            draggable
            onDragEnd={(e) => manejarFinArrastreMarcador(e.nativeEvent.coordinate, setOrigen, setInputOrigen)}
          />
        )}
        {destino && (
          <Marker
            coordinate={destino}
            title="Destino"
            draggable
            onDragEnd={(e) => manejarFinArrastreMarcador(e.nativeEvent.coordinate, setDestino, setInputDestino)}
          />
        )}
        {coordenadasRuta.length > 0 && (
        <Polyline
        coordinates={coordenadasRuta} // `coordenadasRuta` contiene los puntos decodificados
        strokeColor={seguridadRuta === 'peligroso' ? '#FF0000' : seguridadRuta === 'moderado' ? '#FFA500' : '#00FF00'}
        strokeWidth={3}
    />
    
        )}
        {rutaAlternativa && (
          <Polyline
            coordinates={rutaAlternativa}
            strokeColor="#0000FF"
            strokeWidth={3}
          />
        )}
        {zonasPeligrosas.map((zona) => (
    <Marker
        key={zona.id}
        coordinate={{ latitude: zona.latitude, longitude: zona.longitude }}
        title={zona.descripcion}
        onPress={() => manejarPresionMarcador(zona)}
    >
        <Image
            source={obtenerIconoMarcador(zona.tipo)}
            style={{ width: 40, height: 40 }}
        />
    </Marker>
))}

      </MapView>

      <View style={estilos.contenedorZoom}>
        <TouchableOpacity onPress={() => manejarZoom('in')} style={estilos.botonZoom}>
          <Text style={estilos.textoBotonZoom}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => manejarZoom('out')} style={estilos.botonZoom}>
          <Text style={estilos.textoBotonZoom}>-</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
    accessible={true}
    accessibilityLabel="Botón de menú"
    style={estilos.botonMenu}
    onPress={() => navigation.openDrawer()}
>
    <Ionicons name="menu" size={30} color={colors.text} />
</TouchableOpacity>


      <TouchableOpacity
        style={estilos.botonGPS}
        onPress={obtenerUbicacionActual}
      >
        <Ionicons name="navigate" size={30} color={colors.text} />
      </TouchableOpacity>

      <View style={estilos.contenedorInput}>
        <TextInput
          style={[estilos.input, { color: colors.text }]}
          placeholder="¿Dónde estamos?"
          placeholderTextColor={colors.text}
          value={inputOrigen}
          onChangeText={(texto) => manejarCambioInput(texto, true)}
          onFocus={() => setSeleccionandoOrigen(true)}
        />
        <TextInput
          style={[estilos.input, { color: colors.text }]}
          placeholder="¿Adónde vamos?"
          placeholderTextColor={colors.text}
          value={inputDestino}
          onChangeText={(texto) => manejarCambioInput(texto, false)}
          onFocus={() => setSeleccionandoOrigen(false)}
        />
      </View>

      <View style={estilos.indicadorSeguridad}>
        <Text style={{ color: seguridadRuta === 'peligroso' ? '#FF0000' : seguridadRuta === 'moderado' ? '#FFA500' : '#00FF00' }}>
          Nivel de seguridad: {seguridadRuta}
        </Text>
        <Text>Puntuación de seguridad: {puntuacionSeguridad}</Text>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={estilos.vistaModal}>
          {zonaSeleccionada && (
            <>
              <Text style={estilos.textoModal}>Información de Peligro</Text>
              <Text>Descripción: {zonaSeleccionada.descripcion}</Text>
              <Text>Tipo: {zonaSeleccionada.tipo}</Text>
              <TouchableOpacity
                style={estilos.botonCerrar}
                onPress={() => setModalVisible(false)}
              >
                <Text style={estilos.textoBotonCerrar}>Cerrar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}





const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  mapa: {
    width: '100%',
    height: '50%',
    marginBottom: 10,
  },
  contenedorZoom: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 5,
  },
  botonZoom: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  textoBotonZoom: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  contenedorInput: {
    padding: 10,
    backgroundColor: 'white',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  botonMenu: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  botonGPS: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  indicadorSeguridad: {
    padding: 10,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  vistaModal: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  textoModal: {
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  botonCerrar: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  textoBotonCerrar: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});