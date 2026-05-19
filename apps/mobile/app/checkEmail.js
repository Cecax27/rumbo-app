import { View, Text, Image } from "react-native";
import Animated from "react-native-reanimated";
import React, { useMemo } from "react";
import { makeStyles } from "../assets/uiStyles";
import { useThemeColors } from "../theme/useThemeColors";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Button from "../components/button";
import { useScaleFadeIn, useFadeSlideIn } from "../lib/animations";

export default function CheckEmail() {
  const { t } = useTranslation();
  const { colors: theme } = useThemeColors();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const router = useRouter();

  // Animation styles
  const iconAnim = useScaleFadeIn(0);
  const titleAnim = useFadeSlideIn(200, 20);
  const subtitleAnim = useFadeSlideIn(350, 20);
  const helpAnim = useFadeSlideIn(480, 20);
  const buttonAnim = useFadeSlideIn(600, 20);

  return (
    <View style={styles.container}>
      <View style={[styles.centeredView, { gap: 22 }]}>
        <Animated.View style={iconAnim}>
          <Image
            source={require("../assets/icon.png")}
            style={{ width: 100, height: 100 }}
          />
        </Animated.View>
        <Animated.View style={titleAnim}>
          <Text style={[styles.h1, { textAlign: "center" }]}>
            {t("check-email.title")}
          </Text>
        </Animated.View>
        <Animated.View style={subtitleAnim}>
          <Text style={[styles.h2, { textAlign: "center" }]}>
            {t("check-email.subtitle")}
          </Text>
        </Animated.View>
        <Animated.View style={helpAnim}>
          <Text style={[styles.label, { textAlign: "center" }]}>
            {t("check-email.help")}
          </Text>
        </Animated.View>
        <Animated.View style={buttonAnim}>
          <Button
            title={t("check-email.button")}
            onPress={() => router.push("/")}
          />
        </Animated.View>
      </View>
    </View>
  );
}
