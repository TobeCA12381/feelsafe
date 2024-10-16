import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Dimensions, StatusBar, StyleSheet, View, TextInput, TouchableOpacity, Text, Image, Modal, ActivityIndicator, ScrollView, Share, Animated, Alert, SafeAreaView } from 'react-native';
import MapView, { Marker, Polyline, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useNavigation } from '@react-navigation/native';
import { GOOGLE_MAPS_APIKEY } from '@env';
import { decodificarPolilinea, obtenerIconoMarcador, geocodificarInversoCoordenada, geocodificarDireccion, colorearRuta, RenderRuta } from '../utils/mapUtils';
import { verificarSeguridadLogaritmica } from '../utils/routeSafety';
import ViewShot from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system'; // Importamos expo-file-system para manejar archivos
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import RouteInputPanel from '../Componentes/RouteInputPanel'; // Asegúrate de que la ruta de importación sea correcta
// Obtiene las dimensiones de la pantalla

const UMBRAL_PELIGRO_METROS = 100;

export default function PantallaMapa() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { height } = Dimensions.get('window');
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
  const [loading, setLoading] = useState(true); // Nuevo estado para el estado de cargando
  const mapRef = useRef(null);
  const [mostrarIconoAlerta, setMostrarIconoAlerta] = useState(false);
  const [zonasPeligrosasEncontradas, setZonasPeligrosasEncontradas] = useState([]);
  const [modalPeligrosVisible, setModalPeligrosVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const drawerRef = useRef(null);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [coordenadasRutaAlternativas, setCoordenadasRutaAlternativas] = useState([]);
  // Función para abrir el modal
  const abrirModalPeligros = useCallback(() => {
    console.log('Abriendo modal de peligros');
    setModalPeligrosVisible(true);
  }, []);

  const [isDragging, setIsDragging] = useState(false); // Controla si el mapa está siendo arrastrado
  const [markerLocation, setMarkerLocation] = useState({
    latitude: -11.985,
    longitude: -77.005,
  }); // Ubicación inicial del marcador

  const fadeAnim = useRef(new Animated.Value(1)).current; // Controla la animación de los inputs

  const [compartirModalVisible, setCompartirModalVisible] = useState(false);
  const mapShotRef = useRef(null);
  const markerAnim = useRef(new Animated.Value(0)).current;
  const zonasPeligrosas = useMemo(() => [
    { id: 1, latitude: -11.984, longitude: -77.007, descripcion: 'Zona de acoso', tipo: 'ACOSO', umbral: UMBRAL_PELIGRO_METROS, peso: 60 },
    { id: 2, latitude: -11.982, longitude: -77.003, descripcion: 'Zona de crimen violento', tipo: 'CRIMEN', umbral: UMBRAL_PELIGRO_METROS, peso: 90 },
    { id: 3, latitude: -11.980, longitude: -77.004, descripcion: 'Zona de venta de drogas', tipo: 'DROGAS', umbral: UMBRAL_PELIGRO_METROS, peso: 70 },
    { id: 4, latitude: -11.979, longitude: -77.005, descripcion: 'Área de robos a casa', tipo: 'ROBO_A_CASA', umbral: UMBRAL_PELIGRO_METROS, peso: 65 },
    { id: 5, latitude: -11.978, longitude: -77.006, descripcion: 'Zona de robos a comercios', tipo: 'ROBO_A_COMERCIO', umbral: UMBRAL_PELIGRO_METROS, peso: 55 },
    { id: 6, latitude: -11.977, longitude: -77.007, descripcion: 'Área de robos a personas', tipo: 'ROBO_A_PERSONA', umbral: UMBRAL_PELIGRO_METROS, peso: 75 },
    { id: 7, latitude: -11.976, longitude: -77.008, descripcion: 'Zona de robos de vehículos', tipo: 'ROBO_A_VEHICULO', umbral: UMBRAL_PELIGRO_METROS, peso: 50 },
    { id: 8, latitude: -11.975, longitude: -77.009, descripcion: 'Área de actividad sospechosa', tipo: 'SOSPECHOSO', umbral: UMBRAL_PELIGRO_METROS, peso: 40 },
    { id: 9, latitude: -11.974, longitude: -77.010, descripcion: 'Zona de vandalismo', tipo: 'VANDALISMO', umbral: UMBRAL_PELIGRO_METROS, peso: 30 },

  ], []);
  const markerAnimatedValue = useRef(new Animated.Value(0)).current;
  const [markerCoordinate, setMarkerCoordinate] = useState({
    latitude: -11.985,
    longitude: -77.005,
  });
  const [rutaGenerada, setRutaGenerada] = useState(false); // Controla si la ruta ya fue generada

  useEffect(() => {
    // Inicia la verificación constante del estado del GPS
    startCheckingGpsStatus();
    return () => clearInterval(gpsCheckInterval); // Limpia el intervalo cuando el componente se desmonte
  }, []);

  const manejarCambioInputDesdePanel = useCallback(async (texto, esOrigen) => {
    try {
      if (texto) {
        // Geocodificar la dirección ingresada para obtener las coordenadas
        const coordenada = await geocodificarDireccion(texto);
        if (coordenada) {
          if (esOrigen) {
            // Actualizamos el origen con las nuevas coordenadas
            setOrigen(coordenada);
            setInputOrigen(texto); // Actualizamos el input también
          } else {
            // Actualizamos el destino con las nuevas coordenadas
            setDestino(coordenada);
            setInputDestino(texto); // Actualizamos el input también
          }
        } else {
          Alert.alert("No se encontraron coordenadas para la dirección ingresada");
        }
      }
    } catch (error) {
      console.error("Error al geocodificar la dirección:", error);
    }
  }, []);



  // Variable para almacenar el intervalo de verificación
  let gpsCheckInterval = null;

  // Función para iniciar la verificación del estado del GPS
  const startCheckingGpsStatus = () => {
    gpsCheckInterval = setInterval(() => {
      checkGpsStatus();
    }, 2000); // Verifica cada 2 segundos
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

  const openPanel = () => {
    // Limpiar la ruta actual al abrir el panel
    setCoordenadasRuta([]);
    setRutaGenerada(false); // Resetea la bandera de ruta generada
    setIsPanelOpen(true);

    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };


  // Función para cerrar el panel y verificar si las coordenadas han cambiado
  const closePanel = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsPanelOpen(false);

      // Si el origen y el destino están definidos, generar la nueva ruta
      if (origen && destino) {
        obtenerRuta();  // Genera una nueva ruta
      }
    });
  };

  const panelTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0], // El panel se desliza desde abajo hacia arriba
  });


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

  const obtenerRuta = useCallback(async () => {
    if (!origen || !destino) {
      Alert.alert('Error', 'Debe seleccionar un origen y un destino');
      return;
    }

    // Limpia la ruta anterior antes de calcular la nueva
    setCoordenadasRuta([]); // <-- Agregamos esta línea para limpiar la ruta previa

    setLoading(true); // Mostrar un indicador de carga mientras se genera la nueva ruta

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

        setCoordenadasRuta(puntosDecodificados); // <-- Aquí se actualizan las nuevas coordenadas de la ruta

        const { puntosPeligrosos, puntuacion } = verificarSeguridadLogaritmica(puntosDecodificados, zonasPeligrosas);

        setPuntuacionSeguridad(puntuacion);
        setSeguridadRuta(puntuacion < 50 ? 'peligroso' : puntuacion < 75 ? 'moderado' : 'seguro');

        if (puntosPeligrosos.length > 0) {
          setZonasPeligrosasEncontradas(puntosPeligrosos);
          setMostrarIconoAlerta(true);
        } else {
          setZonasPeligrosasEncontradas([]);
          setMostrarIconoAlerta(false);
        }

        ajustarVistaRuta(puntosDecodificados); // <-- Aquí ajustas la vista del mapa a la nueva ruta

        setRutaGenerada(true); // Marcar que la ruta ha sido generada
      } else {
        throw new Error('No se encontraron rutas. Verifique las ubicaciones.');
      }
    } catch (error) {
      console.error('Error al obtener la ruta:', error);
      Alert.alert('Error', `Hubo un problema al generar la ruta: ${error.message}`);
    } finally {
      setLoading(false); // Ocultar el indicador de carga cuando termine
    }
  }, [origen, destino, modoViaje, zonasPeligrosas, setPuntuacionSeguridad]);




  const agruparZonasPorTipo = useCallback((zonas) => {
    return zonas.reduce((acumulador, zona) => {
      const tipo = zona.tipo || 'DESCONOCIDO';
      acumulador[tipo] = (acumulador[tipo] || 0) + 1;
      return acumulador;
    }, {});
  }, []);

  const ajustarVistaRuta = useCallback((puntos) => {
    if (mapRef.current && puntos.length > 0) {
      mapRef.current.fitToCoordinates(puntos, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, []);


  const abrirMenuLateral = useCallback(() => {
    navigation.openDrawer();
  }, [navigation]);


  const onRegionChange = useCallback(() => {
    if (!rutaGenerada) { // Solo animar si la ruta no está generada
      Animated.spring(markerAnimatedValue, {
        toValue: 1,
        friction: 5,  // Más natural
        useNativeDriver: true,
      }).start();

      setIsDragging(true);  // El usuario está arrastrando el mapa

      if (fadeAnim._value !== 0) {
        Animated.timing(fadeAnim, {
          toValue: 0,  // Ocultar
          duration: 10,  // Aumenta la duración para una transición más suave
          useNativeDriver: true,
        }).start();
      }
    }
  }, [rutaGenerada, fadeAnim, markerAnimatedValue]);

  const onRegionChangeComplete = useCallback((region) => {
    if (!rutaGenerada) { // Evitar cambios si la ruta ya fue generada
      setRegionMapa(region);
      setMarkerCoordinate({
        latitude: region.latitude,
        longitude: region.longitude,
      });

      // Actualiza el campo de entrada con la nueva dirección
      geocodificarInversoCoordenada(region, (direccion) => {
        if (seleccionandoOrigen) {
          setInputOrigen(direccion);
          setOrigen({
            latitude: region.latitude,
            longitude: region.longitude,
          });
        } else {
          setInputDestino(direccion);
          setDestino({
            latitude: region.latitude,
            longitude: region.longitude,
          });
        }
      });
    }
  }, [seleccionandoOrigen, geocodificarInversoCoordenada, rutaGenerada]);


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

    if (!destino) {  // Solo permite mover el marcador si el destino aún no se ha establecido
      iniciarAnimacionSalto();

      setLoading(true);
      actualizarRegionMapa(coordenada);

      if (seleccionandoOrigen) {
        setOrigen(coordenada);
        geocodificarInversoCoordenada(coordenada, (direccion) => {
          setInputOrigen(direccion);
          setLoading(false);
          finalizarAnimacionSalto();
        });
      } else {
        setDestino(coordenada);
        geocodificarInversoCoordenada(coordenada, (direccion) => {
          setInputDestino(direccion);
          setLoading(false);
          finalizarAnimacionSalto();
        });
      }
    }
  }, [seleccionandoOrigen, actualizarRegionMapa, geocodificarInversoCoordenada, destino]);


  const iniciarAnimacionSalto = useCallback(() => {
    if (!destino) { // Solo realiza la animación si el destino no ha sido seleccionado
      Animated.spring(markerAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [destino]);

  const finalizarAnimacionSalto = useCallback(() => {
    if (!destino) { // Solo finaliza la animación si el destino no ha sido seleccionado
      Animated.spring(markerAnim, {
        toValue: 0,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [destino]);


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#333" />
      <View style={styles.topBar} />
      <ViewShot ref={mapShotRef} options={{ format: "jpg", quality: 0.8, result: "tmpfile" }} style={StyleSheet.absoluteFillObject}>
        <View style={styles.contenedor}>
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
            onRegionChange={!rutaGenerada ? onRegionChange : undefined} // Desactivar movimientos cuando la ruta está generada
            onRegionChangeComplete={!rutaGenerada ? onRegionChangeComplete : undefined}
          >
            <RenderRuta coordenadasRuta={coordenadasRuta} zonasPeligrosas={zonasPeligrosas} />

            {/* Mostrar el marcador de inicio */}
            {origen && (
              <Marker coordinate={origen} anchor={{ x: 0.5, y: 1 }} draggable={false}>
                <Image
                  source={require('../assets/inicio.png')}
                  style={styles.markerImage}
                />
              </Marker>
            )}

            {/* Mostrar el marcador de destino */}
            {destino && (
              <Marker coordinate={destino} anchor={{ x: 0.5, y: 1 }} draggable={false}>
                <Image
                  source={require('../assets/destino.png')}
                  style={styles.markerImage}
                />
              </Marker>
            )}

            {colorearRuta(coordenadasRuta, zonasPeligrosas).map((segmento, index) => (
              <Polyline
                key={index}
                coordinates={segmento.coordenadas}
                strokeColor={segmento.color}
                strokeWidth={3}
              />
            ))}
          </MapView>








          {!rutaGenerada && (
            <View style={styles.markerFixed}>
              <Animated.Image
                source={require('../assets/inicio.png')}
                style={[
                  styles.marker,
                  {
                    transform: [{
                      translateY: markerAnimatedValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -10],
                      }),
                    }],
                  },
                ]}
              />
            </View>
          )}

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

          <View style={[styles.topButtonsContainer]}>
            {/* Contenedor separado para los botones que se moverán con la notificación */}
            <View style={[styles.topButtonsMovable, !gpsEnabled && styles.topButtonsWithNotification]}>
              <TouchableOpacity style={styles.botonMenu} onPress={abrirMenuLateral}>
                <Ionicons name="menu" size={30} color="#FFF" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.botonShare} onPress={abrirModalCompartir}>
                <Ionicons name="share-social-outline" size={30} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Botón GPS que no se moverá con la notificación */}
            <TouchableOpacity
              style={styles.botonGPS}
              onPress={obtenerUbicacionActual}
            >
              <Ionicons name="navigate" size={30} color="#FFF" />
            </TouchableOpacity>
          </View>


          <View style={[styles.contenedorInput]}>
            <View style={styles.container}>
              <TouchableOpacity
                style={[styles.indicadorSeguridad, {
                  backgroundColor: seguridadRuta === 'peligroso' ? '#FFCCCC' : seguridadRuta === 'moderado' ? '#FFF5CC' : '#CCFFCC',
                  borderWidth: 1,
                  borderColor: 'blue',
                  position: 'absolute',
                  bottom: 240,
                  left: '5%',
                  right: '5%',
                  zIndex: 10
                }]}
                onPress={abrirModalPeligros}
              >
                <Text style={{ color: seguridadRuta === 'peligroso' ? '#FF0000' : seguridadRuta === 'moderado' ? '#FFA500' : '#00FF00', fontSize: 16, fontWeight: 'bold' }}>
                  Nivel de seguridad: {seguridadRuta}
                </Text>
                <Text style={{ fontSize: 14 }}>Puntuación de seguridad: {puntuacionSeguridad}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.input}
                onPress={() => {
                  setSeleccionandoOrigen(true);  // Indica que estamos seleccionando el origen
                  openPanel();  // Abre el panel
                }}
              >
                <Text style={styles.textPlaceholder}>
                  {inputOrigen || "¿Dónde estamos?"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.input}
                onPress={() => {
                  setSeleccionandoOrigen(false);  // Indica que estamos seleccionando el destino
                  openPanel();  // Abre el panel
                }}
              >
                <Text style={styles.textPlaceholder}>
                  {inputDestino || "¿Adónde vamos?"}
                </Text>
              </TouchableOpacity>

            </View>
          </View>
          {/* Panel de entrada de ruta */}
          {isPanelOpen && (
            <Animated.View style={[styles.panel, { transform: [{ translateY: panelTranslateY }] }]}>
              <RouteInputPanel
                onClose={closePanel} // Cierra el panel
                setOrigenInput={(texto) => manejarCambioInputDesdePanel(texto, true)} // Actualiza origen
                setDestinoInput={(texto) => manejarCambioInputDesdePanel(texto, false)} // Actualiza destino
                origenValue={inputOrigen}
                destinoValue={inputDestino}
              />
            </Animated.View>
          )}
        </View>
      </ViewShot>
    </SafeAreaView>
  );



}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  textInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
  },

  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  panelTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#444',
    borderRadius: 15,
    padding: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  searchInput: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  mapOption: {
    color: '#00aaff',
    marginTop: 20,
    fontSize: 16,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  markerImage: {
    width: 30,
    height: 40,
    resizeMode: 'contain', // Asegúrate de que la imagen se ajuste bien
  },
  loadingMarker: {
    width: 40,
    height: 40,
    borderRadius: 20, // Hacerlo redondo
    backgroundColor: '#2196F3', // Color de fondo para el estado de carga
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadedMarker: {
    width: 40,
    height: 40,
    borderRadius: 20, // Hacerlo redondo
    backgroundColor: '#4CAF50', // Cambiar el color cuando se cargue
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    color: '#fff',
    fontSize: 10,
    textAlign: 'center',
  },
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
    top: hp('2%'), // Posición base
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp('3%'),
  },
  // Nuevo contenedor para los botones de menú y compartir
  topButtonsMovable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: wp('50%'),  // Asegura que solo los botones de menú y compartir estén en este contenedor
  },
  topButtonsWithNotification: {
    top: hp('9%'),  // Ajusta la posición solo cuando la notificación esté visible
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
  markerFixed: {
    left: '52.39%',
    marginLeft: -24,
    marginTop: -48,
    position: 'absolute',
    top: '35%',
  },
  marker: {
    height: 30,
    width: 30,
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
    zIndex: 100,
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
    height: hp('60%'),
  },
  botonMenu: {
    backgroundColor: '#333',
    padding: wp('3%'),
    borderRadius: 25,
  },
  botonShare: {
    backgroundColor: '#333',
    right: wp('-45%'),
    padding: wp('3%'),
    borderRadius: 25,
  },
  // Mantiene el botón GPS fijo
  botonGPS: {
    position: 'absolute',
    top: hp('48%'), // No será afectado por la notificación
    right: wp('5%'),
    zIndex: 1,
    backgroundColor: '#333',
    padding: wp('3%'),
    borderRadius: 25,
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // Ajusta la altura según sea necesario
    height: '100%', // o un valor fijo como 300
    zIndex: 100,
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