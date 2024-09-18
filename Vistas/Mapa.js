import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Dimensions, StatusBar, StyleSheet, View, TextInput, TouchableOpacity, Text, Image, Modal, ActivityIndicator, ScrollView, Share, Platform, Alert, SafeAreaView } from 'react-native';
import MapView, { Marker, Polyline, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useNavigation } from '@react-navigation/native';
import { GOOGLE_MAPS_APIKEY } from '@env';
import { calcularDistancia, decodificarPolilinea, obtenerIconoMarcador, geocodificarInversoCoordenada, geocodificarDireccion, colorearRuta } from '../utils/mapUtils';
import { verificarSeguridadLogaritmica } from '../utils/routeSafety';
import ViewShot from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system'; // Importamos expo-file-system para manejar archivos
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

// Obtiene las dimensiones de la pantalla
const { width, height } = Dimensions.get('window');
const UMBRAL_PELIGRO_METROS = 100;

export default function PantallaMapa() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [origen, setOrigen] = useState(null);
  const [destino, setDestino] = useState(null);
  const [coordenadasRuta, setCoordenadasRuta] = useState([]);
  const [inputOrigen, setInputOrigen] = useState('');
  const [inputDestino, setInputDestino] = useState('');
  const [seleccionandoOrigen, setSeleccionandoOrigen] = useState(true);
  const [modoViaje, setModoViaje] = useState('walking');
  const [regionMapa, setRegionMapa] = useState({
    latitude: -11.985,
    longitude: -77.005,
    latitudeDelta: 0.007,
    longitudeDelta: 0.007,
  });
  const [seguridadRuta, setSeguridadRuta] = useState('seguro');
  const [puntuacionSeguridad, setPuntuacionSeguridad] = useState(100);
  const [zonaSeleccionada, setZonaSeleccionada] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [ubicacionActual, setUbicacionActual] = useState(null);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);
  const [mostrarIconoAlerta, setMostrarIconoAlerta] = useState(false);
  const [zonasPeligrosasEncontradas, setZonasPeligrosasEncontradas] = useState([]);
  const [modalPeligrosVisible, setModalPeligrosVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const drawerRef = useRef(null);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const { width, height } = Dimensions.get('window');
  const [coordenadasRutaAlternativas, setCoordenadasRutaAlternativas] = useState([]);
  // Función para abrir el modal
  const abrirModalPeligros = useCallback(() => {
    console.log('Abriendo modal de peligros');
    setModalPeligrosVisible(true);
  }, []);

  const [compartirModalVisible, setCompartirModalVisible] = useState(false);
  const mapShotRef = useRef(null);

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
  ], []);



  useEffect(() => {
    // Inicia la verificación constante del estado del GPS
    startCheckingGpsStatus();
    return () => clearInterval(gpsCheckInterval); // Limpia el intervalo cuando el componente se desmonte
  }, []);

  // Variable para almacenar el intervalo de verificación
  let gpsCheckInterval = null;

  // Función para iniciar la verificación del estado del GPS
  const startCheckingGpsStatus = () => {
    gpsCheckInterval = setInterval(() => {
      checkGpsStatus();
    }, 5000); // Verifica cada 5 segundos
  };

  const checkGpsStatus = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setGpsEnabled(false);
      return;
    }
    let enabled = await Location.hasServicesEnabledAsync();
    setGpsEnabled(enabled);
  };

  const handleEnableLocation = () => {
    Alert.alert(
      "Habilitar ubicación",
      "Por favor, habilita los servicios de ubicación en la configuración de tu dispositivo para usar esta función.",
      [
        { text: "OK", onPress: () => checkGpsStatus() }
      ]
    );
  };


  const actualizarRegionMapa = useCallback((coordenada) => {
    setRegionMapa(prevRegion => ({
      ...prevRegion,
      latitude: coordenada.latitude,
      longitude: coordenada.longitude,
    }));
  }, []);

  useEffect(() => {
    if (origen && destino) {
      ajustarRutaSegura();
    }
  }, [origen, destino, modoViaje, ajustarRutaSegura]);
  

  const obtenerRuta = useCallback(async () => {
    if (!origen || !destino) {
        Alert.alert('Error', 'Debe seleccionar un origen y un destino');
        return;
    }

    setLoading(true);

    try {
        const urlDirecciones = `https://maps.googleapis.com/maps/api/directions/json?origin=${origen.latitude},${origen.longitude}&destination=${destino.latitude},${destino.longitude}&mode=${modoViaje}&key=${GOOGLE_MAPS_APIKEY}`;
        const respuesta = await fetch(urlDirecciones);
        const datos = await respuesta.json();

        if (datos.status === "OK" && datos.routes.length > 0) {
            const ruta = datos.routes[0];

            if (!ruta.overview_polyline || !ruta.overview_polyline.points) {
                throw new Error('No se encontró una polilínea válida en la respuesta de la API.');
            }

            const puntosDecodificados = decodificarPolilinea(ruta.overview_polyline.points);

            if (!puntosDecodificados || puntosDecodificados.length === 0) {
                throw new Error('Puntos decodificados inválidos.');
            }

            // Llamar a ajustarRutaSegura con los puntos decodificados
            await ajustarRutaSegura(puntosDecodificados);

            const { puntosPeligrosos, puntuacion } = verificarSeguridadLogaritmica(puntosDecodificados, zonasPeligrosas);

            setPuntuacionSeguridad(puntuacion);
            setSeguridadRuta(puntuacion < 50 ? 'peligroso' : puntuacion < 75 ? 'moderado' : 'seguro');

            console.log("Puntos peligrosos encontrados:", JSON.stringify(puntosPeligrosos, null, 2));

            if (puntosPeligrosos.length > 0) {
                setZonasPeligrosasEncontradas(puntosPeligrosos);
                setMostrarIconoAlerta(true);
            } else {
                setZonasPeligrosasEncontradas([]);
                setMostrarIconoAlerta(false);
            }
        } else {
            throw new Error('No se encontraron rutas. Por favor, verifique las ubicaciones e intente de nuevo.');
        }
    } catch (error) {
        console.error('Error al obtener la ruta:', error);
        Alert.alert('Error', `Hubo un problema al generar la ruta: ${error.message}`);
    } finally {
        setLoading(false);
    }
}, [origen, destino, modoViaje, zonasPeligrosas, ajustarRutaSegura]);

  
const ajustarRutaSegura = useCallback(async (puntosDecodificados) => {
  if (!puntosDecodificados || puntosDecodificados.length < 2) {
      console.error('Puntos decodificados inválidos:', puntosDecodificados);
      return;
  }

  // Limpia las rutas alternativas antes de dibujar nuevas
  setCoordenadasRutaAlternativas([]);

  const segmentos = colorearRuta(puntosDecodificados, zonasPeligrosas);
  const nuevaRuta = [];

  for (let i = 0; i < segmentos.length; i++) {
      const segmento = segmentos[i];
      
      if (segmento.color === '#00FF00') {
          // Segmento Verde: Mantener la ruta
          nuevaRuta.push(...segmento.coordenadas);
      } else {
          // Segmento Naranja o Rojo: Buscar alternativas
          const puntoInicio = segmento.coordenadas[0];
          const alternativas = await buscarRutasAlternativas(puntoInicio, destino);

          if (alternativas.length > 0) {
              const mejorAlternativa = alternativas[0];

              if (segmento.color === '#FF0000' && mejorAlternativa.nivelSeguridad > 50) {
                  // Segmento Rojo: Reemplazar con la alternativa más segura
                  nuevaRuta.push(...mejorAlternativa.coordenadas);
                  i = segmentos.length; // Finalizar el bucle ya que hemos encontrado una alternativa segura
              } else if (segmento.color === '#FFA500') {
                  // Segmento Naranja: Mostrar alternativas con líneas discontinuas
                  if (!esRutaIgualAPrincipal(mejorAlternativa.coordenadas, segmento.coordenadas)) {
                      setCoordenadasRutaAlternativas((prevAlternativas) => [
                          ...prevAlternativas,
                          { coordenadas: mejorAlternativa.coordenadas, color: '#FFA500', tipo: 'discontinua' },
                      ]);
                  }
                  // Continuar con la ruta principal
                  nuevaRuta.push(...segmento.coordenadas);
              }
          } else {
              // No se encontró alternativa, continuar con la ruta original
              nuevaRuta.push(...segmento.coordenadas);
          }
      }
  }

  setCoordenadasRuta(nuevaRuta);
  ajustarVistaRuta(nuevaRuta);
}, [zonasPeligrosas, destino, buscarRutasAlternativas, ajustarVistaRuta]);


