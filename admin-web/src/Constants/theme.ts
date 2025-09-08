import { Colors } from "./colors";

export const adminTheme = {
  colors: {
    primary: Colors.accentYellow,
    secondary: Colors.accentYellow,
    accent: Colors.accentYellow,
    neutral: Colors.textSecondary,
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
    text: {
      primary: Colors.textPrimary,
      secondary: Colors.textSecondary,
      muted: Colors.textMuted,
    },
    background: {
      main: Colors.background,
      card: Colors.surfaceElevated,
      sidebar: Colors.surface,
    },
    border: Colors.borderBlue,
  },
  gradients: Colors.gradients,
  button: Colors.button,
};

export type AdminTheme = typeof adminTheme;


