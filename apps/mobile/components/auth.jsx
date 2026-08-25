import React, { useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import Input from "../components/input";
import Button from "../components/button";
import { signIn } from "../lib/supabase/auth";
import { Link, useRouter } from "expo-router";
import { useThemeColors } from "../theme/useThemeColors";
import { checkWelcomeSeen } from "../lib/welcomeSeen";
import { useTranslation } from "react-i18next";
import { failIf, validateEmail } from "../lib/utils";

export default function Auth() {
  const { colors } = useThemeColors();
  const { t } = useTranslation();

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    if (
      failIf(email === "", t("signup.errors.email-empty"), colors, () =>
        setLoading(false),
      )
    )
      return;
    if (
      failIf(!validateEmail(email), t("signup.errors.email-wrong"), colors, () =>
        setLoading(false),
      )
    )
      return;
    if (
      failIf(password === "", t("signup.errors.password-empty"), colors, () =>
        setLoading(false),
      )
    )
      return;

    const { error } = await signIn(email, password);

    if (error) {
      if (error.code === "invalid_credentials") {
        global.showSnackbar(
          t("login.errors.invalid-credentials"),
          3000,
          colors.coral,
        );
      } else if (error.code === "email_not_confirmed") {
        global.showSnackbar(
          t("login.errors.email-not-confirmed"),
          3000,
          colors.coral,
        );
      } else {
        global.showSnackbar(t("common.error-generic"), 3000, colors.coral);
      }
      setLoading(false);
      return;
    }

    checkWelcomeSeen()
      .then((welcomeSeen) => {
        if (welcomeSeen) {
          router.replace("/(app)/");
        } else {
          router.replace("/welcome");
        }
      })
      .catch((error) => console.log(error));
    setLoading(false);
  }

  return (
    <>
      {loading && (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          className="mt-10"
        />
      )}
      {!loading && (
        <View className="flex flex-col w-full px-8 gap-4 justify-center items-center">
            <Input
              label={t("shared.email")}
              placeholder="email@example.com"
              value={email}
              onChange={(text) => setEmail(text)}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="username"
              textContentType="emailAddress"
              className="input"
              accessibilityLabel="Email input"
              clear={false}
            />
            <Input
              label={t("shared.password")}
              onChange={(text) => setPassword(text)}
              value={password}
              secureTextEntry={true}
              placeholder="*********"
              autoCapitalize="none"
              keyboardType="default"
              autoComplete="password"
              textContentType="password"
              className="input"
              accessibilityLabel="Password input"
              clear={false}
            />
            <Link href="/forgotPassword">
              <Text className="text-text font-semibold text-sm">
                {t("login.forgot-password")}
              </Text>
            </Link>
            <Button
              title={t("login.button")}
              disabled={loading}
              onPress={signInWithEmail}
            />
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginTop: 15,
            }}
          >
            <Link href="/signUp">
              <Text className="text-text font-semibold">
                {t("login.create-account")}
              </Text>
            </Link>
          </View>
        </View>
      )}
    </>
  );
}
