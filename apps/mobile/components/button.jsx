import React from "react";
import { Pressable, Text, ActivityIndicator } from "react-native";
import { useThemeColors } from "../theme/useThemeColors";

export default function Button({
  title,
  onPress,
  disabled = false,
  loading = false,
  className = "bg-primary button",
  textClassName = "text-white font-semibold text-sm font-body",
}) {
  const { colors } = useThemeColors();
  const isDisabled = disabled || loading;

  return (
    <Pressable className={className} disabled={isDisabled} onPress={onPress}>
      {loading ? (
        <ActivityIndicator size="small" color={colors.background} />
      ) : (
        <Text className={textClassName}>{title}</Text>
      )}
    </Pressable>
  );
}