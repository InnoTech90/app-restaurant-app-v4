// Store en memoria para transferir la selección de complementos
// de DetalleComplemento de vuelta a DetalleArticulo sin necesidad de state manager.
let _seleccion = null;

export const ComplementosStore = {
    setSeleccion: (data) => { _seleccion = data; },
    getSeleccion: () => _seleccion,
    clear: () => { _seleccion = null; },
};
