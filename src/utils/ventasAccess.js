let ventasAutorizado = false;

export const autorizarVentas = () => {
  ventasAutorizado = true;
};

export const revocarAccesoVentas = () => {
  ventasAutorizado = false;
};

export const tieneAccesoVentas = () => ventasAutorizado;
