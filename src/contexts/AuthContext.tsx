
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "@/components/ui/sonner";

// Define roles
export type UserRole = 'admin' | 'faculty' | 'student' | 'alumni';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
}

// Mock user data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@pupqc.edu.ph',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  },
  {
    id: '2',
    name: 'Faculty Member',
    email: 'faculty@pupqc.edu.ph',
    role: 'faculty',
    department: 'Computer Science',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=faculty',
  },
  {
    id: '3',
    name: 'Student User',
    email: 'student@pupqc.edu.ph',
    role: 'student',
    department: 'Computer Science',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student',
  },
  {
    id: '4',
    name: 'Alumni User',
    email: 'alumni@pupqc.edu.ph',
    role: 'alumni',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alumni',
  },
];

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // In real app, this would be an API call
      // For demo, we'll use mock data
      const foundUser = mockUsers.find(u => u.email === email);
      
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (foundUser && password === 'password') { // Demo password
        setUser(foundUser);
        localStorage.setItem('user', JSON.stringify(foundUser));
        toast.success(`Welcome, ${foundUser.name}`);
        setIsLoading(false);
        return true;
      } else {
        toast.error("Invalid credentials");
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error(error);
      toast.error("Login failed");
      setIsLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.success("Logged out successfully");
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
