const seccionesAutorizadas = new Set();

export const autorizarSeccion = (seccion) => {
  seccionesAutorizadas.add(seccion);
};

export const revocarSeccion = (seccion) => {
  seccionesAutorizadas.delete(seccion);
};

export const revocarTodasLasSecciones = () => {
  seccionesAutorizadas.clear();
};

export const revocarOtrasSecciones = (seccionActual) => {
  for (const seccion of seccionesAutorizadas) {
    if (seccion !== seccionActual) {
      seccionesAutorizadas.delete(seccion);
    }
  }
};

export const tieneAccesoSeccion = (seccion) =>
  seccionesAutorizadas.has(seccion);

export const autorizarVentas = () => autorizarSeccion("ventas");
export const revocarAccesoVentas = () => revocarSeccion("ventas");
export const tieneAccesoVentas = () => tieneAccesoSeccion("ventas");
