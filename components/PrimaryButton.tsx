import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

interface Props {
  text: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function PrimaryButton({ text, onPress, loading, disabled }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`w-full py-4 rounded-xl items-center justify-center ${
        disabled ? "bg-blue-400 opacity-60" : "bg-blue-600"
      }`}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className="text-white text-base font-semibold">{text}</Text>
      )}
    </TouchableOpacity>
  );
}
