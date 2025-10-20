// services/SQLiteService.ts
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

// Verificar se estamos no ambiente web
const isWeb = Platform.OS === 'web';

// Simular o SQLite no ambiente web
class WebSQLiteSimulation {
  private db: User[] = [];
  private initialized = true;

  async init(): Promise<void> {
    console.log('SQLite simulado para ambiente web');
    return Promise.resolve();
  }

  async saveUser(user: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean; time: number; user?: User; error?: string }> {
    const startTime = performance.now();
    
    try {
      // Verificar se email já existe
      const emailExists = this.db.some(u => u.email === user.email);
      if (emailExists) {
        throw new Error('Email já cadastrado');
      }
      
      const newUser: User = {
        ...user,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      this.db.push(newUser);
      
      const endTime = performance.now();
      return { 
        success: true, 
        time: endTime - startTime,
        user: newUser
      };
    } catch (error: any) {
      const endTime = performance.now();
      return { 
        success: false, 
        time: endTime - startTime,
        error: error.message || 'Erro ao salvar usuário'
      };
    }
  }

  async getUserByEmail(email: string): Promise<{ success: boolean; time: number; user?: User; error?: string }> {
    const startTime = performance.now();
    
    try {
      const user = this.db.find(u => u.email === email);
      const endTime = performance.now();
      
      return { 
        success: true, 
        time: endTime - startTime,
        user 
      };
    } catch (error: any) {
      const endTime = performance.now();
      return { 
        success: false, 
        time: endTime - startTime,
        error: error.message
      };
    }
  }

  async getAllUsers(): Promise<{ success: boolean; time: number; users: User[]; error?: string }> {
    const startTime = performance.now();
    
    try {
      const users = [...this.db].reverse(); // Ordenar por mais recente
      const endTime = performance.now();
      
      return { 
        success: true, 
        time: endTime - startTime,
        users 
      };
    } catch (error: any) {
      const endTime = performance.now();
      return { 
        success: false, 
        time: endTime - startTime,
        users: [],
        error: error.message
      };
    }
  }

  async clearAll(): Promise<{ success: boolean; error?: string }> {
    try {
      this.db = [];
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
}

// Implementação real para mobile
class NativeSQLiteService {
  private db: any = null;
  private initialized = false;

  async init(): Promise<void> {
    try {
      // Usar openDatabase em vez de openDatabaseSync
      this.db = SQLite.openDatabase('users.db');
      
      return new Promise((resolve, reject) => {
        this.db.transaction(
          (tx: any) => {
            tx.executeSql(
              `CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                createdAt TEXT NOT NULL
              );`,
              [],
              () => {
                this.initialized = true;
                console.log('SQLite inicializado com sucesso no mobile');
                resolve();
              },
              (_: any, error: any) => {
                reject(error);
                return false;
              }
            );
          },
          (error: any) => reject(error)
        );
      });
    } catch (error) {
      console.error('Erro ao inicializar SQLite no mobile:', error);
      throw error;
    }
  }

  async saveUser(user: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean; time: number; user?: User; error?: string }> {
    const startTime = performance.now();
    
    if (!this.initialized) {
      const endTime = performance.now();
      return {
        success: false,
        time: endTime - startTime,
        error: 'SQLite não inicializado'
      };
    }

    return new Promise((resolve) => {
      this.db.transaction(
        (tx: any) => {
          const newUser: User = {
            ...user,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
          };

          tx.executeSql(
            `INSERT INTO users (id, name, email, password, createdAt) 
             VALUES (?, ?, ?, ?, ?)`,
            [newUser.id, newUser.name, newUser.email, newUser.password, newUser.createdAt],
            (_: any, result: any) => {
              const endTime = performance.now();
              resolve({ 
                success: true, 
                time: endTime - startTime,
                user: newUser
              });
            },
            (_: any, error: any) => {
              const endTime = performance.now();
              resolve({ 
                success: false, 
                time: endTime - startTime,
                error: error.message
              });
              return false;
            }
          );
        },
        (error: any) => {
          const endTime = performance.now();
          resolve({ 
            success: false, 
            time: endTime - startTime,
            error: error.message
          });
        }
      );
    });
  }

  async getUserByEmail(email: string): Promise<{ success: boolean; time: number; user?: User; error?: string }> {
    const startTime = performance.now();
    
    if (!this.initialized) {
      const endTime = performance.now();
      return {
        success: false,
        time: endTime - startTime,
        error: 'SQLite não inicializado'
      };
    }

    return new Promise((resolve) => {
      this.db.transaction(
        (tx: any) => {
          tx.executeSql(
            'SELECT * FROM users WHERE email = ?',
            [email],
            (_: any, { rows }: any) => {
              const endTime = performance.now();
              const user = rows.length > 0 ? rows.item(0) : undefined;
              resolve({ 
                success: true, 
                time: endTime - startTime,
                user 
              });
            },
            (_: any, error: any) => {
              const endTime = performance.now();
              resolve({ 
                success: false, 
                time: endTime - startTime,
                error: error.message
              });
              return false;
            }
          );
        },
        (error: any) => {
          const endTime = performance.now();
          resolve({ 
            success: false, 
            time: endTime - startTime,
            error: error.message
          });
        }
      );
    });
  }

  async getAllUsers(): Promise<{ success: boolean; time: number; users: User[]; error?: string }> {
    const startTime = performance.now();
    
    if (!this.initialized) {
      const endTime = performance.now();
      return {
        success: false,
        time: endTime - startTime,
        users: [],
        error: 'SQLite não inicializado'
      };
    }

    return new Promise((resolve) => {
      this.db.transaction(
        (tx: any) => {
          tx.executeSql(
            'SELECT * FROM users ORDER BY createdAt DESC',
            [],
            (_: any, { rows }: any) => {
              const endTime = performance.now();
              const users: User[] = [];
              for (let i = 0; i < rows.length; i++) {
                users.push(rows.item(i));
              }
              resolve({ 
                success: true, 
                time: endTime - startTime,
                users 
              });
            },
            (_: any, error: any) => {
              const endTime = performance.now();
              resolve({ 
                success: false, 
                time: endTime - startTime,
                users: [],
                error: error.message
              });
              return false;
            }
          );
        },
        (error: any) => {
          const endTime = performance.now();
          resolve({ 
            success: false, 
            time: endTime - startTime,
            users: [],
            error: error.message
          });
        }
      );
    });
  }

  async clearAll(): Promise<{ success: boolean; error?: string }> {
    if (!this.initialized) {
      return { success: false, error: 'SQLite não inicializado' };
    }

    return new Promise((resolve) => {
      this.db.transaction(
        (tx: any) => {
          tx.executeSql(
            'DELETE FROM users',
            [],
            () => resolve({ success: true }),
            (_: any, error: any) => {
              resolve({ success: false, error: error.message });
              return false;
            }
          );
        },
        (error: any) => {
          resolve({ success: false, error: error.message });
        }
      );
    });
  }
}

// Escolher a implementação correta baseada na plataforma
const SQLiteImplementation = isWeb ? new WebSQLiteSimulation() : new NativeSQLiteService();

export const SQLiteService = {
  async init(): Promise<void> {
    return SQLiteImplementation.init();
  },

  async saveUser(user: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean; time: number; user?: User; error?: string }> {
    return SQLiteImplementation.saveUser(user);
  },

  async getUserByEmail(email: string): Promise<{ success: boolean; time: number; user?: User; error?: string }> {
    return SQLiteImplementation.getUserByEmail(email);
  },

  async getAllUsers(): Promise<{ success: boolean; time: number; users: User[]; error?: string }> {
    return SQLiteImplementation.getAllUsers();
  },

  async clearAll(): Promise<{ success: boolean; error?: string }> {
    return SQLiteImplementation.clearAll();
  },

  // Método para verificar se está usando a implementação web
  isWebSimulation(): boolean {
    return isWeb;
  }
};