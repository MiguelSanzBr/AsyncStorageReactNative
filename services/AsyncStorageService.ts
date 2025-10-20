import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}



const USERS_KEY = '@users';

export const AsyncStorageService = {
  // Salvar usuário
 async saveUser(user: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean; time: number; user?: User; error?: string }>

    {
    const startTime = performance.now();
    
    try {
      const usersJSON = await AsyncStorage.getItem(USERS_KEY);
      const users: User[] = usersJSON ? JSON.parse(usersJSON) : [];
      
      // Verificar se email já existe
      const emailExists = users.some(u => u.email === user.email);
      if (emailExists) {
        throw new Error('Email já cadastrado');
      }
      
      const newUser: User = {
        ...user,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      users.push(newUser);
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      const endTime = performance.now();
      return { 
        success: true, 
        time: endTime - startTime,
        user: newUser
      };
    } catch (error) {
        
     const endTime = performance.now();
        return { 
        success: false, 
        time: endTime - startTime,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
        };

    }
  },

  // Buscar usuário por email
  async getUserByEmail(email: string): Promise<{ success: boolean; time: number; user?: User }> {
    const startTime = performance.now();
    
    try {
      const usersJSON = await AsyncStorage.getItem(USERS_KEY);
      const users: User[] = usersJSON ? JSON.parse(usersJSON) : [];
      
      const user = users.find(u => u.email === email);
      const endTime = performance.now();
      
      return { 
        success: true, 
        time: endTime - startTime,
        user 
      };
    } catch (error) {
      const endTime = performance.now();
      return { 
        success: false, 
        time: endTime - startTime 
      };
    }
  },

  // Buscar todos os usuários (para demonstração)
  async getAllUsers(): Promise<{ success: boolean; time: number; users: User[] }> {
    const startTime = performance.now();
    
    try {
      const usersJSON = await AsyncStorage.getItem(USERS_KEY);
      const users: User[] = usersJSON ? JSON.parse(usersJSON) : [];
      
      const endTime = performance.now();
      return { 
        success: true, 
        time: endTime - startTime,
        users 
      };
    } catch (error) {
      const endTime = performance.now();
      return { 
        success: false, 
        time: endTime - startTime,
        users: [] 
      };
    }
  },

  // Limpar todos os dados (para testes)
  async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(USERS_KEY);
  }
};