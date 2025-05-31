
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
      console.log('Checking auth status...');
      
      // First, let's test if the Django server is reachable
      const healthResponse = await fetch('http://127.0.0.1:8000/health/', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Health check response:', healthResponse.status);
      
      if (!healthResponse.ok) {
        console.log('Django server health check failed');
        throw new Error('Django server not accessible');
      }
      
      // Check if user is authenticated by making a request to get current user info
      const response = await fetch('http://127.0.0.1:8000/users/profile/', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Profile response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('User data received:', userData);
        setUser({
          id: userData.id,
          name: userData.first_name + ' ' + userData.last_name,
          email: userData.email,
          username: userData.username,
          role: userData.role,
          department: userData.department,
          avatar: userData.profile_image,
        });
      } else if (response.status === 403 || response.status === 401) {
        console.log('User not authenticated');
      } else {
        console.log('Unexpected response status:', response.status);
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      // Check if it's a network error
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        toast.error("Cannot connect to Django server. Please make sure it's running on http://127.0.0.1:8000");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('Attempting login for:', username);
      
      // Make login request to Django with JSON
      const response = await fetch('http://127.0.0.1:8000/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
        credentials: 'include',
      });
      
      console.log('Login response status:', response.status);
      
      const data = await response.json();
      console.log('Login response data:', data);
      
      if (response.ok && data.success) {
        // Set user data from response
        setUser({
          id: data.user.id,
          name: data.user.first_name + ' ' + data.user.last_name,
          email: data.user.email,
          username: data.user.username,
          role: data.user.role,
          department: data.user.department,
          avatar: data.user.profile_image,
        });
        toast.success(`Welcome back!`);
        setIsLoading(false);
        return true;
      } else {
        console.log('Login failed:', data.error);
        toast.error(data.error || "Invalid credentials");
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        toast.error("Cannot connect to Django server. Please make sure it's running on http://127.0.0.1:8000");
      } else {
        toast.error("Login failed - unexpected error");
      }
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
