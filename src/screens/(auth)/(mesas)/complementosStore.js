// Store en memoria para transferir complementos entre pantallas.
let _seleccion = null;
let _seleccionInicial = null;
let _gruposDisponibles = null;

export const ComplementosStore = {
  setSeleccion: (data) => {
    _seleccion = data;
  },
  getSeleccion: () => _seleccion,
  clear: () => {
    _seleccion = null;
  },

  setSeleccionInicial: (map) => {
    _seleccionInicial = map;
  },
  getSeleccionInicial: () => _seleccionInicial,
  clearSeleccionInicial: () => {
    _seleccionInicial = null;
  },

  setGruposDisponibles: (grupos) => {
    _gruposDisponibles = grupos;
  },
  getGruposDisponibles: () => _gruposDisponibles,
  clearGruposDisponibles: () => {
    _gruposDisponibles = null;
  },
};
