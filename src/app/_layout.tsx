import { Geist_400Regular, Geist_500Medium, Geist_600SemiBold } from "@expo-google-fonts/geist";
import { GeistMono_500Medium } from "@expo-google-fonts/geist-mono";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context";

import { AppHeader } from "@/components/app-header";
import { colorsFor } from "@/constants/theme";
import { queryClient } from "@/lib/query/client";

void SplashScreen.preventAutoHideAsync();

const fonts = { Geist_400Regular, Geist_500Medium, Geist_600SemiBold, GeistMono_500Medium };

export default function RootLayout() {
  const scheme = useColorScheme();
  const colors = colorsFor(scheme);
  const [fontsLoaded, fontError] = useFonts(fonts);

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hide();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: colors.background },
            header: ({ back, navigation, options }) => (
              <AppHeader
                compact
                title={options.title ?? "任务"}
                colors={colors}
                onBack={back ? () => navigation.goBack() : undefined}
              />
            ),
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
