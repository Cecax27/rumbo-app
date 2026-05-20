import "../i18n"; // importante importar ANTES que App
import { useTranslation } from "react-i18next";
import {
  Text,
  View,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import Animated from "react-native-reanimated";
import "react-native-url-polyfill/auto";
import Auth from "../components/auth";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";
import { Link, useRouter } from "expo-router";
import { useThemeColors } from "../theme/useThemeColors";
import { checkWelcomeSeen } from "../lib/welcomeSeen";
import LanguageSelector from "../components/languageSelector";
import { useFadeSlideIn, useScaleFadeIn, useFadeIn } from "../lib/animations";

const logo = require("../assets/icon.png");

export default function Index() {
  const { colors: theme } = useThemeColors();
  const router = useRouter();
  const { t } = useTranslation();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);

  // Animation styles
  const authAnim = useFadeSlideIn(100, 10);

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    setLoading(false);
    if (session) {
      checkWelcomeSeen()
        .then((welcomeSeen) => {
          if (welcomeSeen) {
            router.replace("/(tabs)/");
          } else {
            router.replace("/welcome");
          }
        })
        .catch((error) => console.log(error));
    }
  }, []);

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1 flex flex-col items-center justify-between dark:bg-black"
      behavior="padding"
    >
      <ScrollView
        className="w-full"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
          <Animated.View style={[{ flex: 1, width: "100%", justifyContent: "center" }, authAnim]}>
            <Auth />
          </Animated.View>
        )}
        <Animated.View style={[{ marginBottom: 8, alignItems: "center", gap: 16 }]}>
          <LanguageSelector />
          <Link href="https://rumbo-ten.vercel.app/privacy" className="mb-4">
            <Text className="text-primary-text text-sm">
              {t("privacy-policy")}
            </Text>
          </Link>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
