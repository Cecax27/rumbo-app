import React, { useState } from "react";
import {
  Alert,
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

export default function Auth() {
  const { colors } = useThemeColors();
  const { t } = useTranslation();

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await signIn(email, password);

    if (error) Alert.alert(error.message);
    else {
      checkWelcomeSeen()
        .then((welcomeSeen) => {
          if (welcomeSeen) {
            router.replace("/(app)/");
          } else {
            router.replace("/welcome");
          }
        })
        .catch((error) => console.log(error));
    }
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
