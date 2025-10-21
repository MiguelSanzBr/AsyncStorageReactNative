import React from "react";
import { View, Text } from "react-native";

interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AuthCard({ title, subtitle, children }: Props) {
  return (
    <View className="w-full bg-white rounded-2xl p-6 shadow-lg">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900 text-center">{title}</Text>
        {subtitle && (
          <Text className="text-base text-gray-500 text-center mt-1">{subtitle}</Text>
        )}
      </View>
      {children}
    </View>
  );
}
