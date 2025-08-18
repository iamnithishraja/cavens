export const Colors = {
  // Base surfaces
  background: "#070B14", // near-black with a hint of navy
  surface: "#0B1120", // primary surface used behind content
  surfaceElevated: "#0E1630", // slightly brighter card surface

  // Text
  textPrimary: "#FFFFFF",
  textSecondary: "#A2ACC2",
  textMuted: "#7D879C",

  // Accents
  accentYellow: "#F9D65C", // button/background accent
  accentBlue: "#4EA2FF", // neon blue highlights

  // Borders / outlines
  borderBlue: "rgba(78, 162, 255, 0.28)",
  borderGold: "rgba(249, 214, 92, 0.25)",

  // Common gradients used across the app (top -> bottom)
  gradients: {
    // App background gradient
    background: ["#05070D", "#0B1120"],

    // Generic card background (dark navy to near-black)
    card: ["#0B1225", "#090F1C"],

    // Extra dark fade
    dark: ["#060910", "#0A0F1D"],

    // A soft blue glow that fades out (good for borders/overlays)
    blueGlow: ["rgba(78, 162, 255, 0.35)", "rgba(78, 162, 255, 0)"]
  },

  // Button theme
  button: {
    background: "#F9D65C", // same as accentYellow
    text: "#0A0F1D"
  }
}