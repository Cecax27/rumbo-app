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
        contentContainerStyle={{ flexGrow: 1}}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Snackbar />
        <View className="w-full flex-1 flex flex-col items-center justify-between">
          <View className="w-full flex flex-col items-center justify-start gap-10">
            <Image
              source={require("../assets/images/header-login.png")}
              className="w-full h-[250px]"
            />
            <View className="flex-row items-center gap-3">
              <Image source={logo} className="w-12 h-12" />
              <Text className="font-quicksand-bold text-4xl text-black dark:text-white">
                Rumbo
              </Text>
            </View>
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
                <Button
                  title={t("signup.button")}
                  disabled={loading}
                  onPress={() => signUpWithEmail()}
                />
                <View style={{ marginTop: 8 }}>
                  <Link href="/">
                    <Text className="text-primary font-semibold">
                      {t("signup.have-account")}
                    </Text>
                  </Link>
                </View>
              </View>
            </View>
          )}
          <View className="mb-2 items-center gap-4">
            <LanguageSelector />
            <Link href="https://rumbo-ten.vercel.app/privacy" className="mb-4">
              <Text className="text-primary-text text-sm">{t("privacy-policy")}</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}
