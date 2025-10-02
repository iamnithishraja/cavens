import { type PresetConfig } from "react-native-animated-glow";

const FeaturedItemPreset: PresetConfig = {
  metadata: {
    name: "FeaturedGlowBorder",
    textColor: "#FFFFFF",
    category: "Custom",
    tags: ["glow", "ethereal", "border"],
  },
  states: [
    {
      name: "default",
      preset: {
        cornerRadius: 12,
        outlineWidth: 0.1, // thinnest outline
        borderColor: ["#222222"], // almost invisible border
        glowLayers: [
          {
            colors: ["#1e90ff", "#00bfff"],
            glowSize: 8,
            opacity: 0.2,
            coverage: 1,
          },
          {
            colors: ["#ff00ff", "#8a2be2"], // magenta → violet
            glowSize: 8,
            opacity: 0.2,
            coverage: 1,
          }
        ],
      },
    },
    {
      name: "hover",
      transition: 250,
      preset: {
        glowLayers: [{ glowSize: 14, opacity: 0.12 }],
      },
    },
    {
      name: "press",
      transition: 150,
      preset: {
        glowLayers: [{ glowSize: 16, opacity: 0.15 }],
      },
    },
  ],
};

export default FeaturedItemPreset;
