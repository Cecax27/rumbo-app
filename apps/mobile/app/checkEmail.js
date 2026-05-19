import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useMemo } from "react";
import { makeStyles } from "../assets/uiStyles";
import { useThemeColors } from "../theme/useThemeColors";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Button from "../components/button";

export default function CheckEmail() {
  const { t } = useTranslation();
  const { colors: theme } = useThemeColors();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={[styles.centeredView, { gap: 22 }]}>
        <Image
          source={require("../assets/icon.png")}
          style={{ width: 100, height: 100 }}
        />
        <Text style={[styles.h1, { textAlign: "center" }]}>
          {t("check-email.title")}
        </Text>
        <Text style={[styles.h2, { textAlign: "center" }]}>
          {t("check-email.subtitle")}
        </Text>
        <Text style={[styles.label, { textAlign: "center" }]}>
          {t("check-email.help")}
        </Text>
        <Button
          title={t("check-email.button")}
          onPress={() => router.push("/")}
        />
      </View>
    </View>
  );
}
