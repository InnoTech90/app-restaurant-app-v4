// Plantilla del ticket de preparación (cocina / barra).
// construirLineasPreparacion es la estructura: el preview y la impresora leen estas líneas.

const ANCHO = 32;

const texto = (valor) => {
    const limpio = String(valor ?? '').replace(/\s+/g, ' ').trim();
    return limpio || null;
};

const partir = (valor, ancho) => {
    const limpio = texto(valor);
    if (!limpio) return [];
    const lineas = [];
    let actual = '';

    const cerrar = () => {
        if (actual) lineas.push(actual);
        actual = '';
    };

    for (const palabra of limpio.split(' ')) {
        if (palabra.length > ancho) {
            cerrar();
            for (let i = 0; i < palabra.length; i += ancho) {
                const trozo = palabra.slice(i, i + ancho);
                if (i + ancho < palabra.length) lineas.push(trozo);
                else actual = trozo;
            }
            continue;
        }
        const siguiente = actual ? `${actual} ${palabra}` : palabra;
        if (siguiente.length <= ancho) actual = siguiente;
        else {
            cerrar();
            actual = palabra;
        }
    }
    cerrar();
    return lineas;
};

const nombreArticulo = (renglon) =>
    texto(renglon.articulo?.NOMBRE ?? renglon.articulo?.NOMBRE_CORTO) ?? '---';

const nombreComplemento = (comp) =>
    texto(
        comp.COMP_NOMBRE ??
            comp.complemento?.NOMBRE ??
            comp.NOTA ??
            comp.NOMBRE,
    );

export const construirLineasPreparacion = ({
    punto,
    comanda,
    mesa,
    articulos = [],
}) => {
    const lineas = [];
    const estacion = texto(punto?.NOMBRE) ?? 'Preparacion';

    lineas.push({ kind: 'center', text: estacion, size: 'lg' });
    lineas.push({ kind: 'sep' });

    const [fecha, horaFull] = String(comanda?.FECHA ?? '').split(' ');
    const hora = horaFull ? horaFull.slice(0, 5) : '';
    const cuando = [fecha, hora].filter(Boolean).join(' ') || '-';
    const impresion = (Number(comanda?.CONT_IMPRESO) || 0) + 1;
    lineas.push({
        kind: 'pair',
        left: `Mesa ${texto(mesa?.NOMBRE) ?? '-'}`,
        right: `Ficha #${comanda?.FICHA ?? '-'}`,
    });
    lineas.push({
        kind: 'pair',
        left: cuando,
        right: `Imp. ${impresion}`,
    });
    lineas.push({ kind: 'sep' });

    articulos.forEach((renglon, indice) => {
        if (indice > 0) lineas.push({ kind: 'space' });

        const cant = renglon.CANTIDAD ?? 1;
        const prefijo = `${cant}  `;
        const nombre = nombreArticulo(renglon);
        const primera = `${prefijo}${nombre}`;
        const partesNombre = partir(primera, ANCHO);
        if (partesNombre.length === 0) {
            lineas.push({ kind: 'left', text: prefijo.trim(), bold: true });
        } else {
            partesNombre.forEach((linea, i) => {
                lineas.push({
                    kind: 'left',
                    bold: true,
                    text: i === 0 ? linea : `${' '.repeat(prefijo.length)}${linea}`.slice(0, ANCHO),
                });
            });
        }

        for (const comp of renglon.complementos ?? []) {
            const nombreComp = nombreComplemento(comp);
            if (!nombreComp) continue;
            partir(`+ ${nombreComp}`, ANCHO - 3).forEach((linea, i) => {
                lineas.push({
                    kind: 'left',
                    text: i === 0 ? `   ${linea}` : `     ${linea}`.slice(0, ANCHO),
                });
            });
        }

        const notaArticulo = texto(renglon.NOTA);
        if (notaArticulo) {
            const partes = partir(notaArticulo, ANCHO - 9);
            partes.forEach((linea, i) => {
                lineas.push({
                    kind: 'left',
                    text: i === 0 ? `   Nota: ${linea}` : `         ${linea}`.slice(0, ANCHO),
                });
            });
        }
    });

    const notaComanda = texto(comanda?.NOTA);
    if (notaComanda) {
        lineas.push({ kind: 'sep' });
        lineas.push({ kind: 'left', text: 'Nota', size: 'lg' });
        partir(notaComanda, ANCHO).forEach((linea) => {
            lineas.push({ kind: 'left', text: linea });
        });
    }

    const totalArticulos = articulos.reduce(
        (suma, renglon) => suma + (Number(renglon.CANTIDAD) || 1),
        0,
    );
    lineas.push({ kind: 'sep' });
    lineas.push({
        kind: 'pair',
        left: 'Total de articulos',
        right: String(totalArticulos),
        size: 'lg',
    });

    lineas.push({ kind: 'feed' });
    return lineas;
};
