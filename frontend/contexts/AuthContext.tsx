import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import backend from '~backend/client';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const sessionToken = localStorage.getItem('sessionToken');
    if (sessionToken) {
      verifySession(sessionToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifySession = async (sessionToken: string) => {
    try {
      const response = await backend.auth.verifySession({ sessionToken });
      setUser(response.user);
    } catch (error) {
      // Session invalid, remove from storage
      localStorage.removeItem('sessionToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await backend.auth.login({ email, password });
    setUser(response.user);
    localStorage.setItem('sessionToken', response.sessionToken);
  };

  const logout = async () => {
    const sessionToken = localStorage.getItem('sessionToken');
    if (sessionToken) {
      try {
        await backend.auth.logout({ sessionToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    setUser(null);
    localStorage.removeItem('sessionToken');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
