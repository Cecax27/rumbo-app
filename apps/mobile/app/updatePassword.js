import { StatusBar } from "expo-status-bar";
import {
  Text,
  View,
  Image,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import Animated from "react-native-reanimated";
import "react-native-url-polyfill/auto";
import React, { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { makeStyles } from "../assets/uiStyles";
import { useThemeColors } from "../theme/useThemeColors";
import { useTranslation } from "react-i18next";
import { failIf } from "../lib/utils";
import Input from "../components/input";
import Snackbar from "../components/Snackbar";
import Button from "../components/button";
import { updateUserPassword } from "../lib/supabase/auth";
import { useFadeSlideIn } from "../lib/animations";

const logo = require("../assets/icon.png");

export default function UpdatePassword() {
  const { t } = useTranslation();
  const { colors: theme } = useThemeColors();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const router = useRouter();

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const field1Anim = useFadeSlideIn(100, 10);
  const field2Anim = useFadeSlideIn(120, 10);
  const buttonAnim = useFadeSlideIn(140, 10);

  async function handleUpdatePassword() {
    setLoading(true);
    Keyboard.dismiss();
    if (
      failIf(password === "", t("signup.errors.password-empty"), theme, () =>
        setLoading(false),
      )
    )
      return;
    if (
      failIf(
        password.length < 8,
        t("signup.errors.short-password"),
        theme,
        () => setLoading(false),
      )
    )
      return;
    if (
      failIf(
        password !== passwordConfirmation,
        t("signup.password-no-match"),
        theme,
        () => setLoading(false),
      )
    )
      return;

    const { error } = await updateUserPassword(password);

    if (error) {
      Alert.alert(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    Alert.alert(t("common.success"), t("update-password.success"), [
      { text: "OK", onPress: () => router.replace("/") },
    ]);
  }

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1 flex flex-col items-center justify-between dark:bg-neutral-900"
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
    >
      <ScrollView
        className="w-full"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Snackbar />
        <View className="w-full flex-1 flex flex-col items-center justify-between">
          <View className="w-full flex flex-col items-center justify-start gap-10">
            <Animated.View style={[{ width: "100%" }]}>
              <Image
                source={require("../assets/images/header-login.png")}
                className="w-full h-[250px]"
              />
            </Animated.View>
            <Animated.View style={[{ flexDirection: "row", alignItems: "center", gap: 12 }]}>
              <Image source={logo} className="w-12 h-12" />
              <Text className="font-quicksand-bold text-4xl text-black dark:text-white">
                Rumbo
              </Text>
            </Animated.View>
          </View>
          {loading && (
            <ActivityIndicator
              size="large"
              color={theme.primary}
              style={{ marginTop: 40 }}
            />
          )}
          {!loading && (
            <View className="flex-1 w-full justify-center">
              <View className="flex flex-col gap-4 w-full px-8 justify-center items-center">
                <Animated.View style={[{ width: "100%" }, field1Anim]}>
                  <Text style={[styles.h2, { textAlign: "center", marginBottom: 8 }]}>
                    {t("update-password.title")}
                  </Text>
                  <Text style={[styles.label, { textAlign: "center", marginBottom: 16 }]}>
                    {t("update-password.subtitle")}
                  </Text>
                </Animated.View>
                <Animated.View style={[{ width: "100%" }, field1Anim]}>
                  <Input
                    label={t("shared.password")}
                    placeholder={t("signup.password-holder")}
                    value={password}
                    onChange={(text) => setPassword(text)}
                    autoCapitalize="none"
                    secureTextEntry={true}
                    textContentType="newPassword"
                    autoComplete="new-password"
                    clear={false}
                  />
                </Animated.View>
                <Animated.View style={[{ width: "100%" }, field2Anim]}>
                  <Input
                    label={t("signup.confirm-password")}
                    placeholder={t("signup.confirm-password-holder")}
                    value={passwordConfirmation}
                    onChange={(text) => setPasswordConfirmation(text)}
                    autoCapitalize="none"
                    secureTextEntry={true}
                    textContentType="newPassword"
                    autoComplete="new-password"
                    clear={false}
                  />
                </Animated.View>
                <Animated.View className="items-center justify-center flex flex-col" style={[buttonAnim]}>
                  <Button
                    title={t("update-password.button")}
                    disabled={loading}
                    onPress={() => handleUpdatePassword()}
                  />
                </Animated.View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}
