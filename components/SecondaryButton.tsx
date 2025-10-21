import React from "react";
import { TouchableOpacity, Text } from "react-native";

interface Props {
  text: string;
  onPress: () => void;
  disabled?: boolean;
}

export default function SecondaryButton({ text, onPress, disabled }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`w-full py-4 rounded-xl border border-blue-600 items-center justify-center ${
        disabled ? "opacity-60" : ""
      }`}
    >
      <Text className="text-blue-600 text-base font-semibold">{text}</Text>
    </TouchableOpacity>
  );
}
