// app/(auth)/register.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  StyleSheet,
  TextInput,
  ActivityIndicator 
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

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState<StorageType>('asyncStorage');
  const [performanceResults, setPerformanceResults] = useState<PerformanceResult[]>([]);
  const [sqliteAvailable, setSqliteAvailable] = useState(true);

  // Inicializar SQLite com tratamento de erro
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
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirme sua senha';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.email && !newErrors.password && !newErrors.confirmPassword;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      let result;
      
      if (selectedStorage === 'asyncStorage') {
        result = await AsyncStorageService.saveUser({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        });
      } else {
        // Verificar se SQLite está disponível
        if (!sqliteAvailable) {
          Alert.alert('Erro', 'SQLite não está disponível. Use AsyncStorage.');
          setLoading(false);
          return;
        }
        
        result = await SQLiteService.saveUser({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        });
      }

      const performanceResult: PerformanceResult = {
        storageType: selectedStorage,
        time: result.time,
        success: result.success,
        message: result.success ? 'Usuário cadastrado com sucesso!' : result.error
      };

      setPerformanceResults(prev => [...prev, performanceResult]);

      if (result.success) {
        Alert.alert(
          'Sucesso!', 
          `Conta criada com sucesso usando ${selectedStorage === 'asyncStorage' ? 'AsyncStorage' : 'SQLite'}!\n\nTempo de execução: ${result.time.toFixed(2)}ms`,
          [
            {
              text: 'OK',
              onPress: () => {
                setFormData({
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                });
                // router.replace('/(tabs)');
              }
            }
          ]
        );
      } else {
        Alert.alert('Erro', result.error || 'Falha no registro. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      Alert.alert('Erro', 'Falha no registro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestPerformance = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const testResults: PerformanceResult[] = [];

      // Testar AsyncStorage
      const asyncResult = await AsyncStorageService.saveUser({
        name: formData.name.trim(),
        email: formData.email.trim() + '_async',
        password: formData.password,
      });
      
      testResults.push({
        storageType: 'asyncStorage',
        time: asyncResult.time,
        success: asyncResult.success,
        message: asyncResult.success ? 'AsyncStorage: OK' : asyncResult.error
      });

      // Testar SQLite apenas se estiver disponível
      if (sqliteAvailable) {
        const sqliteResult = await SQLiteService.saveUser({
          name: formData.name.trim(),
          email: formData.email.trim() + '_sqlite',
          password: formData.password,
        });
        
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
          'Teste de Desempenho',
          `AsyncStorage: ${asyncResult.time.toFixed(2)}ms\nSQLite: ${testResults[1]?.time.toFixed(2)}ms\n\nVencedor: ${asyncResult.time < testResults[1]?.time ? 'AsyncStorage' : 'SQLite'}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Teste de Desempenho',
          `AsyncStorage: ${asyncResult.time.toFixed(2)}ms\nSQLite: Indisponível`,
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

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Criar conta</Text>
            <Text style={styles.subtitle}>Preencha os dados e escolha o armazenamento</Text>
            
            {!sqliteAvailable && (
              <View style={styles.warningBanner}>
                <Text style={styles.warningText}>
                  ⚠️ SQLite não disponível. Usando AsyncStorage.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome completo</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Seu nome"
              placeholderTextColor="#9ca3af"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="seu@email.com"
              placeholderTextColor="#9ca3af"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Sua senha"
              placeholderTextColor="#9ca3af"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
            />
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmar senha</Text>
            <TextInput
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              placeholder="Confirme sua senha"
              placeholderTextColor="#9ca3af"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              secureTextEntry
            />
            {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
          </View>

          {/* Seção de escolha de armazenamento */}
          <View style={styles.storageSection}>
            <Text style={styles.sectionTitle}>Escolha o Armazenamento</Text>
            
            <Checkbox
              label="AsyncStorage"
              description="Armazenamento simples baseado em chave-valor. Ideal para dados pequenos."
              value={selectedStorage === 'asyncStorage'}
              onValueChange={(value) => value && setSelectedStorage('asyncStorage')}
            />
            
            <Checkbox
              label="SQLite"
              description="Banco de dados relacional. Ideal para dados complexos e consultas avançadas."
              value={selectedStorage === 'sqlite'}
              onValueChange={(value) => value && setSelectedStorage('sqlite')}
              disabled={!sqliteAvailable}
            />
            
            {!sqliteAvailable && (
              <Text style={styles.disabledText}>
                SQLite não está disponível no momento
              </Text>
            )}
          </View>

          {/* Resultados de desempenho */}
          {performanceResults.length > 0 && (
            <View style={styles.performanceSection}>
              <Text style={styles.sectionTitle}>Resultados de Desempenho</Text>
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

          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.primaryButton, 
                loading && styles.buttonDisabled,
                !sqliteAvailable && selectedStorage === 'sqlite' && styles.buttonDisabled
              ]}
              onPress={handleRegister}
              disabled={loading || (!sqliteAvailable && selectedStorage === 'sqlite')}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>
                  {!sqliteAvailable && selectedStorage === 'sqlite' 
                    ? 'SQLite Indisponível' 
                    : `Cadastrar com ${selectedStorage === 'asyncStorage' ? 'AsyncStorage' : 'SQLite'}`
                  }
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton, loading && styles.buttonDisabled]}
              onPress={handleTestPerformance}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>
                Testar Desempenho {sqliteAvailable ? '(Ambos)' : '(AsyncStorage)'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem uma conta? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Fazer login</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
   card: {
  backgroundColor: 'white',
  borderRadius: 16,
  padding: 24,
  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
  elevation: 4, // Keep this for Android
},
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 8,
  },
  warningBanner: {
    backgroundColor: '#fef3cd',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f59e0b',
    marginTop: 8,
  },
  warningText: {
    color: '#92400e',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'white',
    borderColor: '#d1d5db',
    color: '#111827',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  storageSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  performanceSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  performanceResult: {
    marginBottom: 8,
  },
  performanceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  performanceSuccess: {
    color: '#059669',
  },
  performanceError: {
    color: '#dc2626',
  },
  disabledText: {
    fontSize: 12,
    color: '#ef4444',
    fontStyle: 'italic',
    marginTop: 8,
  },
  buttonsContainer: {
    gap: 12,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 14,
  },
  footerLink: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
  },
});