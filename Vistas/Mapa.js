import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  Modal,
  ActivityIndicator,
  ScrollView,
  Share,
  Animated,
  Alert,
  SafeAreaView,
} from "react-native";
import MapView, { Marker, Polyline, Circle } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, useNavigation } from "@react-navigation/native";
import { GOOGLE_MAPS_APIKEY } from "@env";
import {
  decodificarPolilinea,
  obtenerIconoMarcador,
  geocodificarInversoCoordenada,
  geocodificarDireccion,
  colorearRuta,
  RenderRuta,
} from "../utils/mapUtils";
import { verificarSeguridadLogaritmica } from "../utils/routeSafety";
import ViewShot from "react-native-view-shot";
import * as FileSystem from "expo-file-system"; // Importamos expo-file-system para manejar archivos
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import RouteInputPanel from "../Componentes/RouteInputPanel"; // Asegúrate de que la ruta de importación sea correcta
import Boton from "../Componentes/Boton";
// Obtiene las dimensiones de la pantalla

const UMBRAL_PELIGRO_METROS = 100;

export default function PantallaMapa() {
  const [menuReportesVisible, setMenuReportesVisible] = useState(false);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { height } = Dimensions.get("window");
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [origen, setOrigen] = useState(null);
  const [destino, setDestino] = useState(null);
  const [coordenadasRuta, setCoordenadasRuta] = useState([]);
  const [inputOrigen, setInputOrigen] = useState("");
  const [inputDestino, setInputDestino] = useState("");
  const [seleccionandoOrigen, setSeleccionandoOrigen] = useState(true);
  const [modoViaje, setModoViaje] = useState("walking");
  const [regionMapa, setRegionMapa] = useState({
    latitude: -11.985,
    longitude: -77.005,
    latitudeDelta: 0.007,
    longitudeDelta: 0.007,
  });
  const [mostrarRutaSegura, setMostrarRutaSegura] = useState(false);
  const [mostrarRutaRapida, setMostrarRutaRapida] = useState(false);
  const [seguridadRuta, setSeguridadRuta] = useState("seguro");
  const [puntuacionSeguridad, setPuntuacionSeguridad] = useState(100);
  const [zonaSeleccionada, setZonaSeleccionada] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [ubicacionActual, setUbicacionActual] = useState(null);
  const [loading, setLoading] = useState(true); // Nuevo estado para el estado de cargando
  const mapRef = useRef(null);
  const [mostrarIconoAlerta, setMostrarIconoAlerta] = useState(false);
  const [zonasPeligrosasEncontradas, setZonasPeligrosasEncontradas] = useState(
    []
  );
  const [modalPeligrosVisible, setModalPeligrosVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const drawerRef = useRef(null);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [mostrarRutasAlternativas, setMostrarRutasAlternativas] =
    useState(false);
  const [coordenadasRutaAlternativas, setCoordenadasRutaAlternativas] =
    useState([]);
  // Función para abrir el modal
  const abrirModalPeligros = useCallback(() => {
    console.log("Abriendo modal de peligros");
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
  const zonasPeligrosas = useMemo(
    () => [
      {
        id: 1,
        latitude: -11.984,
        longitude: -77.007,
        descripcion: "Zona de acoso",
        tipo: "ACOSO",
        umbral: UMBRAL_PELIGRO_METROS,
        peso: 60,
      },
      {
        id: 2,
        latitude: -11.982,
        longitude: -77.003,
        descripcion: "Zona de crimen violento",
        tipo: "CRIMEN",
        umbral: UMBRAL_PELIGRO_METROS,
        peso: 90,
      },
      {
        id: 3,
        latitude: -11.98,
        longitude: -77.004,
        descripcion: "Zona de venta de drogas",
        tipo: "DROGAS",
        umbral: UMBRAL_PELIGRO_METROS,
        peso: 70,
      },
      {
        id: 4,
        latitude: -11.979,
        longitude: -77.005,
        descripcion: "Área de robos a casa",
        tipo: "ROBO_A_CASA",
        umbral: UMBRAL_PELIGRO_METROS,
        peso: 65,
      },
      {
        id: 5,
        latitude: -11.978,
        longitude: -77.006,
        descripcion: "Zona de robos a comercios",
        tipo: "ROBO_A_COMERCIO",
        umbral: UMBRAL_PELIGRO_METROS,
        peso: 55,
      },
      {
        id: 6,
        latitude: -11.977,
        longitude: -77.007,
        descripcion: "Área de robos a personas",
        tipo: "ROBO_A_PERSONA",
        umbral: UMBRAL_PELIGRO_METROS,
        peso: 75,
      },
      {
        id: 7,
        latitude: -11.976,
        longitude: -77.008,
        descripcion: "Zona de robos de vehículos",
        tipo: "ROBO_A_VEHICULO",
        umbral: UMBRAL_PELIGRO_METROS,
        peso: 50,
      },
      {
        id: 8,
        latitude: -11.975,
        longitude: -77.009,
        descripcion: "Área de actividad sospechosa",
        tipo: "SOSPECHOSO",
        umbral: UMBRAL_PELIGRO_METROS,
        peso: 40,
      },
      {
        id: 9,
        latitude: -11.974,
        longitude: -77.01,
        descripcion: "Zona de vandalismo",
        tipo: "VANDALISMO",
        umbral: UMBRAL_PELIGRO_METROS,
        peso: 30,
      },
    ],
    []
  );
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
          Alert.alert(
            "No se encontraron coordenadas para la dirección ingresada"
          );
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
    if (status !== "granted") {
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
        obtenerRuta(); // Genera una nueva ruta
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
      [{ text: "OK", onPress: () => checkGpsStatus() }]
    );
  };

  const actualizarRegionMapa = useCallback((coordenada) => {
    setRegionMapa((prevRegion) => ({
      ...prevRegion,
      latitude: coordenada.latitude,
      longitude: coordenada.longitude,
    }));
  }, []);

  const obtenerRuta = useCallback(async () => {
    if (!origen || !destino) {
      Alert.alert("Error", "Debe seleccionar un origen y un destino");
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
          throw new Error(
            "No se encontró una polilínea válida en la respuesta de la API."
          );
        }

        const puntosDecodificados = decodificarPolilinea(
          ruta.overview_polyline.points
        );

        setCoordenadasRuta(puntosDecodificados); // <-- Aquí se actualizan las nuevas coordenadas de la ruta

        const { puntosPeligrosos, puntuacion } = verificarSeguridadLogaritmica(
          puntosDecodificados,
          zonasPeligrosas
        );

        setPuntuacionSeguridad(puntuacion);
        setSeguridadRuta(
          puntuacion < 50
            ? "peligroso"
            : puntuacion < 75
            ? "moderado"
            : "seguro"
        );

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
        throw new Error("No se encontraron rutas. Verifique las ubicaciones.");
      }
    } catch (error) {
      console.error("Error al obtener la ruta:", error);
      Alert.alert(
        "Error",
        `Hubo un problema al generar la ruta: ${error.message}`
      );
    } finally {
      setLoading(false); // Ocultar el indicador de carga cuando termine
    }
  }, [origen, destino, modoViaje, zonasPeligrosas, setPuntuacionSeguridad]);

  const mostrarOcultarRutasAlternativas = useCallback(() => {
    if (!origen || !destino) {
      console.warn(
        "Origen o destino no están definidos. No se pueden mostrar rutas alternativas."
      );
      Alert.alert(
        "Error",
        "Debe seleccionar un origen y un destino antes de mostrar rutas alternativas."
      );
      return; // Detiene la ejecución si origen o destino son null
    }

    setMostrarRutasAlternativas(!mostrarRutasAlternativas);
    if (!mostrarRutasAlternativas) {
      obtenerRutasAlternativas();
    }
  }, [mostrarRutasAlternativas, origen, destino]);

  const obtenerRutasAlternativas = async () => {
    if (!origen || !destino) return;

    try {
      // 1. Ruta más segura: Calcular puntos seguros alejados de zonas peligrosas
      const puntosSegurosCandidatos = zonasPeligrosas.map((zona) => {
        // Crear puntos de evasión a una distancia segura de cada zona peligrosa
        const distanciaSegura = zona.umbral * 3;
        return {
          latitude: zona.latitude + distanciaSegura / 111111,
          longitude:
            zona.longitude +
            distanciaSegura /
              (111111 * Math.cos((zona.latitude * Math.PI) / 180)),
        };
      });

      // Obtener ruta segura usando waypoints de evasión
      const rutaSeguraParams = new URLSearchParams({
        origin: `${origen.latitude},${origen.longitude}`,
        destination: `${destino.latitude},${destino.longitude}`,
        waypoints: `via:${puntosSegurosCandidatos
          .map((p) => `${p.latitude},${p.longitude}`)
          .join("|")}`,
        mode: modoViaje,
        key: GOOGLE_MAPS_APIKEY,
      });

      // 2. Ruta más rápida: Directa sin consideraciones de seguridad
      const rutaRapidaParams = new URLSearchParams({
        origin: `${origen.latitude},${origen.longitude}`,
        destination: `${destino.latitude},${destino.longitude}`,
        mode: modoViaje,
        key: GOOGLE_MAPS_APIKEY,
      });

      // 3. Ruta equilibrada: Usar algunos puntos de evasión estratégicos
      const puntosEquilibrados = puntosSegurosCandidatos.filter(
        (_, index) => index % 2 === 0
      );
      const rutaEquilibradaParams = new URLSearchParams({
        origin: `${origen.latitude},${origen.longitude}`,
        destination: `${destino.latitude},${destino.longitude}`,
        waypoints: `via:${puntosEquilibrados
          .map((p) => `${p.latitude},${p.longitude}`)
          .join("|")}`,
        mode: modoViaje,
        key: GOOGLE_MAPS_APIKEY,
      });

      // Obtener las tres rutas en paralelo
      const [respuestaSegura, respuestaRapida, respuestaEquilibrada] =
        await Promise.all([
          fetch(
            `https://maps.googleapis.com/maps/api/directions/json?${rutaSeguraParams}`
          ),
          fetch(
            `https://maps.googleapis.com/maps/api/directions/json?${rutaRapidaParams}`
          ),
          fetch(
            `https://maps.googleapis.com/maps/api/directions/json?${rutaEquilibradaParams}`
          ),
        ]);

      const [datosSegura, datosRapida, datosEquilibrada] = await Promise.all([
        respuestaSegura.json(),
        respuestaRapida.json(),
        respuestaEquilibrada.json(),
      ]);

      let rutasAlternativas = [];

      // Procesar y validar cada ruta
      if (datosSegura.status === "OK" && datosSegura.routes.length > 0) {
        const rutaSegura = {
          coordenadas: decodificarPolilinea(
            datosSegura.routes[0].overview_polyline.points
          ),
          tipo: "segura",
          duracion: datosSegura.routes[0].legs[0].duration.text,
          distancia: datosSegura.routes[0].legs[0].distance.text,
        };
        rutasAlternativas.push(rutaSegura);
      }

      if (datosRapida.status === "OK" && datosRapida.routes.length > 0) {
        const rutaRapida = {
          coordenadas: decodificarPolilinea(
            datosRapida.routes[0].overview_polyline.points
          ),
          tipo: "rapida",
          duracion: datosRapida.routes[0].legs[0].duration.text,
          distancia: datosRapida.routes[0].legs[0].distance.text,
        };
        if (validarRutaUnica(rutaRapida, rutasAlternativas)) {
          rutasAlternativas.push(rutaRapida);
        }
      }

      if (
        datosEquilibrada.status === "OK" &&
        datosEquilibrada.routes.length > 0
      ) {
        const rutaEquilibrada = {
          coordenadas: decodificarPolilinea(
            datosEquilibrada.routes[0].overview_polyline.points
          ),
          tipo: "equilibrada",
          duracion: datosEquilibrada.routes[0].legs[0].duration.text,
          distancia: datosEquilibrada.routes[0].legs[0].distance.text,
        };
        if (validarRutaUnica(rutaEquilibrada, rutasAlternativas)) {
          rutasAlternativas.push(rutaEquilibrada);
        }
      }

      // Evaluar la seguridad de cada ruta
      rutasAlternativas = rutasAlternativas.map((ruta) => {
        const { puntuacion } = verificarSeguridadLogaritmica(
          ruta.coordenadas,
          zonasPeligrosas
        );
        return {
          ...ruta,
          puntuacion,
          seguridad:
            puntuacion > 75
              ? "seguro"
              : puntuacion > 50
              ? "moderado"
              : "peligroso",
        };
      });

      setCoordenadasRutaAlternativas(rutasAlternativas);
    } catch (error) {
      console.error("Error al obtener rutas alternativas:", error);
      Alert.alert("Error", "No se pudieron obtener rutas alternativas");
    }
  };

  const seleccionarRutaAlternativa = (ruta) => {
    setCoordenadasRuta(ruta.coordenadas);
    setSeguridadRuta(ruta.seguridad.nivel);
    setPuntuacionSeguridad(ruta.seguridad.puntuacion);
    setMostrarRutasAlternativas(false);
  };

  const agruparZonasPorTipo = useCallback((zonas) => {
    return zonas.reduce((acumulador, zona) => {
      const tipo = zona.tipo || "DESCONOCIDO";
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
    if (!rutaGenerada) {
      // Solo animar si la ruta no está generada
      Animated.spring(markerAnimatedValue, {
        toValue: 1,
        friction: 5, // Más natural
        useNativeDriver: true,
      }).start();

      setIsDragging(true); // El usuario está arrastrando el mapa

      if (fadeAnim._value !== 0) {
        Animated.timing(fadeAnim, {
          toValue: 0, // Ocultar
          duration: 10, // Aumenta la duración para una transición más suave
          useNativeDriver: true,
        }).start();
      }
    }
  }, [rutaGenerada, fadeAnim, markerAnimatedValue]);

  const onRegionChangeComplete = useCallback(
    (region) => {
      if (!rutaGenerada) {
        // Evitar cambios si la ruta ya fue generada
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
    },
    [seleccionandoOrigen, geocodificarInversoCoordenada, rutaGenerada]
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
        message: "Descarga nuestra app de rutas seguras: [Enlace a tu app]",
      });
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error al compartir el enlace de la app");
    }
  }, []);

  const compartirEstadisticas = useCallback(async () => {
    try {
      await Share.share({
        message: `Estadísticas de seguridad:\nNivel de seguridad: ${seguridadRuta}\nPuntuación: ${puntuacionSeguridad}`,
      });
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error al compartir las estadísticas");
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
          to: fileUri,
        });

        console.log("Archivo copiado a:", fileUri);

        // Verificar si el archivo existe
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (!fileInfo.exists) {
          console.error("El archivo no existe:", fileUri);
          Alert.alert("Error", "No se pudo generar el screenshot");
          return;
        }

        console.log("Iniciando compartir con URI:", fileUri);

        // Verificar si compartir está disponible
        if (!(await Sharing.isAvailableAsync())) {
          // Si compartir no está disponible, intentamos guardar en la galería
          const { status } = await MediaLibrary.requestPermissionsAsync();
          if (status === "granted") {
            await MediaLibrary.saveToLibraryAsync(fileUri);
            Alert.alert("Éxito", "La imagen se ha guardado en tu galería");
          } else {
            Alert.alert(
              "Error",
              "No se pudo guardar la imagen. Permisos denegados."
            );
          }
          return;
        }

        // Compartir el archivo
        await Sharing.shareAsync(fileUri, {
          mimeType: "image/jpeg",
          dialogTitle: "Compartir Ruta Segura",
        });

        // Opcional: Eliminar el archivo temporal después de compartir
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
      } catch (error) {
        console.error(
          "Error detallado al capturar o compartir screenshot:",
          error
        );
        Alert.alert(
          "Error",
          "No se pudo compartir el screenshot de la ruta: " + error.message
        );
      }
    } else {
      console.error("mapShotRef no está disponible");
      Alert.alert("Error", "No se pudo acceder a la referencia del mapa");
    }
  }, []);
  

  const obtenerUbicacionActual = useCallback(async () => {
    setLoading(true);

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso de ubicación denegado");
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
      console.error("Error al obtener la ubicación actual:", error);
    } finally {
      setLoading(false);
    }
  }, [actualizarRegionMapa, geocodificarInversoCoordenada]);

  const manejarPresionMarcador = useCallback((zona) => {
    setZonaSeleccionada(zona);
    setModalVisible(true);
  }, []);

  const manejarFinArrastreMarcador = useCallback(
    (coordenada, setCoordenada, setInput) => {
      setCoordenada(coordenada);
      actualizarRegionMapa(coordenada);
      geocodificarInversoCoordenada(coordenada, setInput);
    },
    [actualizarRegionMapa, geocodificarInversoCoordenada]
  );

  const manejarCambioInput = useCallback(
    async (texto, esOrigen) => {
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
        console.error("Error al manejar el cambio de input:", error);
      } finally {
        setLoading(false);
      }
    },
    [actualizarRegionMapa, geocodificarDireccion]
  );

  const manejarPresionMapa = useCallback(
    (e) => {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      const coordenada = { latitude, longitude };

      if (!destino) {
        // Solo permite mover el marcador si el destino aún no se ha establecido
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
    },
    [
      seleccionandoOrigen,
      actualizarRegionMapa,
      geocodificarInversoCoordenada,
      destino,
    ]
  );

  const iniciarAnimacionSalto = useCallback(() => {
    if (!destino) {
      // Solo realiza la animación si el destino no ha sido seleccionado
      Animated.spring(markerAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [destino]);

  const finalizarAnimacionSalto = useCallback(() => {
    if (!destino) {
      // Solo finaliza la animación si el destino no ha sido seleccionado
      Animated.spring(markerAnim, {
        toValue: 0,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [destino]);

  const obtenerRutaSegura = async () => {
    setLoading(true);
    try {
      const respuesta = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origen.latitude},${origen.longitude}&destination=${destino.latitude},${destino.longitude}&mode=${modoViaje}&alternatives=true&key=${GOOGLE_MAPS_APIKEY}`
      );
      const datos = await respuesta.json();

      if (datos.status === "OK" && datos.routes.length > 0) {
        const rutasEvaluadas = datos.routes
          .map((ruta) => {
            const puntos = decodificarPolilinea(ruta.overview_polyline.points);
            const { puntuacion } = verificarSeguridadLogaritmica(
              puntos,
              zonasPeligrosas
            );
            return { puntos, puntuacion };
          })
          .sort((a, b) => b.puntuacion - a.puntuacion); // Ordenar por puntuación

        const rutaMasSegura = rutasEvaluadas[0];
        if (rutaMasSegura) {
          setCoordenadasRuta(rutaMasSegura.puntos);
          setPuntuacionSeguridad(rutaMasSegura.puntuacion);
          setSeguridadRuta(
            rutaMasSegura.puntuacion > 75
              ? "seguro"
              : rutaMasSegura.puntuacion > 50
              ? "moderado"
              : "peligroso"
          );
          ajustarVistaRuta(rutaMasSegura.puntos);
        }
      }
    } catch (error) {
      console.error("Error al obtener ruta segura:", error);
      Alert.alert("Error", "No se pudo obtener una ruta alternativa segura");
    } finally {
      setLoading(false);
    }
  };

  const obtenerRutaRapida = async () => {
    setLoading(true);
    try {
      // Para la ruta rápida, usamos optimize:true y evitamos waypoints
      const respuesta = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origen.latitude},${origen.longitude}&destination=${destino.latitude},${destino.longitude}&mode=${modoViaje}&optimize=true&key=${GOOGLE_MAPS_APIKEY}`
      );
      const datos = await respuesta.json();

      if (datos.status === "OK" && datos.routes.length > 0) {
        // Tomamos la primera ruta que será la más rápida
        const puntos = decodificarPolilinea(
          datos.routes[0].overview_polyline.points
        );
        const { puntuacion } = verificarSeguridadLogaritmica(
          puntos,
          zonasPeligrosas
        );

        setCoordenadasRuta(puntos);
        setPuntuacionSeguridad(puntuacion);
        setSeguridadRuta(
          puntuacion > 75
            ? "seguro"
            : puntuacion > 50
            ? "moderado"
            : "peligroso"
        );
        ajustarVistaRuta(puntos);
      }
    } catch (error) {
      console.error("Error al obtener ruta rápida:", error);
      Alert.alert("Error", "No se pudo obtener la ruta más rápida");
    } finally {
      setLoading(false);
    }
  };

  const obtenerRutaEquilibrada = async () => {
    setLoading(true);
    try {
      // Para la ruta equilibrada, solicitamos múltiples alternativas
      const respuesta = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origen.latitude},${origen.longitude}&destination=${destino.latitude},${destino.longitude}&mode=${modoViaje}&alternatives=true&key=${GOOGLE_MAPS_APIKEY}`
      );
      const datos = await respuesta.json();

      if (datos.status === "OK" && datos.routes.length > 0) {
        // Evaluamos todas las rutas disponibles
        const rutasEvaluadas = datos.routes.map((ruta) => {
          const puntos = decodificarPolilinea(ruta.overview_polyline.points);
          const { puntuacion } = verificarSeguridadLogaritmica(
            puntos,
            zonasPeligrosas
          );
          const tiempoViaje = ruta.legs[0].duration.value;
          const distancia = ruta.legs[0].distance.value;

          // Calculamos un score combinado (seguridad y eficiencia)
          const scoreSeguridad = puntuacion / 100;
          const scoreEficiencia = 1 - tiempoViaje / (30 * 60); // Normalizado a 30 minutos
          const scoreTotal = scoreSeguridad * 0.5 + scoreEficiencia * 0.5;

          return {
            puntos,
            puntuacion,
            tiempoViaje,
            distancia,
            scoreTotal,
          };
        });

        // Ordenamos por score total y tomamos la mejor ruta equilibrada
        rutasEvaluadas.sort((a, b) => b.scoreTotal - a.scoreTotal);
        const rutaEquilibrada = rutasEvaluadas[0];

        setCoordenadasRuta(rutaEquilibrada.puntos);
        setPuntuacionSeguridad(rutaEquilibrada.puntuacion);
        setSeguridadRuta(
          rutaEquilibrada.puntuacion > 75
            ? "seguro"
            : rutaEquilibrada.puntuacion > 50
            ? "moderado"
            : "peligroso"
        );
        ajustarVistaRuta(rutaEquilibrada.puntos);
      }
    } catch (error) {
      console.error("Error al obtener ruta equilibrada:", error);
      Alert.alert("Error", "No se pudo obtener una ruta equilibrada");
    } finally {
      setLoading(false);
    }
  };

  const sonRutasSimilares = (ruta1, ruta2) => {
    // Compara puntos clave de las rutas
    const puntosClaveRuta1 = ruta1.coordenadas[0];
    const puntosClaveRuta2 = ruta2.coordenadas[0];

    // Calcula la distancia entre puntos
    const distancia = Math.sqrt(
      Math.pow(puntosClaveRuta1.latitude - puntosClaveRuta2.latitude, 2) +
        Math.pow(puntosClaveRuta1.longitude - puntosClaveRuta2.longitude, 2)
    );

    // Si la distancia es menor a cierto umbral, las rutas son similares
    return distancia < 0.0005; // Ajusta este valor según necesites
  };

  const validarRutaUnica = (nuevaRuta, rutasExistentes) => {
    return !rutasExistentes.some((rutaExistente) =>
      sonRutasSimilares(nuevaRuta, rutaExistente)
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#333" />
      <View style={styles.topBar} />
      <ViewShot
        ref={mapShotRef}
        options={{ format: "jpg", quality: 0.8, result: "tmpfile" }}
        style={StyleSheet.absoluteFillObject}
      >
        <View style={styles.contenedor}>
          {!gpsEnabled && (
            <TouchableOpacity
              style={styles.gpsNotification}
              onPress={handleEnableLocation}
            >
              <Text style={styles.gpsNotificationText}>
                No podemos encontrarte en el mapa. Haz clic aquí para acceder a
                tu ubicación.
              </Text>
            </TouchableOpacity>
          )}
          <MapView
            ref={mapRef}
            style={styles.mapa}
            region={regionMapa}
            onRegionChange={!rutaGenerada ? onRegionChange : undefined}
            onRegionChangeComplete={
              !rutaGenerada ? onRegionChangeComplete : undefined
            }
          >
            {/* Zonas Peligrosas - Círculos e Íconos */}
            {zonasPeligrosas.map((zona) => (
              <React.Fragment key={zona.id}>
                <Circle
                  center={{
                    latitude: zona.latitude,
                    longitude: zona.longitude,
                  }}
                  radius={zona.umbral}
                  fillColor="rgba(255, 0, 0, 0.1)"
                  strokeColor="rgba(255, 0, 0, 0.4)"
                  strokeWidth={2}
                />
                <Marker
                  coordinate={{
                    latitude: zona.latitude,
                    longitude: zona.longitude,
                  }}
                  title={zona.descripcion}
                >
                  <Image
                    source={obtenerIconoMarcador(zona.tipo)}
                    style={{ width: 35, height: 35, resizeMode: "contain" }}
                  />
                </Marker>
              </React.Fragment>
            ))}

            {/* Marcadores de Origen y Destino */}
            {origen && (
              <Marker coordinate={origen} anchor={{ x: 0.5, y: 1 }}>
                <Image
                  source={require("../assets/inicio.png")}
                  style={styles.markerImage}
                />
              </Marker>
            )}

            {destino && (
              <Marker coordinate={destino} anchor={{ x: 0.5, y: 1 }}>
                <Image
                  source={require("../assets/destino.png")}
                  style={styles.markerImage}
                />
              </Marker>
            )}

            {/* Sistema de Rutas */}
            {coordenadasRuta.length > 0 && (
              <>
                {/* Ruta Principal */}
                {colorearRuta(coordenadasRuta, zonasPeligrosas).map(
                  (segmento, index) => (
                    <Polyline
                      key={`main-${index}`}
                      coordinates={segmento.coordenadas}
                      strokeColor={segmento.color}
                      strokeWidth={4}
                      zIndex={1}
                    />
                  )
                )}

                {/* Rutas Alternativas */}
                {mostrarRutasAlternativas &&
                  coordenadasRutaAlternativas.map((ruta, rutaIndex) =>
                    colorearRuta(ruta.coordenadas, zonasPeligrosas).map(
                      (segmento, segIndex) => (
                        <Polyline
                          key={`alt-${rutaIndex}-${segIndex}`}
                          coordinates={segmento.coordenadas}
                          strokeColor={segmento.color}
                          strokeWidth={4}
                          strokeDashPattern={[20, 15]}
                          opacity={0.8}
                          zIndex={0}
                          tappable={true}
                          onPress={() => seleccionarRutaAlternativa(ruta)}
                        />
                      )
                    )
                  )}
              </>
            )}
          </MapView>

          {!rutaGenerada && (
            <View style={styles.markerFixed}>
              <Animated.Image
                source={require("../assets/inicio.png")}
                style={[
                  styles.marker,
                  {
                    transform: [
                      {
                        translateY: markerAnimatedValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -10],
                        }),
                      },
                    ],
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
              <Text style={styles.textoModal}>
                Zonas peligrosas detectadas: {zonasPeligrosasEncontradas.length}
              </Text>
              <ScrollView>
                {zonasPeligrosasEncontradas.length > 0 ? (
                  Object.entries(
                    agruparZonasPorTipo(zonasPeligrosasEncontradas)
                  ).map(([tipo, count], index) => (
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
              <TouchableOpacity
                style={styles.modalOption}
                onPress={compartirEnlaceApp}
              >
                <Text>Compartir enlace de la app</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={compartirEstadisticas}
              >
                <Text>Compartir estadísticas de seguridad</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={compartirScreenshot}
              >
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
            <View
              style={[
                styles.topButtonsMovable,
                !gpsEnabled && styles.topButtonsWithNotification,
              ]}
            >
              <TouchableOpacity
                style={styles.botonMenu}
                onPress={abrirMenuLateral}
              >
                <Ionicons name="menu" size={30} color="#FFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botonShare}
                onPress={abrirModalCompartir}
              >
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
                style={[
                  styles.indicadorSeguridad,
                  {
                    backgroundColor:
                      seguridadRuta === "peligroso"
                        ? "#FFCCCC"
                        : seguridadRuta === "moderado"
                        ? "#FFF5CC"
                        : "#CCFFCC",
                    borderWidth: 1,
                    borderColor: "blue",
                    position: "absolute",
                    bottom: 240,
                    left: "5%",
                    right: "5%",
                    zIndex: 10,
                  },
                ]}
                onPress={abrirModalPeligros}
              >
                <Text
                  style={{
                    color:
                      seguridadRuta === "peligroso"
                        ? "#FF0000"
                        : seguridadRuta === "moderado"
                        ? "#FFA500"
                        : "#00FF00",
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                >
                  Nivel de seguridad: {seguridadRuta}
                </Text>
                <Text style={{ fontSize: 14 }}>
                  Puntuación de seguridad: {puntuacionSeguridad}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.input}
                onPress={() => {
                  setSeleccionandoOrigen(true); // Indica que estamos seleccionando el origen
                  openPanel(); // Abre el panel
                }}
              >
                <Text style={styles.textPlaceholder}>
                  {inputOrigen || "¿Dónde estamos?"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.input}
                onPress={() => {
                  setSeleccionandoOrigen(false); // Indica que estamos seleccionando el destino
                  openPanel(); // Abre el panel
                }}
              >
                <Text style={styles.textPlaceholder}>
                  {inputDestino || "¿A dónde vamos?"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Panel de entrada de ruta */}
          {isPanelOpen && (
            <Animated.View
              style={[
                styles.panel,
                { transform: [{ translateY: panelTranslateY }] },
              ]}
            >
              <RouteInputPanel
                onClose={closePanel} // Cierra el panel
                setOrigenInput={(texto) =>
                  manejarCambioInputDesdePanel(texto, true)
                } // Actualiza origen
                setDestinoInput={(texto) =>
                  manejarCambioInputDesdePanel(texto, false)
                } // Actualiza destino
                origenValue={inputOrigen}
                destinoValue={inputDestino}
              />
            </Animated.View>
          )}
        </View>
      </ViewShot>
      {origen && destino ? (
        <View style={styles.botonesRutas}>
          <TouchableOpacity
            style={[
              styles.botonRuta,
              mostrarRutaSegura && styles.botonRutaActivo,
            ]}
            onPress={async () => {
              if (!mostrarRutaSegura) {
                setMostrarRutaSegura(true);
                await obtenerRutaSegura();
              } else {
                setMostrarRutaSegura(false);
                await obtenerRuta(); // Volver a la ruta principal/rápida
              }
            }}
          >
            <Ionicons
              name="shield"
              size={20}
              color="#FFF"
              style={{ marginRight: 5 }}
            />
            <Text style={styles.textoBotonRuta}>
              {mostrarRutaSegura ? "Ruta Principal" : "Ruta Segura"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  botonesRutas: {
    position: "absolute",
    bottom: 100,
    right: 20,
    gap: 10,
  },
  botonRuta: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  botonRutaActivo: {
    backgroundColor: "#2196F3",
  },
  textoBotonRuta: {
    color: "#FFF",
    marginLeft: 8,
    fontWeight: "500",
  },
  botonRutasAlternativas: {
    position: "absolute",
    bottom: 100,
    right: 20,
    backgroundColor: "#1a1a1a",
    padding: 12,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  textoBotonRutas: {
    color: "#FFF",
    fontWeight: "500",
    marginLeft: 8,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  textInput: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
  },

  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  panelTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#444",
    borderRadius: 15,
    padding: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  searchInput: {
    backgroundColor: "#333",
    color: "#fff",
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  mapOption: {
    color: "#00aaff",
    marginTop: 20,
    fontSize: 16,
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
  },
  markerImage: {
    width: 30,
    height: 40,
    resizeMode: "contain", // Asegúrate de que la imagen se ajuste bien
  },
  loadingMarker: {
    width: 40,
    height: 40,
    borderRadius: 20, // Hacerlo redondo
    backgroundColor: "#2196F3", // Color de fondo para el estado de carga
    alignItems: "center",
    justifyContent: "center",
  },
  loadedMarker: {
    width: 40,
    height: 40,
    borderRadius: 20, // Hacerlo redondo
    backgroundColor: "#4CAF50", // Cambiar el color cuando se cargue
    alignItems: "center",
    justifyContent: "center",
  },
  markerText: {
    color: "#fff",
    fontSize: 10,
    textAlign: "center",
  },
  topBar: {
    height: 3,
    backgroundColor: "#333",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  // Añade el contenedor de los botones superiores
  topButtonsContainer: {
    position: "absolute",
    top: hp("2%"), // Posición base
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: wp("3%"),
  },
  // Nuevo contenedor para los botones de menú y compartir
  topButtonsMovable: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: wp("50%"), // Asegura que solo los botones de menú y compartir estén en este contenedor
  },
  topButtonsWithNotification: {
    top: hp("9%"), // Ajusta la posición solo cuando la notificación esté visible
  },
  modalView: {
    margin: wp("5%"),
    backgroundColor: "white",
    borderRadius: 20,
    padding: wp("5%"),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: hp("2%"),
    textAlign: "center",
    fontSize: wp("5%"),
    fontWeight: "bold",
  },
  modalOption: {
    backgroundColor: "#F0F0F0",
    padding: wp("4%"),
    borderRadius: 10,
    width: "100%",
    marginBottom: hp("2%"),
    alignItems: "center",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  drawer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: wp("5%"),
  },
  drawerTitle: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    marginBottom: hp("3%"),
  },
  drawerItem: {
    padding: wp("4%"),
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  shareModalView: {
    margin: wp("5%"),
    backgroundColor: "white",
    borderRadius: 20,
    padding: wp("5%"),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  shareModalTitle: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    marginBottom: hp("2%"),
  },
  markerFixed: {
    left: "52.39%",
    marginLeft: -24,
    marginTop: -48,
    position: "absolute",
    top: "32.8%",
  },
  marker: {
    height: 30,
    width: 30,
  },
  closeButton: {
    backgroundColor: "#2196F3",
    borderRadius: 20,
    padding: wp("3%"),
    elevation: 2,
    marginTop: hp("2%"),
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  contenedor: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  gpsNotification: {
    backgroundColor: "#FFA500", // Naranja
    padding: 10,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Distribuir el texto y el botón
    paddingHorizontal: 20,
    height: 60, // Altura fija para la notificación
  },
  gpsNotificationText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  mapa: {
    width: wp("100%"),
    height: hp("60%"),
  },
  botonMenu: {
    backgroundColor: "#333",
    padding: wp("3%"),
    borderRadius: 25,
  },
  botonShare: {
    backgroundColor: "#333",
    right: wp("-45%"),
    padding: wp("3%"),
    borderRadius: 25,
  },
  // Mantiene el botón GPS fijo
  botonGPS: {
    position: "absolute",
    top: hp("48%"), // No será afectado por la notificación
    right: wp("5%"),
    zIndex: 1,
    backgroundColor: "#333",
    padding: wp("3%"),
    borderRadius: 25,
  },
  panel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // Ajusta la altura según sea necesario
    height: "100%", // o un valor fijo como 300
    zIndex: 100,
  },
  contenedorInput: {
    padding: wp("5%"),
    backgroundColor: "white",
    position: "absolute",
    bottom: 0,
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    height: hp("8%"), // Tamaño accesible en diferentes pantallas
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: hp("5%"),
    paddingHorizontal: wp("3%"),
    borderRadius: 10,
    fontSize: wp("4.5%"), // Texto más grande
  },
  indicadorSeguridad: {
    padding: wp("3%"),
    alignItems: "center",
    position: "absolute",
    left: "5%",
    right: "5%",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10, // Asegura que esté por encima del mapa y otros elementos
  },
  textoIndicador: {
    color: "#333",
    fontSize: wp("4%"), // Texto adaptado al tamaño de pantalla
    fontWeight: "bold",
  },
  vistaModal: {
    margin: wp("5%"),
    backgroundColor: "white",
    borderRadius: 20,
    padding: wp("5%"),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  botonCerrar: {
    backgroundColor: "#2196F3",
    borderRadius: 20,
    padding: wp("3%"),
    elevation: 2,
    marginTop: hp("2%"),
  },
  textoBotonCerrar: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
