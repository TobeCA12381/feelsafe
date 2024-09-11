import { calcularDistancia } from './mapUtils';

export const verificarSeguridadLogaritmica = (coordenadasRuta, zonasPeligrosas) => {
  let puntuacionPeligroTotal = 0;
  let zonasPeligrosasEncontradas = [];

  coordenadasRuta.forEach((punto) => {
    zonasPeligrosas.forEach(zona => {
      const distancia = calcularDistancia(punto, zona);
      if (distancia < zona.umbral) {
        if (!zonasPeligrosasEncontradas.some(z => z.id === zona.id)) {
          puntuacionPeligroTotal += zona.peso;
          zonasPeligrosasEncontradas.push(zona);
        }
      }
    });
  });

  const porcentajeSeguridad = Math.max(0, 100 - 100 * (Math.log(puntuacionPeligroTotal + 1) / Math.log(zonasPeligrosas.length * 50 + 1)));
  const puntuacion = Math.round(porcentajeSeguridad);

  return {
    puntosPeligrosos: zonasPeligrosasEncontradas,
    puntuacion: puntuacion
  };
};

export const colorearRuta = (coordenadasRuta, zonasPeligrosas) => {
  const segmentosColoreados = [];
  let zonasPeligrosasUnicas = new Set();

  for (let i = 0; i < coordenadasRuta.length - 1; i++) {
    const puntoInicio = coordenadasRuta[i];
    const puntoFin = coordenadasRuta[i + 1];
    let puntuacionPeligroTotal = 0;

    zonasPeligrosas.forEach(zona => {
      const distanciaInicio = calcularDistancia(puntoInicio, zona);
      const distanciaFin = calcularDistancia(puntoFin, zona);
      if (distanciaInicio < zona.umbral || distanciaFin < zona.umbral) {
        puntuacionPeligroTotal += zona.peso;
        zonasPeligrosasUnicas.add(zona.id);
      }
    });

    let colorSegmento = '#00FF00';
    if (puntuacionPeligroTotal > 50) {
      colorSegmento = '#FF0000';
    } else if (puntuacionPeligroTotal > 20) {
      colorSegmento = '#FFA500';
    }

    segmentosColoreados.push({
      coordenadas: [puntoInicio, puntoFin],
      color: colorSegmento,
    });
  }

  return segmentosColoreados;
};