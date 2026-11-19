import { Image } from "expo-image";
import HeaderBar from "../../../components/atoms/HeaderBar/HeaderBar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "../../../components/atoms/FondoSolido/FondoSolido";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RecoverButton from "../../../components/atoms/RecoverButton/RecoverButton";
import Card from "../../../components/Molecules/Card/Card";
import { normalize } from "../../../utils/funcionesMaquetado/responsiveWH";
import { gb } from "../../globalStyles";
import { Database } from "./database";
import { s } from "./styles";

import { color as tema } from "../../../utils/theme";
const MiRestaurante = () => {
  const [data, setData] = useState();
  useEffect(() => {
    getData();
  }, []);
  const getData = async () => {
    try {
      const data = await Database.getGeneralData();
      setData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ flex: 1, backgroundColor: tema.background }}
    >
      {/* Header */}
      <HeaderBar style={s.header}>
        <RecoverButton />
        <Text style={s.headerTitle}>Mi Restaurante</Text>
      </HeaderBar>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          backgroundColor: gb.gray50,
          padding: normalize(20),
          gap: normalize(16),
        }}
      >
        <View style={s.logoContainer}>
          <Image
            source={require(`../../../assets/img/logo_app_rest_blanco.png`)}
            style={s.img}
            contentFit="contain"
          />
        </View>
        <Card
          title="Informacion del negocio"
          styleBody={s.bodyCard}
          styleTitleHeader={s.titleCard}
        >
          <View style={s.infoRow}>
            <View style={s.iconContainer}>
              <Ionicons name="business-outline" size={normalize(19)} color={tema.primary} />
            </View>
            <View style={s.infoDetails}>
              <Text style={s.infoLabel}>Nombre del Negocio</Text>
              <Text style={s.infoValue}>
                {data?.negocio[0]?.NOMBRE_NEGOCIO || "No disponible"}
              </Text>
            </View>
          </View>

          <View style={s.infoRow}>
            <View style={s.iconContainer}>
              <Ionicons name="library-outline" size={normalize(19)} color={tema.primary} />
            </View>
            <View style={s.infoDetails}>
              <Text style={s.infoLabel}>Razón Social</Text>
              <Text style={s.infoValue}>
                {data?.negocio[0]?.RAZON_SOCIAL || "No disponible"}
              </Text>
            </View>
          </View>

          <View style={s.infoRow}>
            <View style={s.iconContainer}>
              <Ionicons name="id-card-outline" size={normalize(19)} color={tema.primary} />
            </View>
            <View style={s.infoDetails}>
              <Text style={s.infoLabel}>RFC</Text>
              <Text style={s.infoValue}>
                {data?.negocio[0]?.RFC || "No disponible"}
              </Text>
            </View>
          </View>

          <View style={s.infoRow}>
            <View style={s.iconContainer}>
              <Ionicons name="call-outline" size={normalize(19)} color={tema.primary} />
            </View>
            <View style={s.infoDetails}>
              <Text style={s.infoLabel}>Teléfono</Text>
              <Text style={s.infoValue}>
                {data?.negocio[0]?.TELEFONO || "No disponible"}
              </Text>
            </View>
          </View>

          <View style={s.infoRow}>
            <View style={s.iconContainer}>
              <Ionicons name="location-outline" size={normalize(19)} color={tema.primary} />
            </View>
            <View style={s.infoDetails}>
              <Text style={s.infoLabel}>Dirección</Text>
              <Text style={s.infoValue}>
                {data?.negocio[0]?.DIRECCION || "No disponible"}
              </Text>
            </View>
          </View>

          <View style={s.infoRow}>
            <View style={s.iconContainer}>
              <Ionicons name="mail-outline" size={normalize(19)} color={tema.primary} />
            </View>
            <View style={s.infoDetails}>
              <Text style={s.infoLabel}>Código Postal</Text>
              <Text style={s.infoValue}>
                {data?.negocio[0]?.CODIGO_POSTAL || "No disponible"}
              </Text>
            </View>
          </View>
        </Card>
        <Card
          title="Información de la sucursal"
          styleBody={s.bodyCard}
          styleTitleHeader={s.titleCard}
        >
          <View style={s.infoRow}>
            <View style={s.iconContainer}>
              <Ionicons name="storefront-outline" size={normalize(19)} color={tema.primary} />
            </View>
            <View style={s.infoDetails}>
              <Text style={s.infoLabel}>Sucursal</Text>
              <Text style={s.infoValue}>
                {data?.sucursal[0]?.NOMBRE || "No disponible"}
              </Text>
            </View>
          </View>

          <View style={s.infoRow}>
            <View style={s.iconContainer}>
              <Ionicons name="document-text-outline" size={normalize(19)} color={tema.primary} />
            </View>
            <View style={s.infoDetails}>
              <Text style={s.infoLabel}>Descripción</Text>
              <Text style={s.infoValue}>
                {data?.sucursal[0]?.DESCRIPCION || "No disponible"}
              </Text>
            </View>
          </View>

          <View style={s.infoRow}>
            <View style={s.iconContainer}>
              <Ionicons name="location-outline" size={normalize(19)} color={tema.primary} />
            </View>
            <View style={s.infoDetails}>
              <Text style={s.infoLabel}>Dirección</Text>
              <Text style={s.infoValue}>
                {data?.sucursal[0]?.DIRECCION || "No disponible"}
              </Text>
            </View>
          </View>

          <View style={s.infoRow}>
            <View style={s.iconContainer}>
              <Ionicons name="call-outline" size={normalize(19)} color={tema.primary} />
            </View>
            <View style={s.infoDetails}>
              <Text style={s.infoLabel}>Teléfono</Text>
              <Text style={s.infoValue}>
                {data?.sucursal[0]?.TELEFONO || "No disponible"}
              </Text>
            </View>
          </View>

          <View style={s.infoRow}>
            <View style={s.iconContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={normalize(19)} color={tema.primary} />
            </View>
            <View style={s.infoDetails}>
              <Text style={s.infoLabel}>WhatsApp</Text>
              <Text style={s.infoValue}>
                {data?.sucursal[0]?.WHATSAPP || "No disponible"}
              </Text>
            </View>
          </View>
          {data?.sucursal[0]?.FACEBOK && (
            <View style={s.infoRow}>
              <View style={s.iconContainer}>
                <Ionicons name="logo-facebook" size={normalize(19)} color={tema.primary} />
              </View>
              <View style={s.infoDetails}>
                <Text style={s.infoLabel}>Facebook</Text>
                <Text style={s.infoValue}>
                  {data?.sucursal[0]?.FACEBOK || "No disponible"}
                </Text>
              </View>
            </View>
          )}
          {data?.sucursal[0]?.INSTAGRAM && (
            <View style={s.infoRow}>
              <View style={s.iconContainer}>
                <Ionicons name="logo-instagram" size={normalize(19)} color={tema.primary} />
              </View>
              <View style={s.infoDetails}>
                <Text style={s.infoLabel}>Instagram</Text>
                <Text style={s.infoValue}>
                  {data?.sucursal[0]?.INSTAGRAM || "No disponible"}
                </Text>
              </View>
            </View>
          )}
        </Card>
        <Card
          title="Información del dispositivo"
          styleBody={s.bodyCard}
          styleTitleHeader={s.titleCard}
        >
          <View style={s.infoCard}>
            <Text style={s.sectionTitle}>Dispositivo Terminal</Text>

            <View style={s.infoRow}>
              <View style={s.iconContainer}>
                <Ionicons name="phone-portrait-outline" size={normalize(19)} color={tema.primary} />
              </View>
              <View style={s.infoDetails}>
                <Text style={s.infoLabel}>Nombre</Text>
                <Text style={s.infoValue}>
                  {data?.device[0]?.NOMBRE || "No disponible"}
                </Text>
              </View>
            </View>

            <View style={s.infoRow}>
              <View style={s.iconContainer}>
                <Ionicons name="key-outline" size={normalize(19)} color={tema.primary} />
              </View>
              <View style={s.infoDetails}>
                <Text style={s.infoLabel}>Clave de Dispositivo</Text>
                <Text style={s.infoValue}>
                  {data?.device[0]?.DEVICE_KEY || "No disponible"}
                </Text>
              </View>
            </View>

            <View style={s.infoRow}>
              <View style={s.iconContainer}>
                <Ionicons
                  name={
                    data?.device[0]?.ESTATUS === "activo"
                      ? "checkmark-circle"
                      : "close-circle"
                  }
                  size={22}
                  color={
                    data?.device[0]?.ESTATUS === "activo" ? "#18A058" : "#E5484D"
                  }
                />
              </View>
              <View style={s.infoDetails}>
                <Text style={s.infoLabel}>Estado</Text>
                <Text style={s.infoValue}>
                  {data?.device[0]?.ESTATUS || "Desconocido"}
                </Text>
              </View>
            </View>
          </View>
        </Card>
        <Card
          title="Información del plan"
          styleBody={s.bodyCard}
          styleTitleHeader={s.titleCard}
        >
          <View style={s.infoCard}>
            <Text style={s.sectionTitle}>Plan de Suscripción</Text>

            <View style={s.infoRow}>
              <View style={s.iconContainer}>
                <Ionicons name="card-outline" size={normalize(19)} color={tema.primary} />
              </View>
              <View style={s.infoDetails}>
                <Text style={s.infoLabel}>Plan</Text>
                <Text style={s.infoValue}>
                  {data?.plan[0]?.NOMBRE || "No disponible"}
                </Text>
              </View>
            </View>

            <View style={s.infoRow}>
              <View style={s.iconContainer}>
                <Ionicons name="cash-outline" size={normalize(19)} color={tema.primary} />
              </View>
              <View style={s.infoDetails}>
                <Text style={s.infoLabel}>Costo</Text>
                <Text style={s.infoValue}>
                  ${data?.plan[0]?.COSTO || "No disponible"}
                </Text>
              </View>
            </View>

            <View style={s.infoRow}>
              <View style={s.iconContainer}>
                <Ionicons name="phone-portrait-outline" size={normalize(19)} color={tema.primary} />
              </View>
              <View style={s.infoDetails}>
                <Text style={s.infoLabel}>Dispositivos Permitidos</Text>
                <Text style={s.infoValue}>
                  {data?.plan[0]?.CANTIDAD_DISPOSITIVOS || "No disponible"}
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};
export default MiRestaurante;
