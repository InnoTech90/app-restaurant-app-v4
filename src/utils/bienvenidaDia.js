import AsyncStorage from "@react-native-async-storage/async-storage";
import { withDb } from "./db";
import {
  construirListaPendientes,
  hayPendientesInicioDeDia,
  obtenerPendientesSincronizacion,
} from "./pendientesSincronizacion";

const KEY_ULTIMO_DIA_BIENVENIDA = "ultimoDiaBienvenida";

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const DIAS = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

export const obtenerClaveDiaLocal = (fecha = new Date()) => {
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const dd = String(fecha.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const formatearFechaLarga = (fecha = new Date()) => {
  const diaSemana = DIAS[fecha.getDay()];
  const dia = fecha.getDate();
  const mes = MESES[fecha.getMonth()];
  return `${diaSemana} ${dia} de ${mes}`;
};

export const obtenerSaludo = (fecha = new Date()) => {
  const hora = fecha.getHours();
  if (hora < 12) return "¡Buenos días!";
  if (hora < 19) return "¡Buenas tardes!";
  return "¡Buenas noches!";
};

export const debeMostrarBienvenidaHoy = async () => {
  const hoy = obtenerClaveDiaLocal();
  const ultimo = await AsyncStorage.getItem(KEY_ULTIMO_DIA_BIENVENIDA);
  return ultimo !== hoy;
};

export const marcarBienvenidaMostrada = async () => {
  await AsyncStorage.setItem(
    KEY_ULTIMO_DIA_BIENVENIDA,
    obtenerClaveDiaLocal(),
  );
};

export const construirContenidoBienvenida = (pendientes, fecha = new Date()) => {
  const fechaTexto = formatearFechaLarga(fecha);
  const titulo = obtenerSaludo(fecha);
  const tienePendientes = hayPendientesInicioDeDia(pendientes);
  const lista = construirListaPendientes(pendientes);

  if (!tienePendientes) {
    return {
      titulo,
      message: `Hoy es ${fechaTexto}.\n\nNo tienes pendientes del día anterior. Todo listo para comenzar un nuevo día.`,
      type: "info",
    };
  }

  const bullets = lista.map((item) => `• ${item}`).join("\n");

  return {
    titulo,
    message: `Hoy es ${fechaTexto}.\n\nAntes de comenzar, recuerda resolver lo pendiente del día anterior:\n\n${bullets}\n\nSincroniza, cierra caja si hace falta y limpia las ventas ya sincronizadas para iniciar el día con claridad.`,
    type: "warning",
  };
};

const bienvenidaInicioDiaActiva = async () => {
  return withDb("Bienvenida.bienvenidaInicioDiaActiva", async (db) => {
    const row = await db.getFirstAsync(
      `SELECT BIENVENIDA_INICIO_DIA FROM CONFIGURACIONES LIMIT 1`,
    );
    return Number(row?.BIENVENIDA_INICIO_DIA ?? 1) === 1;
  });
};

export const prepararBienvenidaDelDia = async () => {
  const activa = await bienvenidaInicioDiaActiva();
  if (!activa) return null;

  const mostrar = await debeMostrarBienvenidaHoy();
  if (!mostrar) return null;

  const pendientes = await obtenerPendientesSincronizacion();
  return construirContenidoBienvenida(pendientes);
};
