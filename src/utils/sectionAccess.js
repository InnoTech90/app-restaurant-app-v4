const seccionesAutorizadas = new Set();

export const autorizarSeccion = (seccion) => {
  seccionesAutorizadas.add(seccion);
};

export const revocarTodasLasSecciones = () => {
  seccionesAutorizadas.clear();
};

export const revocarOtrasSecciones = (seccionActual) => {
  [...seccionesAutorizadas].forEach((seccion) => {
    if (seccion !== seccionActual) {
      seccionesAutorizadas.delete(seccion);
    }
  });
};

export const tieneAccesoSeccion = (seccion) =>
  seccionesAutorizadas.has(seccion);

export const autorizarVentas = () => autorizarSeccion("ventas");
export const tieneAccesoVentas = () => tieneAccesoSeccion("ventas");
