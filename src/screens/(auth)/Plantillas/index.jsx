import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import CuentaPreview from "../(mesas)/Ticket/Plantillas/CuentaPreview";
import { withDb } from "../../../utils/db";

const BASE = {
  negocio: { NOMBRE_NEGOCIO: "Antojos a la Mexicana" },
  sucursal: {
    NOMBRE: "La Guadalupana",
    DIRECCION: "San Lazaro 47",
    TELEFONO: "3345657820",
  },
  comanda: { FICHA: 128, FECHA: "27/09/2026 14:32:00", CONT_IMPRESO: 1 },
  mesa: { NOMBRE: "Mesa 4" },
  cliente: {
    NOMBRE: "Ana López",
    DIRECCION: "Rio San Lazaro 47",
    TELEFONO: "3345657820",
    NOTAS: "Puerta negra",
  },
  impresion: 1,
  promociones: [{ nombre: "Descuento de $20.00" }],
  articulos: [
    {
      CANTIDAD: 2,
      TOTAL: 180,
      articulo: { NOMBRE: "Tacos al pastor" },
      complementos: [
        { COMP_NOMBRE: "Salsa verde", COMP_PRECIO: 0 },
        { COMP_NOMBRE: "Queso extra", COMP_PRECIO: 15 },
      ],
    },
    {
      CANTIDAD: 1,
      TOTAL: 45,
      articulo: { NOMBRE: "Agua de horchata" },
      complementos: [],
    },
  ],
  totales: {
    subtotal: 225,
    impuestos: 36,
    descuento: 20,
    propina: 30,
    costoEnvio: 15,
    total: 286,
    montoRecibido: 300,
    cambio: 14,
  },
  metodoPago: "Efectivo",
  formatosPago: [
    { ID: 1, NOMBRE: "Efectivo" },
    { ID: 2, NOMBRE: "Tarjeta" },
  ],
};

const PAGO_DIVIDIDO = [
  { FORMA_PAGO: 1, TOTAL: 150 },
  { FORMA_PAGO: 2, TOTAL: 136 },
];

const PLANTILLAS = [
  {
    id: "cuenta",
    nombre: "Cuenta",
    detalle: "Ticket de cobro que sale por caja",
  },
];

const Plantillas = () => {
  const [previewId, setPreviewId] = useState(null);
  const [dividido, setDividido] = useState(false);
  const [tamano, setTamano] = useState("Pequeña");

  useEffect(() => {
    withDb("Plantillas.tamano", async (db) => {
      const fila = await db.getFirstAsync(
        `SELECT f.NOMBRE AS TAMANO
         FROM CONFIGURACIONES c
         LEFT JOIN TAMAÑO_FUENTES f ON f.ID = c.ID_TAMAÑO_FUENTE
         LIMIT 1`,
      );
      return fila?.TAMANO ?? "Pequeña";
    }).then((nombre) => {
      if (nombre) setTamano(nombre);
    });
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f4f6f8" }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      {PLANTILLAS.map((plantilla) => {
        const abierta = previewId === plantilla.id;
        return (
          <View
            key={plantilla.id}
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              marginBottom: 12,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 14,
                gap: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#242a47" }}>
                  {plantilla.nombre}
                </Text>
                <Text style={{ marginTop: 2, color: "#5c6478" }}>
                  {plantilla.detalle}
                </Text>
              </View>
              <Pressable
                onPress={() => setPreviewId(abierta ? null : plantilla.id)}
                style={{
                  backgroundColor: abierta ? "#e2f3fc" : "#0B5CDD",
                  borderRadius: 8,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                }}
              >
                <Text
                  style={{
                    color: abierta ? "#0B5CDD" : "#fff",
                    fontWeight: "700",
                  }}
                >
                  {abierta ? "Cerrar" : "Preview"}
                </Text>
              </Pressable>
            </View>

            {abierta && plantilla.id === "cuenta" && (
              <View style={{ backgroundColor: "#ece7df", paddingVertical: 16 }}>
                <View
                  style={{
                    flexDirection: "row",
                    marginHorizontal: 16,
                    marginBottom: 14,
                    backgroundColor: "#fff",
                    borderRadius: 10,
                    overflow: "hidden",
                  }}
                >
                  {[
                    { id: false, label: "Pago único" },
                    { id: true, label: "Pago dividido" },
                  ].map((opcion) => {
                    const activo = dividido === opcion.id;
                    return (
                      <Pressable
                        key={opcion.label}
                        onPress={() => setDividido(opcion.id)}
                        style={{
                          flex: 1,
                          paddingVertical: 10,
                          alignItems: "center",
                          backgroundColor: activo ? "#0B5CDD" : "#fff",
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: "600",
                            color: activo ? "#fff" : "#242a47",
                          }}
                        >
                          {opcion.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <CuentaPreview
                  {...BASE}
                  tamano={tamano}
                  pagoDividido={dividido ? PAGO_DIVIDIDO : []}
                />
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

export default Plantillas;