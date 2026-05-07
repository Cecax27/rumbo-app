import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import React, { useMemo } from "react";
import { makeStyles } from "../assets/uiStyles";
import { useTheme } from "../theme/useTheme";
import { useRouter } from "expo-router";
import { setWelcomeSeen } from "../lib/welcomeSeen";
import { useTranslation } from "react-i18next";

export default function Welcome() {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { t } = useTranslation();
  const router = useRouter();

  const handleGetStarted = async () => {
    await setWelcomeSeen();
    router.replace("/(tabs)/accounts/");
  };

  return (
    <SafeAreaView style={styles.fullContainer}>
      <ScrollView contentContainerStyle={{ alignItems: "center", padding: 20 }}>
        <Image
          source={require("../assets/icon.png")}
          style={{ width: 100, height: 100, marginTop: 15 }}
        />
        <Text style={[styles.title, { color: theme.mint }]}>
          {t("welcome.title")}
        </Text>
        <Text
          style={[
            styles.p,
            { textAlign: "center", marginBottom: 30, color: theme.subtext },
          ]}
        >
          {t("welcome.subtitle")}
        </Text>

        {/* Paso 1 */}
        <View
          style={{
            backgroundColor: theme.surface,
            padding: 20,
            borderRadius: 20,
            marginBottom: 15,
            width: "100%",
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 5,
          }}
        >
          <Text
            style={[
              styles.p,
              { fontSize: 14, fontWeight: "bold", marginBottom: 8 },
            ]}
          >
            {t("welcome.steps.createAccount.title")}
          </Text>
          <Text style={[styles.p, { fontSize: 12 }]}>
            {t("welcome.steps.createAccount.description")}
          </Text>
        </View>

        {/* Paso 2 */}
        <View
          style={{
            backgroundColor: theme.surface,
            padding: 20,
            borderRadius: 20,
            marginBottom: 15,
            width: "100%",
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 5,
          }}
        >
          <Text
            style={[
              styles.p,
              { fontSize: 14, fontWeight: "bold", marginBottom: 8 },
            ]}
          >
            {t("welcome.steps.addTransactions.title")}
          </Text>
          <Text style={[styles.p, { fontSize: 12 }]}>
            {t("welcome.steps.addTransactions.description")}
          </Text>
        </View>

        {/* Paso 3 */}
        <View
          style={{
            backgroundColor: theme.surface,
            padding: 20,
            borderRadius: 20,
            marginBottom: 15,
            width: "100%",
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 5,
          }}
        >
          <Text
            style={[
              styles.p,
              { fontSize: 14, fontWeight: "bold", marginBottom: 8 },
            ]}
          >
            {t("welcome.steps.exploreDashboard.title")}
          </Text>
          <Text style={[styles.p, { fontSize: 12 }]}>
            {t("welcome.steps.exploreDashboard.description")}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: theme.surface,
            padding: 20,
            borderRadius: 20,
            marginBottom: 15,
            width: "100%",
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 5,
          }}
        >
          <Text
            style={[
              styles.p,
              { fontSize: 14, fontWeight: "bold", marginBottom: 8 },
            ]}
          >
            {t("welcome.steps.exploreDashboard.title")}
          </Text>
          <Text style={[styles.p, { fontSize: 12 }]}>
            {t("welcome.steps.exploreDashboard.description")}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: theme.surface,
            padding: 20,
            borderRadius: 20,
            marginBottom: 15,
            width: "100%",
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 5,
          }}
        >
          <Text
            style={[
              styles.p,
              { fontSize: 14, fontWeight: "bold", marginBottom: 8 },
            ]}
          >
            {t("welcome.steps.exploreDashboard.title")}
          </Text>
          <Text style={[styles.p, { fontSize: 12 }]}>
            {t("welcome.steps.exploreDashboard.description")}
          </Text>
        </View>

        {/* Botón para continuar */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleGetStarted()} // o el flujo que quieras
        >
          <Text style={styles.buttonText}>{t("welcome.getStarted")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
