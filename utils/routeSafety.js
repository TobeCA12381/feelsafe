import { calcularDistancia } from './mapUtils';

export const verificarSeguridadLogaritmica = (coordenadasRuta, zonasPeligrosas) => {
  if (!Array.isArray(coordenadasRuta) || coordenadasRuta.length < 2) {
    console.error('coordenadasRuta inválidas:', coordenadasRuta);
    return { puntosPeligrosos: [], puntuacion: 100, segmentosPeligrosos: [] };
  }

  let longitudTotal = 0;
  let longitudPeligrosa = 0;
  let zonasPeligrosasEncontradas = new Set();
  let segmentosPeligrosos = [];

  for (let i = 0; i < coordenadasRuta.length - 1; i++) {
    const puntoInicio = coordenadasRuta[i];
    const puntoFin = coordenadasRuta[i + 1];
    const longitudSegmento = calcularDistancia(puntoInicio, puntoFin);
    longitudTotal += longitudSegmento;

    let peligroSegmento = 0;
    let zonasPeligrosasSegmento = new Set();

    zonasPeligrosas.forEach(zona => {
      const distanciaInicio = calcularDistancia(puntoInicio, zona);
      const distanciaFin = calcularDistancia(puntoFin, zona);
      
      if (distanciaInicio < zona.umbral || distanciaFin < zona.umbral) {
        peligroSegmento += zona.peso;
        zonasPeligrosasSegmento.add(zona.id);
        zonasPeligrosasEncontradas.add(zona.id);
      }
    });

    if (peligroSegmento > 0) {
      longitudPeligrosa += longitudSegmento;
      segmentosPeligrosos.push({
        inicio: puntoInicio,
        fin: puntoFin,
        longitud: longitudSegmento,
        peligro: peligroSegmento,
        zonas: Array.from(zonasPeligrosasSegmento)
      });
    }
  }

  // Calculamos el porcentaje de la ruta que es peligrosa
  const porcentajeRutaPeligrosa = (longitudPeligrosa / longitudTotal) * 100;

  // Calculamos la intensidad del peligro basada en las zonas encontradas
  const intensidadPeligro = Math.min(100, (zonasPeligrosasEncontradas.size / zonasPeligrosas.length) * 100);

  // Combinamos ambos factores para obtener la puntuación final
  const puntuacion = Math.max(0, Math.round(100 - (porcentajeRutaPeligrosa * 0.7 + intensidadPeligro * 0.3)));

  const puntosPeligrosos = zonasPeligrosas.filter(zona => zonasPeligrosasEncontradas.has(zona.id));

  return {
    puntosPeligrosos,
    puntuacion,
    segmentosPeligrosos,
    detalles: {
      longitudTotal,
      longitudPeligrosa,
      porcentajeRutaPeligrosa,
      zonasPeligrosasEncontradas: zonasPeligrosasEncontradas.size,
      intensidadPeligro
    }
  };
};