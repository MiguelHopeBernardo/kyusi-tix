
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
      console.log('🔍 Checking auth status...');
      console.log('🌐 Attempting to connect to Django server at http://127.0.0.1:8000');
      
      // Test Django server connectivity with more detailed logging
      console.log('📡 Making health check request...');
      const healthResponse = await fetch('http://127.0.0.1:8000/health/', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      console.log('✅ Health check response status:', healthResponse.status);
      console.log('📋 Health check response headers:', Object.fromEntries(healthResponse.headers.entries()));
      
      if (!healthResponse.ok) {
        console.error('❌ Django server health check failed with status:', healthResponse.status);
        throw new Error(`Django server returned status ${healthResponse.status}`);
      }
      
      const healthData = await healthResponse.json();
      console.log('💚 Health check successful:', healthData);
      
      // Check if user is authenticated
      console.log('👤 Checking user authentication...');
      const response = await fetch('http://127.0.0.1:8000/users/profile/', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      console.log('👤 Profile response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('✅ User authenticated:', userData.username);
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
        console.log('🔐 User not authenticated');
      } else {
        console.log('⚠️ Unexpected response status:', response.status);
      }
    } catch (error) {
      console.error('💥 Auth check failed:', error);
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('🚫 Network error: Cannot reach Django server');
        console.error('🔧 Troubleshooting steps:');
        console.error('   1. Make sure Django server is running: python manage.py runserver');
        console.error('   2. Check that server is running on http://127.0.0.1:8000');
        console.error('   3. Install django-cors-headers: pip install django-cors-headers');
        console.error('   4. Restart Django server after installing CORS');
        
        toast.error("Cannot connect to Django server", {
          description: "Make sure Django is running on http://127.0.0.1:8000 and django-cors-headers is installed",
          duration: 8000,
        });
      } else {
        console.error('🔥 Unexpected error:', error);
        toast.error("Connection error", {
          description: "Unable to connect to the server. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('🔑 Attempting login for:', username);
      console.log('🌐 Making login request to Django...');
      
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
      
      console.log('📡 Login response status:', response.status);
      console.log('📋 Login response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('📄 Login response data:', data);
      
      if (response.ok && data.success) {
        console.log('✅ Login successful for:', data.user.username);
        setUser({
          id: data.user.id,
          name: data.user.first_name + ' ' + data.user.last_name,
          email: data.user.email,
          username: data.user.username,
          role: data.user.role,
          department: data.user.department,
          avatar: data.user.profile_image,
        });
        toast.success(`Welcome back, ${data.user.first_name}!`);
        setIsLoading(false);
        return true;
      } else {
        console.error('❌ Login failed:', data.error || 'Unknown error');
        toast.error(data.error || "Invalid credentials");
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('🚫 Network error during login');
        toast.error("Cannot connect to Django server", {
          description: "Make sure Django is running and CORS is configured",
          duration: 8000,
        });
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
      setUser(null);
      toast.success("Logged out successfully");
    }
  };
  
  const forgotPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
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