const buscarRutasAlternativas = async (puntoInicio, destino) => {
  try {
      const urlAlternativa = `https://maps.googleapis.com/maps/api/directions/json?origin=${puntoInicio.latitude},${puntoInicio.longitude}&destination=${destino.latitude},${destino.longitude}&mode=${modoViaje}&alternatives=true&key=${GOOGLE_MAPS_APIKEY}`;
      
      const respuesta = await fetch(urlAlternativa);
      const datos = await respuesta.json();

      if (datos.status === "OK" && datos.routes.length > 0) {
          const rutasAlternativas = [];

          for (const ruta of datos.routes) {
              const puntosDecodificados = decodificarPolilinea(ruta.overview_polyline.points);
              
              // Verificar si la ruta alternativa es igual al segmento principal
              if (!esRutaIgualAPrincipal(puntosDecodificados, coordenadasRuta)) {
                  rutasAlternativas.push({
                      coordenadas: puntosDecodificados,
                      nivelSeguridad: verificarSeguridadLogaritmica(puntosDecodificados, zonasPeligrosas).puntuacion,
                  });
              }
          }

          return rutasAlternativas;
      } else {
          throw new Error('No se encontró una ruta alternativa');
      }
  } catch (error) {
      console.error('Error al buscar rutas alternativas:', error);
      Alert.alert('Error', 'No se pudo generar una ruta alternativa. ' + error.message);
      return [];
  }
};

