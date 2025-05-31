
import React from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
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
  User,
} from 'lucide-react';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navigationItems = [
    ...(user?.role === 'admin' ? [{
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
    }] : []),
    {
      title: 'Tickets',
      url: '/tickets',
      icon: Ticket,
    },
    ...(user?.role === 'admin' ? [
      {
        title: 'User Roles',
        url: '/users',
        icon: Users,
      },
      {
        title: 'Departments',
        url: '/departments',
        icon: Building,
      },
      {
        title: 'Activity Logs',
        url: '/logs',
        icon: FileText,
      },
    ] : []),
    {
      title: 'KyusiChat',
      url: '/chat',
      icon: MessageSquare,
    },
  ];
  
  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar - Fixed width and height */}
      <div className="hidden md:flex w-64 bg-red-800 text-white fixed h-full">
        <div className="flex flex-col w-full h-full">
          {/* Header */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-red-700">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white overflow-hidden">
              <img 
                src="https://www.pup.edu.ph/about/images/PUPLogo.png" 
                alt="PUP Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-semibold text-lg">KyusiTix</span>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.title}
                to={item.url}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors ${
                  isActive(item.url) ? 'bg-red-900' : ''
                }`}
              >
                <item.icon className="size-4" />
                {item.title}
              </Link>
            ))}
          </nav>
          
          {/* Footer - Always at bottom */}
          <div className="border-t border-red-700 p-4 space-y-2 mt-auto">
            <Link 
              to="/profile" 
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors ${
                isActive('/profile') ? 'bg-red-900' : ''
              }`}
            >
              <User className="size-4" />
              Profile
            </Link>
            
            <Button 
              variant="ghost" 
              onClick={handleLogout} 
              className="w-full justify-start text-white hover:bg-red-700 hover:text-white px-3 py-2"
            >
              <ArrowLeftFromLine className="mr-3 size-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Adjusted to account for fixed sidebar */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Top Header */}
        <div className="bg-white border-b px-6 py-3">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium">{user?.name}</div>
                <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
              </div>
              <Avatar className="size-8">
                <AvatarImage src={user?.avatar || ""} alt={user?.name || "Avatar"} />
                <AvatarFallback className="bg-red-600 text-white">{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
        
        {/* Page Content */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
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
