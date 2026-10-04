import { StyleSheet, Text, View } from 'react-native';
import { perfilTamanoTicket } from './cuenta';
import { construirLineasPrueba } from './prueba';

const alignStyle = {
    center: 'center',
    left: 'left',
    right: 'right',
};

const PruebaPreview = (props) => {
    const perfil = perfilTamanoTicket(props.tamano);
    const lineas = (props.lineas ?? construirLineasPrueba(props)).filter(
        (linea) => linea.kind !== 'feed',
    );
    const texto = {
        fontSize: perfil.preview,
        lineHeight: Math.round(perfil.preview * 1.35),
    };
    const destacado = {
        fontSize: Math.round(perfil.preview * 1.25),
        lineHeight: Math.round(perfil.preview * 1.6),
    };

    return (
        <View style={styles.sombra}>
            <View style={styles.papel}>
                {lineas.map((linea, index) => {
                    if (linea.kind === 'sep') {
                        return <View key={index} style={styles.sep} />;
                    }
                    const grande = linea.size === 'lg';
                    return (
                        <Text
                            key={index}
                            style={[
                                styles.texto,
                                texto,
                                grande && styles.grande,
                                grande && destacado,
                                { textAlign: alignStyle[linea.kind] ?? 'left' },
                            ]}
                        >
                            {linea.text}
                        </Text>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sombra: {
        alignSelf: 'center',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 4,
    },
    papel: {
        width: 300,
        backgroundColor: '#fffef8',
        paddingHorizontal: 16,
        paddingTop: 18,
        paddingBottom: 28,
        borderWidth: 1,
        borderColor: '#e7e1d6',
    },
    texto: {
        fontFamily: 'monospace',
        fontSize: 13,
        lineHeight: 18,
        color: '#1a1a1a',
    },
    grande: {
        fontWeight: '700',
        marginVertical: 2,
    },
    sep: {
        borderBottomWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#1a1a1a',
        marginVertical: 6,
    },
});

export default PruebaPreview;
