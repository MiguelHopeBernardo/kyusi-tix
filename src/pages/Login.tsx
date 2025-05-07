
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleDemoLogin = async (role: string) => {
    let email = '';
    switch(role) {
      case 'admin':
        email = 'admin@pupqc.edu.ph';
        break;
      case 'faculty':
        email = 'faculty@pupqc.edu.ph';
        break;
      case 'student':
        email = 'student@pupqc.edu.ph';
        break;
      case 'alumni':
        email = 'alumni@pupqc.edu.ph';
        break;
      default:
        email = 'admin@pupqc.edu.ph';
    }
    
    const success = await login(email, 'password');
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img 
            src="https://www.pup.edu.ph/about/images/PUPLogo.png" 
            alt="PUP Logo" 
            className="mx-auto h-24 w-auto"
          />
          <h2 className="mt-6 text-3xl font-bold text-pup-maroon">KyusiTix</h2>
          <p className="mt-2 text-sm text-gray-600">PUPQC Ticketing Support System</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>
              Enter your email and password to access the support system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="email@pupqc.edu.ph" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-pup-maroon hover:bg-pup-maroon/90"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Demo Login Options
                  </span>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleDemoLogin('admin')}
                  disabled={isLoading}
                  className="text-xs"
                >
                  Admin
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleDemoLogin('faculty')}
                  disabled={isLoading}
                  className="text-xs"
                >
                  Faculty
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleDemoLogin('student')}
                  disabled={isLoading}
                  className="text-xs"
                >
                  Student
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleDemoLogin('alumni')}
                  disabled={isLoading}
                  className="text-xs"
                >
                  Alumni
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
