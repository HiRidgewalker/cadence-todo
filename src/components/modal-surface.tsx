import type { ReactNode } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { radius, spacing, type ThemeColors } from "@/constants/theme";

export function ModalSurface({
  open, onClose, colors, children, placement,
}: {
  open: boolean;
  onClose: () => void;
  colors: ThemeColors;
  children: ReactNode;
  placement: "sheet" | "dialog";
}) {
  const sheet = placement === "sheet";
  const { bottom } = useSafeAreaInsets();

  return (
    <Modal
      visible={open}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType={sheet ? "slide" : "fade"}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          accessible={false}
          importantForAccessibility="no"
          onPress={onClose}
          style={[StyleSheet.absoluteFill, styles.backdrop]}
        />
        <SafeAreaView
          edges={sheet ? ["left", "right"] : ["top", "left", "right", "bottom"]}
          pointerEvents="box-none"
          style={sheet ? styles.sheetWrap : styles.dialogWrap}
        >
          <View
            accessibilityViewIsModal
            style={[
              styles.surface,
              sheet ? [styles.sheet, { paddingBottom: bottom + spacing.md }] : styles.dialog,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {children}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  backdrop: { backgroundColor: "#00000055" },
  sheetWrap: { flex: 1, justifyContent: "flex-end" },
  dialogWrap: { alignItems: "center", flex: 1, justifyContent: "center", paddingHorizontal: spacing.lg },
  surface: { borderWidth: 1, padding: spacing.lg },
  sheet: {
    borderTopLeftRadius: radius.panel,
    borderTopRightRadius: radius.panel,
    maxHeight: "88%",
    paddingTop: spacing.sm,
  },
  dialog: { borderRadius: radius.panel, gap: spacing.md, maxWidth: 318, width: "100%" },
});
