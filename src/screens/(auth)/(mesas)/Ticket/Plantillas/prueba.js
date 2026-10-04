// Plantilla del ticket de prueba de impresora.
// construirLineasPrueba es la estructura: el preview y la impresora leen estas líneas.

const texto = (valor) => {
    const limpio = String(valor ?? '').trim();
    return limpio || null;
};

export const construirLineasPrueba = ({ punto } = {}) => {
    const nombre = texto(punto?.NOMBRE) ?? 'Impresora';
    const mac = texto(punto?.ID_IMPRESORA);

    return [
        { kind: 'center', text: 'PRUEBA DE IMPRESION', size: 'lg' },
        { kind: 'sep' },
        { kind: 'center', text: nombre },
        ...(mac ? [{ kind: 'center', text: mac }] : []),
        { kind: 'sep' },
        { kind: 'center', text: 'Impresora lista' },
        { kind: 'feed' },
    ];
};
