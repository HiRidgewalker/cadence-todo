export type ThemeColors = {
  background: string;
  text: string;
  muted: string;
  card: string;
  border: string;
  accent: string;
  accentText: string;
};

export const theme: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    background: "#f4f7fb",
    text: "#111827",
    muted: "#4b5563",
    card: "#ffffff",
    border: "#d8dee8",
    accent: "#2563eb",
    accentText: "#ffffff",
  },
  dark: {
    background: "#111827",
    text: "#f9fafb",
    muted: "#9ca3af",
    card: "#1f2937",
    border: "#374151",
    accent: "#60a5fa",
    accentText: "#111827",
  },
};

export function colorsFor(scheme: string | null | undefined): ThemeColors {
  return scheme === "dark" ? theme.dark : theme.light;
}
