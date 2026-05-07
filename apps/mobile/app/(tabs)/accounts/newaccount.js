import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from "react-native";
import { makeStyles } from "../../../assets/uiStyles";
import { useRouter, Stack } from "expo-router";
import {
  getAccountsTypes,
  addAccount,
} from "../../../lib/supabase/transactions";
import { useTheme } from "../../../theme/useTheme";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/MaterialIcons";
import ColorPicker from "../../../components/colorPicker";
import IconPicker from "../../../components/iconPicker";
import Input from "../../../components/input";
import InputPicker from "../../../components/inputPicker";
import { failIf } from "../../../lib/utils";
import Snackbar from "../../../components/Snackbar";

export default function NewAccount() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const router = useRouter();
  const [accountsTypes, setAccountsTypes] = useState([]);
  const [succesful, setSuccesful] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    account_type: 1,
    color: "#111827",
    icon: "credit-card",
    cutoff_day: null,
    bank_name: null,
    is_primary_account: null,
    credit_limit: null,
    platform: null,
    initial_amount: null,
    estimated_return_rate: null,
    loan_amount: null,
    interest_rate: null,
  });

  useEffect(() => {
    const fetchAccountsTypes = async () => {
      const accountsTypesData = await getAccountsTypes();
      setAccountsTypes(accountsTypesData);
    };
    fetchAccountsTypes();
  }, []);

  const onClose = useCallback(() => {
    router.replace("/(tabs)/accounts");
  }, [router]);

  useEffect(() => {
    if (succesful !== null) {
      if (succesful) {
        Alert.alert(
          t("newAccount.success.title"),
          t("newAccount.success.message")
        );
        onClose();
      } else {
        Alert.alert(t("newAccount.error.title"), t("newAccount.error.message"));
      }
    }
  }, [succesful, onClose, t]);

  const handleSubmit = async () => {
    Keyboard.dismiss();
    
    if (failIf(formData.name === "", t("newAccount.error.name-empty"), theme, () => {})) return;
    
    if (formData.account_type === 2) {
      if (failIf(
        formData.cutoff_day === null || 
        isNaN(formData.cutoff_day) || 
        formData.cutoff_day < 1 || 
        formData.cutoff_day > 31,
        t("newAccount.error.invalid-cutoff"),
        theme,
        () => {}
      )) return;
    }

    const response = await addAccount(formData);
    setSuccesful(response);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <Stack.Screen
        options={{
          title: t("newAccount.title"),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginRight: 15 }}
            >
              <Icon name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView
        style={styles.modalContent}
        keyboardShouldPersistTaps="handled"
      >
        <InputPicker
          label={t("newAccount.accountType")}
          value={formData.account_type}
          onChange={(text) =>
            setFormData((prev) => ({ ...prev, account_type: text }))
          }
          options={accountsTypes}
          optionlabel="type"
          labelInline={false}
          icon="credit-card"
          prompt={t("newAccount.selectAccountType")}
          labelFormat={(label)=>t(`accounts.types.${label}`)}
        />

        <Input
          label={t("newAccount.accountName")}
          value={formData.name}
          onChange={(text) => setFormData((prev) => ({ ...prev, name: text }))}
          placeholder={t("newAccount.accountNamePlaceholder")}
          labelInline={false}
          icon="text-format"
        />

        <Input
          label={t("newAccount.bankName")}
          value={formData.bank_name}
          onChange={(text) =>
            setFormData((prev) => ({ ...prev, bank_name: text }))
          }
          placeholder={t("newAccount.bankNamePlaceholder")}
          labelInline={false}
          icon="account-balance"
          optional
        />

        <ColorPicker
          value={formData.color}
          onPress={(color) => setFormData((prev) => ({ ...prev, color }))}
        />

        <IconPicker
          value={formData.icon}
          onPress={(icon) => setFormData((prev) => ({ ...prev, icon }))}
          activeColor={formData.color}
        />

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>
            {t("newAccount.primaryAccount")}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Switch
              trackColor={{ false: theme.surface, true: theme.subtext }}
              thumbColor={theme.primary}
              ios_backgroundColor="#ccc"
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, is_primary_account: value }))
              }
              value={formData.is_primary_account}
            />
            {formData.is_primary_account && (
              <Text
                style={{
                  fontSize: 10,
                  color: theme.subtext,
                  fontVariant: "italic",
                }}
              >
                {t("newAccount.primaryAccountWarning")}
              </Text>
            )}
          </View>
        </View>

        {formData.account_type === 2 && (
          <Input
            label={t("newAccount.cutoffDay")}
            value={formData.cutoff_day}
            onChange={(text) =>
              setFormData((prev) => ({ ...prev, cutoff_day: text }))
            }
            placeholder={t("newAccount.cutoffDayPlaceholder")}
            numeric
            labelInline={false}
            icon="calendar-today"
          />
        )}

        {formData.account_type === 2 && (
          <Input
            labelInline={false}
            label={t("newAccount.creditLimit")}
            value={formData.credit_limit}
            onChange={(text) => {
              const cleanedText = text.replace(/[^0-9.]/g, "");
              const value = cleanedText.replace(/\.(?=.*\.)/g, "");
              setFormData((prev) => ({ ...prev, credit_limit: value }));
            }}
            numeric
            placeholder="0.00"
            icon="attach-money"
          />
        )}

        {formData.account_type === 4 && (
          <Input
            label={t("newAccount.platform")}
            value={formData.platform}
            onChange={(text) => setFormData((prev) => ({ ...prev, platform: text }))}
            placeholder={t("newAccount.platformPlaceholder")}
            labelInline={false}
            icon="devices"
          />
        )}

        {formData.account_type === 4 && (
          <Input
            label={t("newAccount.initialAmount")}
            value={formData.initial_amount}
            onChange={(text) => {
              const cleanedText = text.replace(/[^0-9.]/g, "");
              const value = cleanedText.replace(/\.(?=.*\.)/g, "");
              setFormData((prev) => ({ ...prev, initial_amount: value }));
            }}
            placeholder={t("newAccount.initialAmount")}
            numeric
            labelInline={false}
            icon="attach-money"
          />
        )}

        {formData.account_type === 4 && (
          <Input
            label={t("newAccount.estimatedReturnRate")}
            value={formData.estimated_return_rate}
            onChange={(text) =>
              setFormData((prev) => ({
                ...prev,
                estimated_return_rate: text,
              }))
            }
            placeholder={t("newAccount.returnRatePlaceholder")}
            numeric
            labelInline={false}
            icon="trending-up"
          />
        )}

        {formData.account_type === 5 && (
          <Input
            label={t("newAccount.loanAmount")}
            value={formData.loan_amount}
            onChange={(text) => {
              const cleanedText = text.replace(/[^0-9.]/g, "");
              const value = cleanedText.replace(/\.(?=.*\.)/g, "");
              setFormData((prev) => ({ ...prev, loan_amount: value }));
            }}
            placeholder={t("newAccount.loanAmount")}
            numeric
            labelInline={false}
            icon="attach-money"
          />
        )}

        {formData.account_type === 5 && (
          <Input
            label={t("newAccount.loanInterestRate")}
            value={formData.interest_rate}
            onChange={(text) =>
              setFormData((prev) => ({ ...prev, interest_rate: text }))
            }
            placeholder={t("newAccount.returnRatePlaceholder")}
            numeric
            labelInline={false}
            icon="percent"
          />
        )}

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[styles.button, styles.buttonClose]}
            onPress={handleSubmit}
          >
            <Text style={styles.textStyle}>
              {t("newAccount.addAccountButton")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Snackbar />
    </KeyboardAvoidingView>
  );
}
