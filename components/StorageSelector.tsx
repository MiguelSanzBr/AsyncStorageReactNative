import React from "react";
import { View, Text } from "react-native";
import Checkbox from "../components/Checkbox";

interface Props {
  sqliteAvailable: boolean;
  selectedStorage: "asyncStorage" | "sqlite";
  setSelectedStorage: (val: "asyncStorage" | "sqlite") => void;
}

export default function StorageSelector({
  sqliteAvailable,
  selectedStorage,
  setSelectedStorage,
}: Props) {
  return (
    <View className="mb-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
      <Text className="text-base font-semibold text-slate-800 mb-3">
        Escolha o Armazenamento
      </Text>
      <Checkbox
        label="AsyncStorage"
        description="Armazenamento simples baseado em chave-valor."
        value={selectedStorage === "asyncStorage"}
        onValueChange={(v) => v && setSelectedStorage("asyncStorage")}
      />
      <Checkbox
        label="SQLite"
        description="Banco de dados relacional para dados complexos."
        value={selectedStorage === "sqlite"}
        onValueChange={(v) => v && setSelectedStorage("sqlite")}
        disabled={!sqliteAvailable}
      />
      {!sqliteAvailable && (
        <Text className="text-xs text-red-500 italic mt-2">
          SQLite não está disponível no momento.
        </Text>
      )}
    </View>
  );
}
