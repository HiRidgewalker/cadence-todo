import { StyleSheet } from "react-native";

export type ThemeColors = {
  background: string;
  text: string;
  muted: string;
  card: string;
  border: string;
  subtle: string;
  controlBorder: string;
  accent: string;
  accentText: string;
  focus: string;
  danger: string;
  dangerText: string;
};

export const theme: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    background: "#fafafa",
    text: "#171717",
    muted: "#4d4d4d",
    card: "#ffffff",
    border: "#ebebeb",
    subtle: "#f2f2f2",
    controlBorder: "#8f8f8f",
    accent: "#171717",
    accentText: "#ffffff",
    focus: "#0070f3",
    danger: "#c50000",
    dangerText: "#ffffff",
  },
  dark: {
    background: "#0a0a0a",
    text: "#ededed",
    muted: "#b0b0b0",
    card: "#171717",
    border: "#333333",
    subtle: "#262626",
    controlBorder: "#8f8f8f",
    accent: "#ededed",
    accentText: "#171717",
    focus: "#62a9ff",
    danger: "#ff9090",
    dangerText: "#171717",
  },
};

export function colorsFor(scheme: string | null | undefined): ThemeColors {
  return scheme === "dark" ? theme.dark : theme.light;
}

export const spacing = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32 };
export const radius = { control: 6, card: 12, panel: 16 };

export const type = StyleSheet.create({
  pageTitle: { fontFamily: "Geist_600SemiBold", fontSize: 32, lineHeight: 40, letterSpacing: -1.28 },
  dateTitle: { fontFamily: "Geist_600SemiBold", fontSize: 36, lineHeight: 44, letterSpacing: -1.28 },
  heading: { fontFamily: "Geist_600SemiBold", fontSize: 20, lineHeight: 28, letterSpacing: -0.4 },
  taskTitle: { fontFamily: "Geist_500Medium", fontSize: 16, lineHeight: 24 },
  label: { fontFamily: "Geist_500Medium", fontSize: 14, lineHeight: 20 },
  body: { fontFamily: "Geist_400Regular", fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: "Geist_400Regular", fontSize: 12, lineHeight: 16 },
  mono: { fontFamily: "GeistMono_500Medium", fontSize: 12, lineHeight: 16 },
});
