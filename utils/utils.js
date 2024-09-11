export const mostrarAlerta = (titulo, mensaje) => {
    Alert.alert(titulo, mensaje);
  };
  
  export const formatearFecha = (fecha) => {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return fecha.toLocaleDateString('es-ES', opciones);
  };
  
  export const generarIdUnico = () => {
    return Math.random().toString(36).substr(2, 9);
  };
  