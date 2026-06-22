import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import { s } from "./styles";
const Card = ({ title, children, styleBody, styleHeader, linealGradient, styleTitleHeader }) => {
    return (
        <>
            {
                linealGradient ?
                    <>
                        <LinearGradient
                            colors={linealGradient}
                            style={[s.header, styleHeader]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {title && <Text style={[s.title, styleTitleHeader]}>{title}</Text>}
                        </LinearGradient>
                        <View style={[s.container, styleBody]}>
                            {children}
                        </View>
                    </> :
                    <View style={[s.container, styleBody]}>
                        <View style={[s.header, styleHeader]}>
                            {title && <Text style={[s.title, styleTitleHeader]}>{title}</Text>}
                        </View>
                        {children}
                    </View>

            }
        </>
    );
}
export default Card;