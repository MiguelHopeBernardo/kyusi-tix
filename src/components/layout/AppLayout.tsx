
import React from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Ticket,
  Users,
  Building,
  FileText,
  MessageSquare,
  ArrowLeftFromLine,
} from 'lucide-react';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 bg-card border-r">
        <div className="flex flex-col w-full">
          {/* Header */}
          <div className="flex items-center gap-2 px-6 py-4 border-b">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">KT</span>
            </div>
            <span className="font-semibold text-lg">KyusiTix</span>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            <Link 
              to="/dashboard" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
            
            <Link 
              to="/tickets" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Ticket className="size-4" />
              Tickets
            </Link>
            
            {user?.role === 'admin' && (
              <>
                <Link 
                  to="/users" 
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Users className="size-4" />
                  Users
                </Link>
                
                <Link 
                  to="/departments" 
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Building className="size-4" />
                  Departments
                </Link>
                
                <Link 
                  to="/logs" 
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <FileText className="size-4" />
                  Activity Logs
                </Link>
              </>
            )}
            
            <Link 
              to="/chat" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <MessageSquare className="size-4" />
              KyusiChat
            </Link>
          </nav>
          
          {/* Footer */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarImage src={user?.avatar || ""} alt={user?.name || "Avatar"} />
                <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5 flex-1">
                <span className="text-sm font-semibold">{user?.name}</span>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={handleLogout} 
                  className="p-0 h-auto justify-start hover:underline text-xs text-muted-foreground"
                >
                  <ArrowLeftFromLine className="mr-1 size-3" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="p-4 md:p-6">
          <React.Suspense fallback={<p>Loading...</p>}>
            <div className="w-full">
              <Outlet />
            </div>
          </React.Suspense>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
