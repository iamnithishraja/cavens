import { type PresetConfig } from "react-native-animated-glow";
import { Colors } from "@/constants/Colors";

export const FeaturedItemPreset: PresetConfig = {
  states: [
    {
      name: "default",
      preset: {
        cornerRadius: 10,
        outlineWidth: 4,
        borderColor: [
          Colors.primary,
          Colors.blueAccent,
          Colors.primary,
          Colors.blueAccent,
        ],
        backgroundColor: "rgba(21, 21, 21, 1)",
        animationSpeed: 2,
        borderSpeedMultiplier: 1,
        glowLayers: [
          {
            glowPlacement: "behind",
            colors: [Colors.blueDark, Colors.blueDark],
            glowSize: 20,
            opacity: 0.1,
            speedMultiplier: 1,
            coverage: 1,
          },
          {
            glowPlacement: "behind",
            colors: [Colors.primary, Colors.blueDark],
            glowSize: 8,
            opacity: 0.5,
            speedMultiplier: 1,
            coverage: 1,
          },
        ],
      },
    },
    {
      name: "hover",
      transition: 300,
      preset: {
        animationSpeed: 3,
        glowLayers: [
          {
            glowSize: 24,
            opacity: 0.12,
          },
          {
            glowSize: 10,
            opacity: 0.6,
          },
        ],
      },
    },
  ],
};

export default FeaturedItemPreset;
