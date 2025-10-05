import { type PresetConfig } from "react-native-animated-glow";
import { Colors } from "@/constants/Colors";

export const TimelineTabs: PresetConfig = {
  states: [
    {
      name: "default",
      preset: {
        cornerRadius: 999,
        outlineWidth: 0,
        borderColor: "rgba(0, 0, 0, 1)",
        backgroundColor: "rgba(10, 10, 10, 1)",
        animationSpeed: 1,
        borderSpeedMultiplier: 1,
        glowLayers: [
          {
            glowPlacement: "behind",
            colors: [Colors.blueDark],
            glowSize: [8, 12, 8],
            opacity: 0.15,
            speedMultiplier: 1,
            coverage: 1,
            relativeOffset: 0,
          },
          {
            glowPlacement: "behind",
            colors: [Colors.blueDark],
            glowSize: 1,
            opacity: 0.6,
            speedMultiplier: 1,
            coverage: 1,
            relativeOffset: 0,
          },
          {
            glowPlacement: "over",
            colors: [Colors.blueDark],
            glowSize: [0, 8],
            opacity: 0.08,
            speedMultiplier: 2,
            coverage: 0.7,
            relativeOffset: 0,
          },
          {
            glowPlacement: "behind",
            colors: [Colors.blueDark],
            glowSize: [0, 1],
            opacity: 1,
            speedMultiplier: 2,
            coverage: 0.6,
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
            glowSize: [10, 14, 10],
            opacity: 0.18,
          },
          {
            glowSize: 1,
            opacity: 0.7,
          },
          {
            glowSize: [0, 10],
            opacity: 0.1,
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
            glowSize: [12, 16, 12],
            opacity: 0.2,
          },
          {
            glowSize: 1,
            opacity: 0.8,
          },
          {
            glowSize: [0, 12],
            opacity: 0.12,
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

export default TimelineTabs;
