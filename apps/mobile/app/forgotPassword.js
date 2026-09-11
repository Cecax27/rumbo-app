import { StatusBar } from "expo-status-bar";
import {
  Text,
  View,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import Animated from "react-native-reanimated";
import "react-native-url-polyfill/auto";
import React, { useState, useMemo } from "react";
import { Link, useRouter } from "expo-router";
import { makeStyles } from "../assets/uiStyles";
import { useThemeColors } from "../theme/useThemeColors";
import LanguageSelector from "../components/languageSelector";
import { useTranslation } from "react-i18next";
import { failIf, validateEmail } from "../lib/utils";
import Input from "../components/input";
import Button from "../components/button";
import { resetPassword } from "../lib/supabase/auth";
import { useFadeSlideIn } from "../lib/animations";

const logo = require("../assets/icon.png");

export default function ForgotPassword() {
  const { t } = useTranslation();
  const { colors: theme } = useThemeColors();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const fieldAnim = useFadeSlideIn(100, 10);
  const buttonAnim = useFadeSlideIn(140, 10);

  async function sendResetEmail() {
    setLoading(true);
    Keyboard.dismiss();
    if (
      failIf(email === "", t("signup.errors.email-empty"), theme, () =>
        setLoading(false),
      )
    )
      return;
    if (
      failIf(!validateEmail(email), t("signup.errors.email-wrong"), theme, () =>
        setLoading(false),
      )
    )
      return;

    const { error } = await resetPassword(email);

    if (error) {
      global.showSnackbar(t("forgot-password.error"), 3000, theme.coral);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.replace("/checkEmail");
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
                <Animated.View style={[{ width: "100%" }, fieldAnim]}>
                  <Text style={[styles.h2, { textAlign: "center", marginBottom: 8 }]}>
                    {t("forgot-password.title")}
                  </Text>
                  <Text style={[styles.label, { textAlign: "center", marginBottom: 16 }]}>
                    {t("forgot-password.subtitle")}
                  </Text>
                </Animated.View>
                <Animated.View style={[{ width: "100%" }, fieldAnim]}>
                  <Input
                    label={t("shared.email")}
                    placeholder="email@example.com"
                    value={email}
                    onChange={(text) => setEmail(text)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    email
                    clear={false}
                  />
                </Animated.View>
                <Animated.View className="items-center justify-center flex flex-col" style={[buttonAnim]}>
                  <Button
                    title={t("forgot-password.button")}
                    disabled={loading}
                    onPress={() => sendResetEmail()}
                  />
                </Animated.View>
                <Animated.View style={[{ marginTop: 8 }, buttonAnim]}>
                  <Link href="/">
                    <Text className="text-text font-semibold">
                      {t("signup.have-account")}
                    </Text>
                  </Link>
                </Animated.View>
              </View>
            </View>
          )}
          <Animated.View style={[{ marginBottom: 8, alignItems: "center", gap: 16 }]}>
            <LanguageSelector />
            <Link href="https://rumbo-ten.vercel.app/privacy" className="mb-4">
              <Text className="text-text text-sm">{t("privacy-policy")}</Text>
            </Link>
          </Animated.View>
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}
