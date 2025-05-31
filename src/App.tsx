
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { Toaster } from "@/components/ui/sonner";
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import Users from './pages/Users';
import Profile from './pages/Profile';
import Departments from './pages/Departments';
import KyusiChat from './pages/KyusiChat';
import Logs from './pages/Logs';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="tickets" element={<Tickets />} />
                <Route path="users" element={<Users />} />
                <Route path="profile" element={<Profile />} />
                <Route path="departments" element={<Departments />} />
                <Route path="chat" element={<KyusiChat />} />
                <Route path="logs" element={<Logs />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            <Toaster />
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
