import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { gb } from '../../../screens/globalStyles';
import { normalize } from '../../../utils/funcionesMaquetado/responsiveWH';
import Button from '../Button/Button';

const RecoverButton = ({ href=null }) => {
    const router = useRouter();
    const recover = () => {
        if (!href) {
            router.back();
        } else if (href) {
            router.replace(href);
        }
    };
    return (
        <Button
            onPress={recover}
           
            style={{
                width: normalize(40),
                height: normalize(40),
                backgroundColor: gb.gray200+"40", // Agrega opacidad al color de fondo

            }}
            styleContainer={{
                borderRadius: normalize(20),
                overflow: 'hidden',
            }}>
            <Ionicons name="arrow-back" size={normalize(20)} color={gb.gray50} />
        </Button>
    );
}
export default RecoverButton;   