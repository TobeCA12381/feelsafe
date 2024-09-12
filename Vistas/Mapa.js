import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Image, Modal, ActivityIndicator, ScrollView, DrawerLayoutAndroid, Share, Platform, Alert } from 'react-native';
import MapView, { Marker, Polyline, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { GOOGLE_MAPS_APIKEY } from '@env';
import { calcularDistancia, decodificarPolilinea, obtenerIconoMarcador, geocodificarInversoCoordenada, geocodificarDireccion, colorearRuta } from '../utils/mapUtils';
import { verificarSeguridadLogaritmica } from '../utils/routeSafety';
import ViewShot from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system'; // Importamos expo-file-system para manejar archivos
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

const UMBRAL_PELIGRO_METROS = 100;

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

    setLoading(true);

    try {
      const urlDirecciones = `https://maps.googleapis.com/maps/api/directions/json?origin=${origen.latitude},${origen.longitude}&destination=${destino.latitude},${destino.longitude}&mode=${modoViaje}&key=${GOOGLE_MAPS_APIKEY}`;
      const respuesta = await fetch(urlDirecciones);
      const datos = await respuesta.json();

      if (datos.status === "OK" && datos.routes.length > 0) {
        const ruta = datos.routes[0];
        const puntosDecodificados = decodificarPolilinea(ruta.overview_polyline.points);
        setCoordenadasRuta(puntosDecodificados);

        ajustarVistaRuta(puntosDecodificados);

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
        Alert.alert('Error', 'No se encontraron rutas. Por favor, verifique las ubicaciones e intente de nuevo.');
      }
    } catch (error) {
      console.error('Error al obtener la ruta:', error);
      Alert.alert('Error', 'Hubo un problema al generar la ruta. Por favor, intente de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [origen, destino, modoViaje, zonasPeligrosas, ajustarVistaRuta]);

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
    if (drawerRef.current) {
      drawerRef.current.openDrawer();
    }
  }, []);

  const compartirRuta = useCallback(async () => {
    try {
      const result = await Share.share({
        message: 'Mira mi ruta segura en la app!',
        title: 'Compartir Ruta Segura'
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(`Compartido con: ${result.activityType}`);
        } else {
          console.log('Compartido');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Compartir cancelado');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al compartir');
    }
  }, []);

  const renderMenuLateral = () => (
    <View style={styles.drawer}>
      <Text style={styles.drawerTitle}>Menú</Text>
      <TouchableOpacity style={styles.drawerItem}>
        <Text>Opción 1</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.drawerItem}>
        <Text>Opción 2</Text>
      </TouchableOpacity>
      {/* Añade más opciones según sea necesario */}
    </View>
  );


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
    <DrawerLayoutAndroid
      ref={drawerRef}
      drawerWidth={300}
      drawerPosition="left"
      renderNavigationView={renderMenuLateral}
    >
      <View style={styles.contenedor}>
        <ViewShot ref={mapShotRef} options={{ format: "jpg", quality: 0.8, result: "tmpfile" }} style={StyleSheet.absoluteFillObject}>
          <MapView
            ref={mapRef}
            style={styles.mapa}
            region={regionMapa}
            onRegionChangeComplete={setRegionMapa}
            onPress={manejarPresionMapa}
          >
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
            {colorearRuta(coordenadasRuta, zonasPeligrosas).map((segmento, index) => (
              <Polyline
                key={index}
                coordinates={segmento.coordenadas}
                strokeColor={segmento.color}
                strokeWidth={3}
              />
            ))}
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

        </ViewShot>

        {/* Coloca el indicador de seguridad fuera del MapView */}
        <TouchableOpacity
          style={[styles.indicadorSeguridad, { backgroundColor: seguridadRuta === 'peligroso' ? '#FFCCCC' : seguridadRuta === 'moderado' ? '#FFF5CC' : '#CCFFCC', borderWidth: 1, borderColor: 'blue', position: 'absolute', bottom: 245, left: '5%', right: '5%', zIndex: 10 }]}
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

        {/* Botón flotante del menú lateral */}
        <TouchableOpacity style={styles.botonMenu} onPress={abrirMenuLateral}>
          <Ionicons name="menu" size={30} color="#FFF" />
        </TouchableOpacity>

        {/* Botón flotante de compartir */}
        <TouchableOpacity style={styles.botonShare} onPress={abrirModalCompartir}>
          <Ionicons name="share-social-outline" size={30} color="#FFF" />
        </TouchableOpacity>

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
    </DrawerLayoutAndroid>
  );
}


const styles = StyleSheet.create({
  modalView: {
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
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOption: {
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 10,
    width: '100%',
    marginBottom: 10,
    alignItems: 'center',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  drawer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  drawerItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  shareModalView: {
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
  shareModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  shareOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  shareOption: {
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
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
  mapa: {
    width: '100%',
    height: '63%',  // Ajustamos el tamaño para permitir más espacio a los inputs
  },
  botonMenu: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 25,
  },
  botonShare: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 25,
  },
  botonGPS: {
    position: 'absolute',
    top: 500,
    right: 20,
    zIndex: 1,
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 25,
  },
  imagenAlerta: {
    width: 40,
    height: 40,
  },
  contenedorInput: {
    padding: 10,
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',  // Sombra para la caja de input
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    height: 70,  // Incrementar el tamaño para hacerlo más accesible
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 45,
    paddingHorizontal: 15,
    borderRadius: 10,  // Bordes redondeados para un estilo moderno
    fontSize: 16,  // Texto más grande
  },
  indicadorSeguridad: {
    padding: 15,
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
    color: '#333',  // Color más oscuro para el texto
    fontSize: 16,
    fontWeight: 'bold',
  },
  vistaModal: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
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
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  textoBotonCerrar: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

