// Plantilla de la cuenta (ticket de caja).
// construirLineasCuenta es la estructura: el preview y la impresora leen estas líneas.

const COL_WIDTH = 32;

// La letra cambia de tamaño, el ancho se queda en 32 columnas para que
// etiquetas y montos sigan alineados en papel de 58 mm.
export const perfilTamanoTicket = (nombre) => {
    const clave = String(nombre ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    if (clave.startsWith('grand')) {
        return {
            id: 'grande',
            columnas: COL_WIDTH,
            fonttype: 0,
            widthtimes: 0,
            heigthtimes: 1,
            preview: 17,
        };
    }
    if (clave.startsWith('med')) {
        return {
            id: 'mediana',
            columnas: COL_WIDTH,
            fonttype: 0,
            widthtimes: 0,
            heigthtimes: 0,
            preview: 13,
        };
    }
    return {
        id: 'pequena',
        columnas: COL_WIDTH,
        fonttype: 1,
        widthtimes: 0,
        heigthtimes: 0,
        preview: 10,
    };
};

export const fmt$ = (val) => `$${(val ?? 0).toFixed(2)}`;

export const padLine = (left, right) => {
    const maxLeft = COL_WIDTH - right.length - 1;
    const trimmed = left.length > maxLeft ? left.slice(0, maxLeft - 1) + '.' : left;
    const spaces = COL_WIDTH - trimmed.length - right.length;
    return trimmed + ' '.repeat(Math.max(1, spaces)) + right;
};

const nombreArticulo = (renglon) =>
    renglon.articulo?.NOMBRE ?? renglon.articulo?.NOMBRE_CORTO ?? '---';

/**
 * @returns {Array<{ kind: 'center'|'left'|'right'|'pair'|'sep'|'feed', text?: string, left?: string, right?: string, size?: 'lg', align?: 'center'|'left'|'right' }>}
 */
const DOMINIO = 'apprestaurants.com';

const texto = (valor) => {
    const limpio = String(valor ?? '').trim();
    return limpio || null;
};

export const construirLineasCuenta = ({
    negocio,
    sucursal,
    comanda,
    articulos = [],
    mesa,
    cliente,
    totales,
    metodoPago,
    pagoDividido = [],
    formatosPago = [],
    promociones = [],
    impresion,
    dominio = DOMINIO,
}) => {
    const lineas = [];

    const nombreNegocio = texto(negocio?.NOMBRE_NEGOCIO ?? negocio?.NOMBRE);
    const nombreSucursal = texto(sucursal?.NOMBRE);
    const direccionSucursal = texto(sucursal?.DIRECCION);
    const telefonoSucursal = texto(sucursal?.TELEFONO);

    if (nombreNegocio) {
        lineas.push({ kind: 'center', text: nombreNegocio, size: 'lg' });
    }
    if (nombreSucursal) lineas.push({ kind: 'center', text: nombreSucursal });
    if (direccionSucursal) lineas.push({ kind: 'center', text: direccionSucursal });
    if (telefonoSucursal) lineas.push({ kind: 'center', text: telefonoSucursal });
    lineas.push({ kind: 'sep' });

    lineas.push({ kind: 'left', text: `Folio: #${comanda?.FICHA ?? '-'}` });
    lineas.push({ kind: 'left', text: `Mesa : ${mesa?.NOMBRE ?? '-'}` });
    lineas.push({ kind: 'left', text: `Fecha: ${texto(comanda?.FECHA) ?? '-'}` });
    lineas.push({
        kind: 'left',
        text: `Impresion: ${impresion ?? comanda?.CONT_IMPRESO ?? 1}`,
    });
    lineas.push({ kind: 'sep' });

    for (const renglon of articulos) {
        const cant = renglon.CANTIDAD ?? 1;
        lineas.push({
            kind: 'pair',
            left: `${cant}x ${nombreArticulo(renglon)}`,
            right: fmt$(renglon.TOTAL),
        });
        for (const comp of renglon.complementos ?? []) {
            const cNombre = comp.COMP_NOMBRE ?? comp.complemento?.NOMBRE ?? '---';
            const cPrecio = comp.COMP_PRECIO ?? comp.complemento?.PRECIO ?? 0;
            if (cPrecio > 0) {
                lineas.push({
                    kind: 'pair',
                    left: `  + ${cNombre}`,
                    right: fmt$(cPrecio),
                });
            } else {
                lineas.push({ kind: 'left', text: `  + ${cNombre}` });
            }
        }
    }

    const derecha = [];
    const pushDerecha = (left, right, size) => {
        derecha.push({ left, right, size });
    };

    pushDerecha('Subtotal', fmt$(totales?.subtotal));
    if ((totales?.impuestos ?? 0) > 0) {
        pushDerecha('Impuestos', fmt$(totales.impuestos));
    }
    if ((totales?.descuento ?? 0) > 0) {
        pushDerecha('Descuento', `-${fmt$(totales.descuento)}`);
    }
    if ((totales?.propina ?? 0) > 0) {
        pushDerecha('Propina', fmt$(totales.propina));
    }
    if ((totales?.costoEnvio ?? 0) > 0) {
        pushDerecha('Envio', fmt$(totales.costoEnvio));
    }
    derecha.push({ sep: true });
    pushDerecha('TOTAL', fmt$(totales?.total), 'lg');
    derecha.push({ sep: true });

    if (pagoDividido.length === 0) {
        const montoPago =
            (totales?.montoRecibido ?? 0) > 0
                ? totales.montoRecibido
                : (totales?.total ?? 0);
        pushDerecha(`Pago (${metodoPago ?? '-'})`, fmt$(montoPago));
        if ((totales?.cambio ?? 0) > 0) {
            pushDerecha('Cambio', fmt$(totales.cambio));
        }
    } else {
        derecha.push({ sep: true });
        derecha.push({ text: 'PAGO DIVIDIDO', size: 'lg' });
        pagoDividido.forEach((fila, i) => {
            const metodoF = formatosPago.find(
                (f) => (f.ID ?? f.value) === fila.FORMA_PAGO,
            );
            const metodoNombre = metodoF?.NOMBRE ?? metodoF?.label ?? '-';
            pushDerecha(`Cliente ${i + 1} (${metodoNombre})`, fmt$(fila.TOTAL));
        });
    }

    lineas.push({ kind: 'sep' });
    for (const fila of derecha) {
        if (fila.sep) {
            lineas.push({ kind: 'sep' });
            continue;
        }
        if (fila.text) {
            const titulo = String(fila.text).slice(0, COL_WIDTH);
            lineas.push({
                kind: 'left',
                text: `${' '.repeat(Math.max(0, COL_WIDTH - titulo.length))}${titulo}`,
                size: fila.size,
            });
            continue;
        }
        const monto = String(fila.right);
        let etiqueta = String(fila.left);
        const maxEtiqueta = Math.max(1, COL_WIDTH - monto.length - 1);
        if (etiqueta.length > maxEtiqueta) {
            etiqueta = `${etiqueta.slice(0, Math.max(1, maxEtiqueta - 1))}.`;
        }
        const espacios = Math.max(1, COL_WIDTH - etiqueta.length - monto.length);
        lineas.push({
            kind: 'left',
            size: fila.size,
            text: `${etiqueta}${' '.repeat(espacios)}${monto}`,
        });
    }

    const nombreCliente = texto(cliente?.NOMBRE);
    const direccionCliente = texto(cliente?.DIRECCION);
    const telefonoCliente = texto(cliente?.TELEFONO);
    const referenciaCliente = texto(cliente?.NOTAS ?? cliente?.DESCRIPCION);
    if (nombreCliente || direccionCliente || telefonoCliente || referenciaCliente) {
        lineas.push({ kind: 'sep' });
        if (nombreCliente) lineas.push({ kind: 'left', text: `Cliente: ${nombreCliente}` });
        if (direccionCliente) lineas.push({ kind: 'left', text: direccionCliente });
        if (telefonoCliente) lineas.push({ kind: 'left', text: telefonoCliente });
        if (referenciaCliente) lineas.push({ kind: 'left', text: referenciaCliente });
    }

    const notaComanda = texto(comanda?.NOTA);
    if (notaComanda) {
        lineas.push({ kind: 'sep' });
        lineas.push({ kind: 'left', text: 'Nota', size: 'lg' });
        lineas.push({ kind: 'left', text: notaComanda });
    }

    const promos = (promociones ?? []).filter((promo) => texto(promo?.nombre ?? promo?.NOMBRE));
    if (promos.length > 0) {
        lineas.push({ kind: 'sep' });
        lineas.push({ kind: 'left', text: 'Promociones aplicadas:' });
        for (const promo of promos) {
            const nombre = texto(promo.nombre ?? promo.NOMBRE);
            const monto = promo.monto ?? promo.MONTO;
            const detalle = monto != null && monto !== '' ? `${nombre} ${fmt$(monto)}` : nombre;
            lineas.push({ kind: 'left', text: `- ${detalle}` });
        }
    }

    lineas.push({ kind: 'sep' });
    lineas.push({ kind: 'center', text: '¡Gracias por su visita!' });
    lineas.push({ kind: 'sep' });
    lineas.push({ kind: 'center', text: `${dominio}` });
    lineas.push({ kind: 'feed' });
    lineas.push({ kind: 'feed' });

    return lineas;
};
