import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";

const Background = ({ children }: { children: React.ReactNode }) => {
  return (
    <LinearGradient colors={Colors.gradients.background as [string, string]} style={{ flex: 1 }}>
      {children}
    </LinearGradient>
  );
};

export default Background; 