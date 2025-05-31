
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import CollapsibleLayout from '@/components/layout/CollapsibleLayout';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Tickets from '@/pages/Tickets';
import Users from '@/pages/Users';
import Departments from '@/pages/Departments';
import Logs from '@/pages/Logs';
import Profile from '@/pages/Profile';
import KyusiChat from '@/pages/KyusiChat';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DataProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<CollapsibleLayout />}>
                <Route index element={<Index />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="tickets" element={<Tickets />} />
                <Route path="users" element={<Users />} />
                <Route path="departments" element={<Departments />} />
                <Route path="logs" element={<Logs />} />
                <Route path="profile" element={<Profile />} />
                <Route path="chat" element={<KyusiChat />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </DataProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
