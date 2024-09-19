import * as Location from 'expo-location';
import { GOOGLE_MAPS_APIKEY } from '@env';
import React, { useMemo } from 'react';
export const calcularDistancia = (punto1, punto2) => {
    const R = 6371e3; // Radio de la tierra en metros
    const φ1 = punto1.latitude * Math.PI / 180;
    const φ2 = punto2.latitude * Math.PI / 180;
    const Δφ = (punto2.latitude - punto1.latitude) * Math.PI / 180;
    const Δλ = (punto2.longitude - punto1.longitude) * Math.PI / 180;
  
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c;
  };

  export const decodificarPolilinea = (t) => {
    if (!t || typeof t !== 'string') {
        console.error('Polilínea inválida:', t);
        return [];
    }

    let index = 0, lat = 0, lng = 0;
    const coordenadas = [];

    try {
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
    } catch (error) {
        console.error('Error al decodificar la polilínea:', error);
        return [];
    }

    if (coordenadas.length === 0) {
        console.error('No se pudieron decodificar las coordenadas de la polilínea.');
    }

    return coordenadas;
};

  
  export const obtenerIconoMarcador = (tipo) => {
    const iconos = {
      ACOSO: require('../assets/ACOSO_Mesa_de_trabajo_1.png'),
      CRIMEN: require('../assets/CRIMEN_Mesa_de_trabajo_1.png'),
      DROGAS: require('../assets/DROGAS_Mesa_de_trabajo_1.png'),
      ROBO_A_CASA: require('../assets/ROBO_A_CASA_Mesa_de_trabajo_1.png'),
      ROBO_A_COMERCIO: require('../assets/ROBO_A_COMERCIO_Mesa_de_trabajo_1.png'),
      ROBO_A_PERSONA: require('../assets/ROBO_A_PERSONA_Mesa_de_trabajo_1.png'),
      ROBO_A_VEHICULO: require('../assets/ROBO_A_VEHICULO_Mesa_de_trabajo_1.png'),
      SOSPECHOSO: require('../assets/SOSPECHOSO_Mesa_de_trabajo_1.png'),
      VANDALISMO: require('../assets/VANDALISMO_Mesa_de_trabajo_1.png'),
    };
    return iconos[tipo] || require('../assets/VANDALISMO_Mesa_de_trabajo_1.png');
  };
  
  export const geocodificarInversoCoordenada = async (coordenada, setInput) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordenada.latitude},${coordenada.longitude}&key=${GOOGLE_MAPS_APIKEY}`;
      const respuesta = await fetch(url);
      const datos = await respuesta.json();
  
      if (datos.status === 'OK' && datos.results.length > 0) {
        setInput(datos.results[0].formatted_address);
      } else {
        console.error('No se encontraron resultados para la geocodificación inversa');
        // Usar Alert aquí
        Alert.alert('Error', 'No se pudo obtener la dirección para las coordenadas dadas');
      }
    } catch (error) {
      console.error('Error en la geocodificación inversa:', error);
      // Usar Alert aquí
      Alert.alert('Error', 'Ocurrió un error al obtener la dirección');
    }
  };
  
  export const geocodificarDireccion = async (direccion) => {
    if (!direccion) {
      Alert.alert('Error', 'Por favor, ingrese una dirección válida.');
      return null;
    }
  
    try {
      const respuesta = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(direccion)}&key=${process.env.GOOGLE_MAPS_APIKEY}`
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
  };
  
  export const colorearRuta = (coordenadasRuta, zonasPeligrosas) => {
    const segmentosColoreados = [];

    // Verificar que coordenadasRuta es un array y tiene al menos dos puntos
    if (!Array.isArray(coordenadasRuta) || coordenadasRuta.length < 2) {
        //console.error('Ruta inválida:', coordenadasRuta);
        return segmentosColoreados; // Retorna un array vacío
    }

    for (let i = 0; i < coordenadasRuta.length - 1; i++) {
        const puntoInicio = coordenadasRuta[i];
        const puntoFin = coordenadasRuta[i + 1];
        let puntuacionPeligroTotal = 0;

        // Verificar que los puntos tienen latitud y longitud válidas
        if (
            !puntoInicio ||
            !puntoFin ||
            typeof puntoInicio.latitude !== 'number' ||
            typeof puntoInicio.longitude !== 'number' ||
            typeof puntoFin.latitude !== 'number' ||
            typeof puntoFin.longitude !== 'number'
        ) {
            console.error('Puntos inválidos para el segmento:', puntoInicio, puntoFin);
            continue; // Saltar a la siguiente iteración si hay puntos inválidos
        }

        // Calcular la puntuación de peligro para el segmento actual
        zonasPeligrosas.forEach(zona => {
            const distanciaInicio = calcularDistancia(puntoInicio, zona);
            const distanciaFin = calcularDistancia(puntoFin, zona);
            if (distanciaInicio < zona.umbral || distanciaFin < zona.umbral) {
                puntuacionPeligroTotal += zona.peso;
            }
        });

        // Determinar el color del segmento según la puntuación de peligro
        let colorSegmento = '#00FF00'; // Verde por defecto
        if (puntuacionPeligroTotal > 50) {
            colorSegmento = '#FF0000'; // Rojo
        } else if (puntuacionPeligroTotal > 20) {
            colorSegmento = '#FFA500'; // Naranja
        }

        // Añadir el segmento coloreado a la lista
        segmentosColoreados.push({
            coordenadas: [puntoInicio, puntoFin],
            color: colorSegmento,
            peligro: puntuacionPeligroTotal, // Guardamos el nivel de peligro por si es necesario
        });
    }

    return segmentosColoreados;
};

export const RenderRuta = ({ coordenadasRuta, zonasPeligrosas }) => {
  const segmentosColoreados = useMemo(() => {
    if (coordenadasRuta.length > 0) {
      //console.log('Coordenadas de ruta:', coordenadasRuta);
      //console.log('Zonas peligrosas:', zonasPeligrosas);
      const resultado = colorearRuta(coordenadasRuta, zonasPeligrosas);
      //console.log('Resultado de colorearRuta:', resultado);
      if (!resultado || !resultado.segmentos) {
        //console.error('colorearRuta no devolvió un objeto válido');
        return [];
      }
      return resultado.segmentos;
    }
    return [];
  }, [coordenadasRuta, zonasPeligrosas]);

  if (!segmentosColoreados || !Array.isArray(segmentosColoreados)) {
    console.error('segmentosColoreados no es un array válido:', segmentosColoreados);
    return null;
  }

  return (
    <>
      {segmentosColoreados.map((segmento, index) => {
        if (!segmento || !segmento.coordenadas || !Array.isArray(segmento.coordenadas)) {
          console.error('Segmento inválido:', segmento);
          return null;
        }
        return (
          <Polyline
            key={index}
            coordinates={segmento.coordenadas}
            strokeColor={segmento.color || '#000000'}
            strokeWidth={3}
          />
        );
      })}
    </>
  );
};