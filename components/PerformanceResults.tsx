import React from "react";
import { View, Text } from "react-native";

interface Result {
  storageType: "asyncStorage" | "sqlite";
  time: number;
  success: boolean;
  message?: string;
}

interface Props {
  results: Result[];
}

export default function PerformanceResults({ results }: Props) {
  if (!results?.length) return null;

  return (
    <View className="mb-5 p-4 bg-blue-50 rounded-xl border border-blue-200">
      <Text className="text-base font-semibold text-blue-900 mb-2">
        Resultados de Desempenho
      </Text>
      {results.map((r, i) => (
        <Text
          key={i}
          className={`text-sm font-medium ${
            r.success ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {r.storageType === "asyncStorage" ? "AsyncStorage" : "SQLite"}:{" "}
          {r.time.toFixed(2)}ms - {r.success ? "✅" : "❌"} {r.message}
        </Text>
      ))}
    </View>
  );
}
