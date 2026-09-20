/** Autorización de edición de ticket compartida entre pantallas de mesa. */
let autorizadoSesion = false;

export const EdicionTicketStore = {
  isAutorizado: () => autorizadoSesion,
  setAutorizado: (valor) => {
    autorizadoSesion = !!valor;
  },
  clear: () => {
    autorizadoSesion = false;
  },
};
