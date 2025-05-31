
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "@/components/ui/sonner";
import { authService } from '@/services/api';

// Define roles to match Django choices
export type UserRole = 'admin' | 'staff' | 'faculty' | 'student' | 'alumni';

// User interface to match Django user model
export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  department?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  forgotPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if user is authenticated by making a request to get current user info
      const response = await fetch('http://127.0.0.1:8000/users/profile/', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser({
          id: userData.id,
          name: userData.first_name + ' ' + userData.last_name,
          email: userData.email,
          username: userData.username,
          role: userData.role,
          department: userData.department,
          avatar: userData.profile_image,
        });
      }
    } catch (error) {
      console.log('User not authenticated:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Make login request to Django
      const response = await fetch('http://127.0.0.1:8000/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username,
          password,
        }),
        credentials: 'include',
      });
      
      if (response.ok) {
        // If login successful, get user data
        await checkAuthStatus();
        toast.success(`Welcome back!`);
        setIsLoading(false);
        return true;
      } else {
        toast.error("Invalid credentials");
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Login failed");
      setIsLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user state even if logout request fails
      setUser(null);
      toast.success("Logged out successfully");
    }
  };
  
  // Forgot password function (placeholder for now)
  const forgotPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // This would typically make a request to Django's password reset endpoint
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Password reset instructions have been sent to ${email}`);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error("Failed to process request");
      setIsLoading(false);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, forgotPassword }}>
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
