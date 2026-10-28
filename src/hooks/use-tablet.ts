import { useWindowDimensions } from "react-native";

const tabletBreakpoint = 768;

export function useTablet() {
  const { width } = useWindowDimensions();
  return width >= tabletBreakpoint;
}
