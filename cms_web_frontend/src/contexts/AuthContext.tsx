import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Organizer } from '../types';

interface AuthContextType {
  organizer: Organizer | null;
  login: (organizerId: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('organizer');
    if (stored) {
      setOrganizer(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = async (organizerId: string, password: string): Promise<boolean> => {
    if (organizerId === 'admin123' && password === 'password123') {
      const org: Organizer = {
        id: '1',
        organizer_id: 'admin123',
        name: 'Test Organizer',
        email: 'admin@crowdmanagement.com'
      };
      setOrganizer(org);
      localStorage.setItem('organizer', JSON.stringify(org));
      return true;
    }
    return false;
  };

  const logout = () => {
    setOrganizer(null);
    localStorage.removeItem('organizer');
  };

  return (
    <AuthContext.Provider value={{ organizer, login, logout, isLoading }}>
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
