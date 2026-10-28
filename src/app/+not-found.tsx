import { Link, Stack } from "expo-router";
import { StyleSheet, Text, useColorScheme, View } from "react-native";

import { colorsFor } from "@/constants/theme";

export default function NotFoundRoute() {
  const colorScheme = useColorScheme();
  const colors = colorsFor(colorScheme);

  return (
    <>
      <Stack.Screen options={{ title: "未找到" }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>页面不存在</Text>
        <Link href="/" style={[styles.link, { color: colors.accent }]}>
          返回首页
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  link: {
    fontSize: 16,
    fontWeight: "700",
  },
});
