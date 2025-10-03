import { type PresetConfig } from "react-native-animated-glow";
import { Colors } from "@/constants/Colors";

export const SearchFilterPreset: PresetConfig = {
  states: [
    {
      name: "default",
      preset: {
        cornerRadius: 12,
        outlineWidth: 0,
        borderColor: "rgba(0, 0, 0, 1)",
        backgroundColor: "rgba(10, 10, 10, 1)",
        animationSpeed: 1,
        borderSpeedMultiplier: 1,
        glowLayers: [
          {
            glowPlacement: "behind",
            colors: [Colors.primary, Colors.accentBlue],
            glowSize: [30, 40, 30],
            opacity: 0.1,
            speedMultiplier: 1,
            coverage: 1,
            relativeOffset: 0,
          },
          {
            glowPlacement: "behind",
            colors: [Colors.accentBlue, Colors.primary],
            glowSize: 1,
            opacity: 0.5,
            speedMultiplier: 1,
            coverage: 1,
            relativeOffset: 0,
          },
          {
            glowPlacement: "over",
            colors: [Colors.accentBlue, Colors.primary],
            glowSize: [0, 30],
            opacity: 0.05,
            speedMultiplier: 2,
            coverage: 0.6,
            relativeOffset: 0,
          },
          {
            glowPlacement: "behind",
            colors: [Colors.accentBlue, Colors.primary],
            glowSize: [0, 1],
            opacity: 1,
            speedMultiplier: 2,
            coverage: 0.5,
            relativeOffset: 0,
          },
        ],
      },
    },
    {
      name: "hover",
      transition: 300,
      preset: {
        animationSpeed: 1.5,
        glowLayers: [
          {
            glowSize: [36, 40, 36],
            opacity: 0.12,
          },
          {
            glowSize: 1,
            opacity: 0.6,
          },
          {
            glowSize: [0, 36],
            opacity: 0.06,
          },
          {
            glowSize: [0, 1],
            opacity: 1,
          },
        ],
      },
    },
    {
      name: "press",
      transition: 100,
      preset: {
        animationSpeed: 2,
        glowLayers: [
          {
            glowSize: [40, 40, 40],
            opacity: 0.14,
          },
          {
            glowSize: 1,
            opacity: 0.7,
          },
          {
            glowSize: [0, 40],
            opacity: 0.07,
          },
          {
            glowSize: [0, 1],
            opacity: 1,
          },
        ],
      },
    },
  ],
};

export default SearchFilterPreset;