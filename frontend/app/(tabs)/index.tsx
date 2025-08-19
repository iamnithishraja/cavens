import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

const index = () => {
    const router = useRouter();

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.navigate("../(tabs)/auth/Login");
        }, 0); // Ensure navigation happens after mounting
        return () => clearTimeout(timeout); // Cleanup timeout
    }, []);

    return (
        <View>
            <Text>hello world</Text>
        </View>
    );
};

export default index;