const esRutaIgualAPrincipal = (rutaAlternativa, segmentoPrincipal) => {
  if (rutaAlternativa.length !== segmentoPrincipal.length) {
      return false;
  }

  return rutaAlternativa.every((punto, index) => {
      const puntoPrincipal = segmentoPrincipal[index];
      return (
          punto.latitude === puntoPrincipal.latitude &&
          punto.longitude === puntoPrincipal.longitude
      );
  });
};





  const agruparZonasPorTipo = useCallback((zonas) => {
    return zonas.reduce((acumulador, zona) => {
      const tipo = zona.tipo || 'DESCONOCIDO';
      acumulador[tipo] = (acumulador[tipo] || 0) + 1;
      return acumulador;
    }, {});
  }, []);

  const ajustarVistaRuta = useCallback((coordenadas) => {
    if (mapRef.current && coordenadas.length > 0) {
      mapRef.current.fitToCoordinates(coordenadas, {
        edgePadding: { top: 30, right: 30, bottom: 30, left: 30 },  // Reducir el padding para acercar más
        animated: true,
      });
    }
  }, []);

  const abrirMenuLateral = useCallback(() => {
    navigation.openDrawer();
  }, [navigation]);



  useEffect(() => {
    if (origen && destino) {
      obtenerRuta();
    }
  }, [origen, destino, modoViaje, obtenerRuta]);

  const abrirModalCompartir = useCallback(() => {
    setCompartirModalVisible(true);
  }, []);

  const compartirEnlaceApp = useCallback(async () => {
    try {
      await Share.share({
        message: 'Descarga nuestra app de rutas seguras: [Enlace a tu app]',
      });
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al compartir el enlace de la app');
    }
  }, []);

  const compartirEstadisticas = useCallback(async () => {
    try {
      await Share.share({
        message: `Estadísticas de seguridad:\nNivel de seguridad: ${seguridadRuta}\nPuntuación: ${puntuacionSeguridad}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al compartir las estadísticas');
    }
  }, [seguridadRuta, puntuacionSeguridad]);

  const compartirScreenshot = useCallback(async () => {
    if (mapShotRef.current) {
      try {
        console.log("Iniciando captura de screenshot...");
        const uri = await mapShotRef.current.capture();
        console.log("Screenshot capturado:", uri);

        const fileName = `ruta_segura_${Date.now()}.jpg`;
        const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

        // Copiar el archivo al directorio de caché
        await FileSystem.copyAsync({
          from: uri,
          to: fileUri
        });

        console.log("Archivo copiado a:", fileUri);

        // Verificar si el archivo existe
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (!fileInfo.exists) {
          console.error("El archivo no existe:", fileUri);
          Alert.alert('Error', 'No se pudo generar el screenshot');
          return;
        }

        console.log("Iniciando compartir con URI:", fileUri);

        // Verificar si compartir está disponible
        if (!(await Sharing.isAvailableAsync())) {
          // Si compartir no está disponible, intentamos guardar en la galería
          const { status } = await MediaLibrary.requestPermissionsAsync();
          if (status === 'granted') {
            await MediaLibrary.saveToLibraryAsync(fileUri);
            Alert.alert('Éxito', 'La imagen se ha guardado en tu galería');
          } else {
            Alert.alert('Error', 'No se pudo guardar la imagen. Permisos denegados.');
          }
          return;
        }

        // Compartir el archivo
        await Sharing.shareAsync(fileUri, {
          mimeType: 'image/jpeg',
          dialogTitle: 'Compartir Ruta Segura',
        });

        // Opcional: Eliminar el archivo temporal después de compartir
        await FileSystem.deleteAsync(fileUri, { idempotent: true });

      } catch (error) {
        console.error("Error detallado al capturar o compartir screenshot:", error);
        Alert.alert('Error', 'No se pudo compartir el screenshot de la ruta: ' + error.message);
      }
    } else {
      console.error("mapShotRef no está disponible");
      Alert.alert('Error', 'No se pudo acceder a la referencia del mapa');
    }
  }, []);

  const obtenerUbicacionActual = useCallback(async () => {
    setLoading(true);

    try {
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
    } catch (error) {
      console.error('Error al obtener la ubicación actual:', error);
    } finally {
      setLoading(false);
    }
  }, [actualizarRegionMapa, geocodificarInversoCoordenada]);

  const manejarPresionMarcador = useCallback((zona) => {
    setZonaSeleccionada(zona);
    setModalVisible(true);
  }, []);

  const manejarFinArrastreMarcador = useCallback((coordenada, setCoordenada, setInput) => {
    setCoordenada(coordenada);
    actualizarRegionMapa(coordenada);
    geocodificarInversoCoordenada(coordenada, setInput);
  }, [actualizarRegionMapa, geocodificarInversoCoordenada]);

  const manejarCambioInput = useCallback(async (texto, esOrigen) => {
    setLoading(true);

    try {
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
    } catch (error) {
      console.error('Error al manejar el cambio de input:', error);
    } finally {
      setLoading(false);
    }
  }, [actualizarRegionMapa, geocodificarDireccion]);

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



  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* StatusBar to control the appearance of the status bar */}
      <StatusBar barStyle="light-content" backgroundColor="#333" />

      {/* Top bar overlay */}
      <View style={styles.topBar} />

        <ViewShot ref={mapShotRef} options={{ format: "jpg", quality: 0.8, result: "tmpfile" }} style={StyleSheet.absoluteFillObject}>
        <View style={styles.contenedor}>
          {/* Notificación para habilitar GPS */}
          {!gpsEnabled && (
            <TouchableOpacity style={styles.gpsNotification} onPress={handleEnableLocation}>
              <Text style={styles.gpsNotificationText}>
                No podemos encontrarte en el mapa. Haz clic aquí para acceder a tu ubicación.
              </Text>
            </TouchableOpacity>
          )}
          
          <MapView
            ref={mapRef}
            style={styles.mapa}
            region={regionMapa}
            onRegionChangeComplete={setRegionMapa}
            onPress={manejarPresionMapa}
          >
           {coordenadasRuta.map((segmento, index) => {
    if (!segmento || !Array.isArray(segmento.coordenadas)) {
        console.error('Segmento inválido o sin coordenadas:', segmento);
        return null; // No renderizar este segmento
    }

    // Verifica que las coordenadas sean válidas
    const coordenadasValidas = segmento.coordenadas.every(coord => coord && typeof coord.latitude === 'number' && typeof coord.longitude === 'number');

    if (!coordenadasValidas) {
        console.error('Coordenadas inválidas para el segmento:', segmento);
        return null; // No renderizar este segmento
    }

    return (
        <Polyline
            key={index}
            coordinates={segmento.coordenadas}
            strokeColor={segmento.tipo === 'discontinua' ? '#FFA500' : segmento.color}
            strokeWidth={3}
            lineDashPattern={segmento.tipo === 'discontinua' ? [10, 5] : [1]}
        />
    );
})}


    {coordenadasRutaAlternativas.map((alternativa, index) => (
        <Polyline
            key={`alt-${index}`}
            coordinates={alternativa.coordenadas}
            strokeColor={alternativa.color}
            strokeWidth={3}
            lineDashPattern={alternativa.tipo === 'discontinua' ? [10, 5] : [1]}
        />
    ))}
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
            {colorearRuta(coordenadasRuta, zonasPeligrosas).map((segmento, index) => {
    if (!segmento || !Array.isArray(segmento.coordenadas) || segmento.coordenadas.length < 2) {
        console.error('Segmento inválido o sin coordenadas suficientes:', segmento);
        return null; // No renderizar este segmento
    }

    return (
        <Polyline
            key={index}
            coordinates={segmento.coordenadas}
            strokeColor={segmento.color}
            strokeWidth={3}
        />
    );
})}
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
            {zonasPeligrosas.map((zona) => (
              <Circle
                key={`${zona.id}-circle`}
                center={{ latitude: zona.latitude, longitude: zona.longitude }}
                radius={zona.umbral}
                strokeWidth={2}
                strokeColor="rgba(255, 0, 0, 0.5)"
                fillColor="rgba(255, 0, 0, 0.2)"
              />
            ))}
          </MapView>


          {/* Coloca el indicador de seguridad fuera del MapView */}
          <TouchableOpacity
            style={[styles.indicadorSeguridad, { backgroundColor: seguridadRuta === 'peligroso' ? '#FFCCCC' : seguridadRuta === 'moderado' ? '#FFF5CC' : '#CCFFCC', borderWidth: 1, borderColor: 'blue', position: 'absolute', bottom: 240, left: '5%', right: '5%', zIndex: 10 }]}
            onPress={abrirModalPeligros}
          >
            <Text style={{ color: seguridadRuta === 'peligroso' ? '#FF0000' : seguridadRuta === 'moderado' ? '#FFA500' : '#00FF00', fontSize: 16, fontWeight: 'bold' }}>
              Nivel de seguridad: {seguridadRuta}
            </Text>
            <Text style={{ fontSize: 14 }}>Puntuación de seguridad: {puntuacionSeguridad}</Text>
          </TouchableOpacity>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalPeligrosVisible}
            onRequestClose={() => setModalPeligrosVisible(false)}
          >
            <View style={styles.vistaModal}>
              <Text style={styles.textoModal}>Zonas peligrosas detectadas: {zonasPeligrosasEncontradas.length}</Text>
              <ScrollView>
                {zonasPeligrosasEncontradas.length > 0 ? (
                  Object.entries(agruparZonasPorTipo(zonasPeligrosasEncontradas)).map(([tipo, count], index) => (
                    <Text key={index}>
                      • Tipo: {tipo} (Cantidad: {count})
                    </Text>
                  ))
                ) : (
                  <Text>No hay zonas peligrosas cercanas.</Text>
                )}
              </ScrollView>
              <TouchableOpacity
                style={styles.botonCerrar}
                onPress={() => setModalPeligrosVisible(false)}
              >
                <Text style={styles.textoBotonCerrar}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </Modal>

          <Modal
            animationType="slide"
            transparent={true}
            visible={compartirModalVisible}
            onRequestClose={() => setCompartirModalVisible(false)}
          >
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Compartir</Text>
              <TouchableOpacity style={styles.modalOption} onPress={compartirEnlaceApp}>
                <Text>Compartir enlace de la app</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalOption} onPress={compartirEstadisticas}>
                <Text>Compartir estadísticas de seguridad</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalOption} onPress={compartirScreenshot}>
                <Text>Compartir screenshot de la ruta</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setCompartirModalVisible(false)}
              >
                <Text style={styles.textStyle}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </Modal>

          <View style={[styles.topButtonsContainer, !gpsEnabled && styles.topButtonsContainerWithNotification]}>
            {/* Botón flotante del menú lateral */}
            <TouchableOpacity style={styles.botonMenu} onPress={abrirMenuLateral}>
              <Ionicons name="menu" size={30} color="#FFF" />
              {/* Envuelve el texto en un componente <Text> */}
             
            </TouchableOpacity>

            {/* Botón flotante de compartir */}
            <TouchableOpacity style={styles.botonShare} onPress={abrirModalCompartir}>
              <Ionicons name="share-social-outline" size={30} color="#FFF" />
              {/* Envuelve el texto en un componente <Text> */}
            
            </TouchableOpacity>
          </View>


          {/* Botón flotante para el GPS */}
          <TouchableOpacity
            style={styles.botonGPS}
            onPress={obtenerUbicacionActual}
          >
            <Ionicons name="navigate" size={30} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.contenedorInput}>
            <TextInput
              style={styles.input}
              placeholder="¿Dónde estamos?"
              value={inputOrigen}
              onChangeText={(texto) => manejarCambioInput(texto, true)}
              onFocus={() => setSeleccionandoOrigen(true)}
            />
            <TextInput
              style={styles.input}
              placeholder="¿Adónde vamos?"
              value={inputDestino}
              onChangeText={(texto) => manejarCambioInput(texto, false)}
              onFocus={() => setSeleccionandoOrigen(false)}
            />
          </View>

        </View>

      </ViewShot>
    </SafeAreaView >
  );


  
}



const styles = StyleSheet.create({
  topBar: {
    height: 3,
    backgroundColor: '#333',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  // Añade el contenedor de los botones superiores
  topButtonsContainer: {
    position: 'absolute',
    top: hp('2%'), // Posición normal
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp('3%'),
  }, // Ajusta el contenedor cuando la notificación esté visible
  topButtonsContainerWithNotification: {
    top: hp('9%'), // Empuja hacia abajo los botones cuando la notificación esté visible
  },
  modalView: {
    margin: wp('5%'),
    backgroundColor: 'white',
    borderRadius: 20,
    padding: wp('5%'),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: hp('2%'),
    textAlign: 'center',
    fontSize: wp('5%'),
    fontWeight: 'bold',
  },
  modalOption: {
    backgroundColor: '#F0F0F0',
    padding: wp('4%'),
    borderRadius: 10,
    width: '100%',
    marginBottom: hp('2%'),
    alignItems: 'center',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  drawer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: wp('5%'),
  },
  drawerTitle: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    marginBottom: hp('3%'),
  },
  drawerItem: {
    padding: wp('4%'),
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  shareModalView: {
    margin: wp('5%'),
    backgroundColor: 'white',
    borderRadius: 20,
    padding: wp('5%'),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  shareModalTitle: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    marginBottom: hp('2%'),
  },
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: wp('3%'),
    elevation: 2,
    marginTop: hp('2%'),
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  contenedor: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  gpsNotification: {
    backgroundColor: '#FFA500', // Naranja
    padding: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Distribuir el texto y el botón
    paddingHorizontal: 20,
    height: 60, // Altura fija para la notificación
  },
  gpsNotificationText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapa: {
    width: wp('100%'),
    height: hp('58%'),
  },
  botonMenu: {
    backgroundColor: '#333',
    padding: wp('3%'),
    borderRadius: 25,
  },
  botonShare: {
    backgroundColor: '#333',
    padding: wp('3%'),
    borderRadius: 25,
  },
  botonGPS: {
    position: 'absolute',
    top: hp('50%'), // Usamos porcentaje relativo
    right: wp('5%'),
    zIndex: 1,
    backgroundColor: '#333',
    padding: wp('3%'),
    borderRadius: 25,
  },
  contenedorInput: {
    padding: wp('5%'),
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    height: hp('8%'), // Tamaño accesible en diferentes pantallas
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: hp('5%'),
    paddingHorizontal: wp('3%'),
    borderRadius: 10,
    fontSize: wp('4.5%'), // Texto más grande
  },
  indicadorSeguridad: {
    padding: wp('3%'),
    alignItems: 'center',
    position: 'absolute',
    left: '5%',
    right: '5%',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10, // Asegura que esté por encima del mapa y otros elementos
  },
  textoIndicador: {
    color: '#333',
    fontSize: wp('4%'), // Texto adaptado al tamaño de pantalla
    fontWeight: 'bold',
  },
  vistaModal: {
    margin: wp('5%'),
    backgroundColor: 'white',
    borderRadius: 20,
    padding: wp('5%'),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  botonCerrar: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: wp('3%'),
    elevation: 2,
    marginTop: hp('2%'),
  },
  textoBotonCerrar: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
