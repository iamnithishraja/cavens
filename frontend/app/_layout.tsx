import { Colors } from "@/constants/Colors";
import { Text, View } from "react-native";
import Background from "@/components/common/Background";

export default function RootLayout() {
  return (
    <Background>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <View style={{
          padding: 16,
          borderRadius: 16,
          backgroundColor: Colors.surface,
          borderWidth: 1,
          borderColor: Colors.borderBlue,
        }}>
          <Text style={{ color: Colors.textPrimary }}>Hello</Text>
        </View>
      </View>
    </Background>
  );
}
