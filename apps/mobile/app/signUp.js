import { StatusBar } from "expo-status-bar";
import {
  Text,
  View,
  Image,
  Alert,
  Pressable,
  Keyboard,
  Vibration,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import Animated from "react-native-reanimated";
import "react-native-url-polyfill/auto";
import React, { useState, useMemo } from "react";
import { supabase } from "../lib/supabase/client";
import { Link, useRouter } from "expo-router";
import { makeStyles } from "../assets/uiStyles";
import { useThemeColors } from "../theme/useThemeColors";
import LanguageSelector from "../components/languageSelector";
import { useTranslation } from "react-i18next";
import { failIf, validateEmail } from "../lib/utils";
import Input from "../components/input";
import Snackbar from "../components/Snackbar";
import Button from "../components/button";
import { useFadeSlideIn, useScaleFadeIn, useFadeIn } from "../lib/animations";

const logo = require("../assets/icon.png");

export default function SignUp() {
  const { t } = useTranslation();
  const { colors: theme } = useThemeColors();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  // Animation styles
  const field1Anim = useFadeSlideIn(100, 10);
  const field2Anim = useFadeSlideIn(120, 10);
  const field3Anim = useFadeSlideIn(140, 10);
  const buttonAnim = useFadeSlideIn(160, 10);

  async function signUpWithEmail() {
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
        t("signup.errors.password-no-match"),
        theme,
        () => setLoading(false),
      )
    )
      return;

    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      if (error.code === "email_address_invalid") {
        Alert.alert(t("signup.errors.email-wrong"));
      } else {
        Alert.alert(error.message);
      }

      setLoading(false);
      return;
    }
    if (!session) router.replace("checkEmail");
    Vibration.vibrate([0, 400, 300, 800]);
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1 flex flex-col items-center justify-between dark:bg-black"
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
                <Animated.View style={[{ width: "100%" }, field2Anim]}>
                  <Input
                    label={t("shared.password")}
                    placeholder={t("signup.password-holder")}
                    value={password}
                    onChange={(text) => setPassword(text)}
                    autoCapitalize="none"
                    secureTextEntry={true}
                    textContentType="password"
                    autoComplete="password-new"
                    clear={false}
                  />
                </Animated.View>
                <Animated.View style={[{ width: "100%" }, field3Anim]}>
                  <Input
                    label={t("signup.confirm-password")}
                    placeholder={t("signup.confirm-password-holder")}
                    value={passwordConfirmation}
                    onChange={(text) => setPasswordConfirmation(text)}
                    autoCapitalize="none"
                    secureTextEntry={true}
                    textContentType="password"
                    autoComplete="password-new"
                    clear={false}
                  />
                </Animated.View>
                <Animated.View className="items-center justify-center flex flex-col" style={[buttonAnim]}>
                  <Button
                    title={t("signup.button")}
                    disabled={loading}
                    onPress={() => signUpWithEmail()}
                  />
                </Animated.View>
                <Animated.View style={[{ marginTop: 8 }, buttonAnim]}>
                  <Link href="/">
                    <Text className="text-primary font-semibold">
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
              <Text className="text-primary-text text-sm">{t("privacy-policy")}</Text>
            </Link>
          </Animated.View>
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}
