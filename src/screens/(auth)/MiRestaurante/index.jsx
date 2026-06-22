import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RecoverButton from '../../../components/atoms/RecoverButton/RecoverButton';
import Card from '../../../components/Molecules/Card/Card';
import { normalize } from '../../../utils/funcionesMaquetado/responsiveWH';
import { gb } from '../../globalStyles';
import { Database } from './database';
import { s } from './styles';

const MiRestaurante = () => {
    const [data, setData] = useState();
    useEffect(() => {
        getData();
    }, [])
    const getData = async () => {
        try {
            const data = await Database.getGeneralData();
            console.log(JSON.stringify(data, null, 2));
            setData(data);
        }
        catch (error) {
            console.error("Error fetching data:", error);
        }
    }
    return (
        <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: "black" }}>
            {/* Header */}
            <LinearGradient style={s.header} colors={gb.gradient_blue} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <RecoverButton />
                <Text style={s.headerTitle}>Mi Restaurante</Text>
            </LinearGradient>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ backgroundColor: gb.gray50, padding: normalize(20), gap: normalize(16) }}>
                <View style={s.logoContainer}>
                    <Image source={require(`../../../assets/img/logo_app_rest_blanco.png`)} style={s.img} contentFit="contain" />
                </View>
                <Card title="Informacion del negocio" styleBody={s.bodyCard} styleTitleHeader={s.titleCard} >
                    <View style={s.infoRow}>
                        <View style={s.iconContainer}>
                            <Text style={s.iconText}>🏢</Text>
                        </View>
                        <View style={s.infoDetails}>
                            <Text style={s.infoLabel}>Nombre del Negocio</Text>
                            <Text style={s.infoValue}>
                                {data?.negocio[0]?.NOMBRE_NEGOCIO || 'No disponible'}
                            </Text>
                        </View>
                    </View>

                    <View style={s.infoRow}>
                        <View style={s.iconContainer}>
                            <Text style={s.iconText}>🏛️</Text>
                        </View>
                        <View style={s.infoDetails}>
                            <Text style={s.infoLabel}>Razón Social</Text>
                            <Text style={s.infoValue}>
                                {data?.negocio[0]?.RAZON_SOCIAL || 'No disponible'}
                            </Text>
                        </View>
                    </View>

                    <View style={s.infoRow}>
                        <View style={s.iconContainer}>
                            <Text style={s.iconText}>🆔</Text>
                        </View>
                        <View style={s.infoDetails}>
                            <Text style={s.infoLabel}>RFC</Text>
                            <Text style={s.infoValue}>
                                {data?.negocio[0]?.RFC || 'No disponible'}
                            </Text>
                        </View>
                    </View>

                    <View style={s.infoRow}>
                        <View style={s.iconContainer}>
                            <Text style={s.iconText}>📞</Text>
                        </View>
                        <View style={s.infoDetails}>
                            <Text style={s.infoLabel}>Teléfono</Text>
                            <Text style={s.infoValue}>
                                {data?.negocio[0]?.TELEFONO || 'No disponible'}
                            </Text>
                        </View>
                    </View>

                    <View style={s.infoRow}>
                        <View style={s.iconContainer}>
                            <Text style={s.iconText}>📍</Text>
                        </View>
                        <View style={s.infoDetails}>
                            <Text style={s.infoLabel}>Dirección</Text>
                            <Text style={s.infoValue}>
                                {data?.negocio[0]?.DIRECCION || 'No disponible'}
                            </Text>
                        </View>
                    </View>

                    <View style={s.infoRow}>
                        <View style={s.iconContainer}>
                            <Text style={s.iconText}>📮</Text>
                        </View>
                        <View style={s.infoDetails}>
                            <Text style={s.infoLabel}>Código Postal</Text>
                            <Text style={s.infoValue}>
                                {data?.negocio[0]?.CODIGO_POSTAL || 'No disponible'}
                            </Text>
                        </View>
                    </View>
                </Card>
                <Card title="Información de la sucursal" styleBody={s.bodyCard} styleTitleHeader={s.titleCard} >
                    <View style={s.infoRow}>
                        <View style={s.iconContainer}>
                            <Text style={s.iconText}>🏪</Text>
                        </View>
                        <View style={s.infoDetails}>
                            <Text style={s.infoLabel}>Sucursal</Text>
                            <Text style={s.infoValue}>
                                {data?.sucursal[0]?.NOMBRE || 'No disponible'}
                            </Text>
                        </View>
                    </View>

                    <View style={s.infoRow}>
                        <View style={s.iconContainer}>
                            <Text style={s.iconText}>📝</Text>
                        </View>
                        <View style={s.infoDetails}>
                            <Text style={s.infoLabel}>Descripción</Text>
                            <Text style={s.infoValue}>
                                {data?.sucursal[0]?.DESCRIPCION || 'No disponible'}
                            </Text>
                        </View>
                    </View>

                    <View style={s.infoRow}>
                        <View style={s.iconContainer}>
                            <Text style={s.iconText}>📍</Text>
                        </View>
                        <View style={s.infoDetails}>
                            <Text style={s.infoLabel}>Dirección</Text>
                            <Text style={s.infoValue}>
                                {data?.sucursal[0]?.DIRECCION || 'No disponible'}
                            </Text>
                        </View>
                    </View>

                    <View style={s.infoRow}>
                        <View style={s.iconContainer}>
                            <Text style={s.iconText}>📞</Text>
                        </View>
                        <View style={s.infoDetails}>
                            <Text style={s.infoLabel}>Teléfono</Text>
                            <Text style={s.infoValue}>
                                {data?.sucursal[0]?.TELEFONO || 'No disponible'}
                            </Text>
                        </View>
                    </View>

                    <View style={s.infoRow}>
                        <View style={s.iconContainer}>
                            <Text style={s.iconText}>💬</Text>
                        </View>
                        <View style={s.infoDetails}>
                            <Text style={s.infoLabel}>WhatsApp</Text>
                            <Text style={s.infoValue}>
                                {data?.sucursal[0]?.WHATSAPP || 'No disponible'}
                            </Text>
                        </View>
                    </View>
                    {
                        data?.sucursal[0]?.FACEBOK && (

                            <View style={s.infoRow}>
                                <View style={s.iconContainer}>
                                    <Text style={s.iconText}>📘</Text>
                                </View>
                                <View style={s.infoDetails}>
                                    <Text style={s.infoLabel}>Facebook</Text>
                                    <Text style={s.infoValue}>
                                        {data?.sucursal[0]?.FACEBOK || 'No disponible'}
                                    </Text>
                                </View>
                            </View>
                        )

                    }
                    {
                        data?.sucursal[0]?.INSTAGRAM && (

                            <View style={s.infoRow}>
                                <View style={s.iconContainer}>
                                    <Text style={s.iconText}>📸</Text>
                                </View>
                                <View style={s.infoDetails}>
                                    <Text style={s.infoLabel}>Instagram</Text>
                                    <Text style={s.infoValue}>
                                        {data?.sucursal[0]?.INSTAGRAM || 'No disponible'}
                                    </Text>
                                </View>
                            </View>
                        )
                    }
                </Card>
                <Card title="Información del dispositivo" styleBody={s.bodyCard} styleTitleHeader={s.titleCard} >
                    <View style={s.infoCard}>
                        <Text style={s.sectionTitle}>Dispositivo Terminal</Text>

                        <View style={s.infoRow}>
                            <View style={s.iconContainer}>
                                <Text style={s.iconText}>📱</Text>
                            </View>
                            <View style={s.infoDetails}>
                                <Text style={s.infoLabel}>Nombre</Text>
                                <Text style={s.infoValue}>
                                    {data?.device[0]?.NOMBRE || 'No disponible'}
                                </Text>
                            </View>
                        </View>

                        <View style={s.infoRow}>
                            <View style={s.iconContainer}>
                                <Text style={s.iconText}>🔑</Text>
                            </View>
                            <View style={s.infoDetails}>
                                <Text style={s.infoLabel}>Clave de Dispositivo</Text>
                                <Text style={s.infoValue}>
                                    {data?.device[0]?.DEVICE_KEY || 'No disponible'}
                                </Text>
                            </View>
                        </View>

                        <View style={s.infoRow}>
                            <View style={s.iconContainer}>
                                <Text style={s.iconText}>
                                    {data?.device[0]?.ESTATUS === 'activo' ? '✅' : '❌'}
                                </Text>
                            </View>
                            <View style={s.infoDetails}>
                                <Text style={s.infoLabel}>Estado</Text>
                                <Text style={s.infoValue}>
                                    {data?.device[0]?.ESTATUS || 'Desconocido'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Card>
                <Card title="Información del plan" styleBody={s.bodyCard} styleTitleHeader={s.titleCard} >
                    <View style={s.infoCard}>
                        <Text style={s.sectionTitle}>Plan de Suscripción</Text>

                        <View style={s.infoRow}>
                            <View style={s.iconContainer}>
                                <Text style={s.iconText}>💳</Text>
                            </View>
                            <View style={s.infoDetails}>
                                <Text style={s.infoLabel}>Plan</Text>
                                <Text style={s.infoValue}>
                                    {data?.plan[0]?.NOMBRE || 'No disponible'}
                                </Text>
                            </View>
                        </View>

                        <View style={s.infoRow}>
                            <View style={s.iconContainer}>
                                <Text style={s.iconText}>💰</Text>
                            </View>
                            <View style={s.infoDetails}>
                                <Text style={s.infoLabel}>Costo</Text>
                                <Text style={s.infoValue}>
                                    ${data?.plan[0]?.COSTO || 'No disponible'}
                                </Text>
                            </View>
                        </View>

                        <View style={s.infoRow}>
                            <View style={s.iconContainer}>
                                <Text style={s.iconText}>📱</Text>
                            </View>
                            <View style={s.infoDetails}>
                                <Text style={s.infoLabel}>Dispositivos Permitidos</Text>
                                <Text style={s.infoValue}>
                                    {data?.plan[0]?.CANTIDAD_DISPOSITIVOS || 'No disponible'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Card>
            </ScrollView>
        </SafeAreaView>
    )
}
export default MiRestaurante;