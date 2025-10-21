// app/(auth)/login.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Image,
  Platform
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import Checkbox from '../../components/Checkbox';
import { AsyncStorageService } from '../../services/AsyncStorageService';
import { SQLiteService } from '../../services/SQLiteService';

type StorageType = 'asyncStorage' | 'sqlite';

interface PerformanceResult {
  storageType: StorageType;
  time: number;
  success: boolean;
  message?: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState<StorageType>('asyncStorage');
  const [performanceResults, setPerformanceResults] = useState<PerformanceResult[]>([]);
  const [sqliteAvailable, setSqliteAvailable] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true); // 🌙 modo escuro/claro

  // Inicializar SQLite
  useEffect(() => {
    const initializeSQLite = async () => {
      try {
        await SQLiteService.init();
        console.log('SQLite inicializado com sucesso');
      } catch (error) {
        console.error('Erro ao inicializar SQLite:', error);
        setSqliteAvailable(false);
        setSelectedStorage('asyncStorage');
        Alert.alert(
          'Aviso', 
          'SQLite não está disponível. Usando AsyncStorage como padrão.'
        );
      }
    };
    initializeSQLite();
  }, []);

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
    };

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    
    try {
      let result;
      
      if (selectedStorage === 'asyncStorage') {
        result = await AsyncStorageService.getUserByEmail(formData.email.trim());
      } else {
        if (!sqliteAvailable) {
          Alert.alert('Erro', 'SQLite não está disponível. Use AsyncStorage.');
          setLoading(false);
          return;
        }
        result = await SQLiteService.getUserByEmail(formData.email.trim());
      }

      const performanceResult: PerformanceResult = {
        storageType: selectedStorage,
        time: result.time,
        success: result.success,
        message: result.success ? 'Busca realizada com sucesso!' : result.error
      };

      setPerformanceResults(prev => [...prev, performanceResult]);

      if (result.success && result.user) {
        if (result.user.password === formData.password) {
          Alert.alert(
            'Sucesso!', 
            `Login realizado com sucesso usando ${selectedStorage === 'asyncStorage' ? 'AsyncStorage' : 'SQLite'}!\n\nTempo de busca: ${result.time.toFixed(2)}ms`,
            [
              {
                text: 'OK',
                onPress: () => {
                  setFormData({
                    email: '',
                    password: '',
                  });
                }
              }
            ]
          );
        } else {
          Alert.alert('Erro', 'Senha incorreta. Tente novamente.');
        }
      } else {
        Alert.alert('Erro', (result.error || 'Usuário não encontrado. Verifique seu email.'));
      }
    } catch (error) {
      console.error('Erro no login:', error);
      Alert.alert('Erro', 'Falha no login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestPerformance = async () => {
    if (!validateForm()) return;
    setLoading(true);
    
    try {
      const testResults: PerformanceResult[] = [];
      const asyncResult = await AsyncStorageService.getUserByEmail(formData.email.trim());
      
      testResults.push({
        storageType: 'asyncStorage',
        time: asyncResult.time,
        success: asyncResult.success,
        message: asyncResult.success ? 'AsyncStorage: OK' : asyncResult.error
      });

      if (sqliteAvailable) {
        const sqliteResult = await SQLiteService.getUserByEmail(formData.email.trim());
        
        testResults.push({
          storageType: 'sqlite',
          time: sqliteResult.time,
          success: sqliteResult.success,
          message: sqliteResult.success ? 'SQLite: OK' : sqliteResult.error
        });
      }

      setPerformanceResults(testResults);

      if (sqliteAvailable) {
        Alert.alert(
          'Teste de Desempenho - Busca',
          `AsyncStorage: ${testResults[0].time.toFixed(2)}ms\nSQLite: ${testResults[1]?.time.toFixed(2)}ms\n\nVencedor: ${testResults[0].time < testResults[1]?.time ? 'AsyncStorage' : 'SQLite'}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Teste de Desempenho - Busca',
          `AsyncStorage: ${testResults[0].time.toFixed(2)}ms\nSQLite: Indisponível`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Erro no teste de desempenho:', error);
      Alert.alert('Erro', 'Falha no teste de desempenho.');
    } finally {
      setLoading(false);
    }
  };

  // Tema dinâmico
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <View style={[styles.gradient, { backgroundColor: theme.background }]}>
      {/* Botão de alternância */}
      <TouchableOpacity 
        style={styles.themeButton} 
        onPress={() => setIsDarkMode(!isDarkMode)}
      >
        <Text style={{ fontSize: 20 }}>
          {isDarkMode ? '☀️' : '🌙'}
        </Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.header}>
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/847/847969.png' }} 
                style={styles.avatar}
              />
              <Text style={[styles.title, { color: theme.textPrimary }]}>Bem-vindo de volta</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Faça login na sua conta</Text>
              
              {!sqliteAvailable && (
                <View style={[styles.warningBanner, { borderColor: theme.warningBorder }]}>
                  <Text style={[styles.warningText, { color: theme.warning }]}>
                    ⚠️ SQLite não disponível. Usando AsyncStorage.
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary },
                  errors.email && styles.inputError
                ]}
                placeholder="seu@email.com"
                placeholderTextColor={theme.placeholder}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Senha</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.textPrimary },
                  errors.password && styles.inputError
                ]}
                placeholder="Sua senha"
                placeholderTextColor={theme.placeholder}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry
              />
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            <View style={styles.storageSection}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Escolha o Armazenamento para Busca</Text>
              <Checkbox
                label="AsyncStorage"
                description="Busca em armazenamento chave-valor."
                value={selectedStorage === 'asyncStorage'}
                onValueChange={(value) => value && setSelectedStorage('asyncStorage')}
              />
              <Checkbox
                label="SQLite"
                description="Busca em banco de dados relacional."
                value={selectedStorage === 'sqlite'}
                onValueChange={(value) => value && setSelectedStorage('sqlite')}
                disabled={!sqliteAvailable}
              />
              {!sqliteAvailable && <Text style={styles.disabledText}>SQLite não está disponível</Text>}
            </View>

            {performanceResults.length > 0 && (
              <View style={styles.performanceSection}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Resultados de Desempenho - Busca</Text>
                {performanceResults.map((result, index) => (
                  <View key={index} style={styles.performanceResult}>
                    <Text style={[
                      styles.performanceText,
                      result.success ? styles.performanceSuccess : styles.performanceError
                    ]}>
                      {result.storageType === 'asyncStorage' ? 'AsyncStorage' : 'SQLite'}: 
                      {result.time.toFixed(2)}ms - {result.success ? '✅' : '❌'} {result.message}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={[styles.linkText, { color: theme.link }]}>Esqueceu sua senha?</Text>
            </TouchableOpacity>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton, { backgroundColor: theme.buttonBg }, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>
                    Entrar com {selectedStorage === 'asyncStorage' ? 'AsyncStorage' : 'SQLite'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton, { borderColor: theme.buttonBorder }]}
                onPress={handleTestPerformance}
                disabled={loading}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.link }]}>
                  Testar Desempenho (Busca)
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>Não tem uma conta? </Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text style={[styles.footerLink, { color: theme.link }]}>Cadastre-se</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const darkTheme = {
  background: '#0f0b1a',
  card: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.1)',
  textPrimary: '#ffffff',
  textSecondary: '#cbd5e1',
  inputBg: 'rgba(255,255,255,0.05)',
  inputBorder: 'rgba(255,255,255,0.2)',
  placeholder: '#94a3b8',
  link: '#93c5fd',
  buttonBg: 'rgba(59,130,246,0.6)',
  buttonBorder: '#2563eb',
  warning: '#facc15',
  warningBorder: '#fcd34d'
};

const lightTheme = {
  background: '#f1f5f9',
  card: '#ffffff',
  border: '#e2e8f0',
  textPrimary: '#111827',
  textSecondary: '#475569',
  inputBg: '#f8fafc',
  inputBorder: '#cbd5e1',
  placeholder: '#94a3b8',
  link: '#2563eb',
  buttonBg: '#2563eb',
  buttonBorder: '#2563eb',
  warning: '#b45309',
  warningBorder: '#fbbf24'
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  themeButton: {
    position: 'absolute',
    top: 50,
    right: 30,
    zIndex: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 6,
  },
  scrollContainer: 
  { 
    flexGrow: 1, 
    justifyContent: 'center', 
    paddingVertical: 80 
  },
  container: 
  { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingHorizontal: 20 
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    elevation: 8,
  },
  header: 
  { 
    alignItems: 'center', 
    marginBottom: 24 
  },
  avatar: 
  { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    marginBottom: 16 
  },
  title: 
  { 
    fontSize: 26, 
    fontWeight: 'bold', 
    marginBottom: 4 
  },
  subtitle: 
  { 
    fontSize: 15 
  },
  warningBanner: 
  { padding: 10, 
    borderRadius: 8, 
    borderWidth: 1, 
    marginTop: 8 
  },
  warningText: 
  { 
    textAlign: 'center' 
  },
  inputContainer: 
  { 
    marginBottom: 16 
  },
  label: 
  { fontSize: 14, 
    marginBottom: 6 
  },
  input: 
  { 
    width: '100%', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderWidth: 1, 
    borderRadius: 12 
  },
  inputError: 
  { 
    borderColor: '#ef4444' 
  },
  errorText: 
  { 
    color: '#ef4444', 
    fontSize: 12, 
    marginTop: 4 
  },
  storageSection: 
  { 
    marginBottom: 20, 
    padding: 14, 
    borderRadius: 12, 
    borderWidth: 1 
  },
  sectionTitle: 
  { 
    fontSize: 15, 
    fontWeight: '600', 
    marginBottom: 8 
  },
  performanceSection: 
  { 
    marginBottom: 20, 
    padding: 14, 
    borderRadius: 12, 
    borderWidth: 1 
  },
  performanceResult: 
  { 
    marginBottom: 8 
  },
  performanceText: 
  { 
    fontSize: 13 
  },
  performanceSuccess: 
  { 
    color: '#22c55e' 
  },
  performanceError: 
  { 
    color: '#ef4444' 
  },
  forgotPassword: 
  { 
    alignSelf: 'flex-end', 
    marginBottom: 16 
  },
  linkText: 
  { 
    fontWeight: '500' 
  },
  buttonsContainer: 
  { 
    gap: 10 
  },
  button: 
  { 
    width: '100%', 
    paddingVertical: 14, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  primaryButton: {},
  secondaryButton: 
  { 
    backgroundColor: 'transparent', 
    borderWidth: 1 
  },
  buttonDisabled: 
  { 
    opacity: 0.6 
  },
  buttonText: 
  { 
    color: '#fff', 
    fontWeight: '600' 
  },
  secondaryButtonText: 
  { 
    fontWeight: '600' 
  },
  footer: 
  { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 24 
  },
  footerText: 
  { 
    fontSize: 14 
  },
  footerLink: 
  { 
    fontWeight: '600' 
  },
  disabledText: 
  { 
    fontSize: 12, 
    color: '#ef4444', 
    fontStyle: 'italic' 
  },
});
