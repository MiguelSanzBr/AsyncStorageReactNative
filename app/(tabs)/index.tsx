// app/index.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = () => {
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        
        {/* Header com ícone de sucesso */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#10b981" />
          </View>
          <Text style={styles.title}>Login Realizado com Sucesso! 🎉</Text>
          <Text style={styles.subtitle}>
            Você está conectado ao sistema
          </Text>
        </View>

        {/* Card de informações */}
        <View style={styles.card}>
          <View style={styles.infoSection}>
            <Ionicons name="person" size={24} color="#2563eb" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>Usuário Autenticado</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Ionicons name="time" size={24} color="#2563eb" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Sessão Ativa</Text>
              <Text style={styles.infoValue}>{new Date().toLocaleString('pt-BR')}</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Ionicons name="shield-checkmark" size={24} color="#2563eb" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Segurança</Text>
              <Text style={styles.infoValue}>Conexão Protegida</Text>
            </View>
          </View>
        </View>

        {/* Mensagem de boas-vindas */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Bem-vindo de Volta! 👋</Text>
          <Text style={styles.welcomeMessage}>
            Sua sessão foi iniciada com sucesso. Agora você tem acesso completo 
            às funcionalidades do aplicativo.
          </Text>
        </View>

        {/* Botão de logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutButtonText}>Sair da Conta</Text>
        </TouchableOpacity>

        {/* Rodapé */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Seguro • Confiável • Rápido
          </Text>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111827',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6b7280',
    lineHeight: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    // Substituindo shadow props por boxShadow para web
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 5, // Mantém para Android
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoText: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  welcomeCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  welcomeMessage: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 24,
  },
  logoutButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
});