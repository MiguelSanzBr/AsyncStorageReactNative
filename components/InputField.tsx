import React from "react";
import { View, TextInput, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

interface Props {
  label: string;
  icon?: keyof typeof Feather.glyphMap;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  keyboardType?: "default" | "email-address";
}

export default function InputField({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  error,
  keyboardType,
}: Props) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-2">{label}</Text>
      <View
        className={`flex-row items-center border rounded-xl px-4 py-3 ${
          error ? "border-red-500" : "border-gray-300"
        } bg-white`}
      >
        {icon && <Feather name={icon} size={18} color="#6b7280" style={{ marginRight: 8 }} />}
        <TextInput
          className="flex-1 text-gray-900 text-base"
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
      </View>
      {error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}
    </View>
  );
}
