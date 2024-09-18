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

