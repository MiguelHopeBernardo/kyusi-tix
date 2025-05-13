
import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  TicketCheck,
  Users,
  Settings,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Redirect non-admin users from dashboard to tickets page
  useEffect(() => {
    if (user?.role !== 'admin' && location.pathname === '/dashboard') {
      navigate('/tickets');
    }
  }, [user, location.pathname, navigate]);

  // Navigation items based on user role
  const navigationItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        to: '/dashboard',
        icon: LayoutDashboard,
        // Only show dashboard for admin users
        roles: ['admin'],
      },
      {
        name: 'Tickets',
        to: '/tickets',
        icon: TicketCheck,
        roles: ['admin', 'faculty', 'student', 'alumni'],
      },
      {
        name: 'User Roles',
        to: '/users',
        icon: Users,
        roles: ['admin'],
      },
      {
        name: 'Departments',
        to: '/departments',
        icon: Settings,
        roles: ['admin'],
      },
      {
        name: 'KyusiChat',
        to: '/kyusichat',
        icon: MessageSquare,
        roles: ['admin', 'faculty', 'student', 'alumni'],
      },
    ];
    
    return baseItems.filter(item => item.roles.includes(user.role));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Close sidebar when clicked outside on mobile
  const handleMainClick = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'left-0' : '-left-64'
        } fixed md:static md:left-0 z-30 w-64 h-screen overflow-y-auto transition-all duration-300 ease-in-out bg-sidebar text-sidebar-foreground flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src="https://www.pup.edu.ph/about/images/PUPLogo.png" 
              alt="PUP Logo" 
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold">KyusiTix</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-sidebar-foreground" 
            onClick={toggleSidebar}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <Separator className="bg-sidebar-border" />
        
        {/* Navigation Links */}
        <nav className="flex-grow p-4">
          <ul className="space-y-1">
            {navigationItems().map((item) => (
              <li key={item.name}>
                <NavLink 
                  to={item.to} 
                  className={({ isActive }) => 
                    `flex items-center p-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                        : 'hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
                    }`
                  }
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        <Separator className="bg-sidebar-border" />
        
        {/* User profile and logout */}
        <div className="p-4 space-y-3">
          <NavLink 
            to="/profile"
            className={({ isActive }) => 
              `flex items-center p-2 rounded-md transition-colors ${
                isActive 
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                  : 'hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
              }`
            }
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <User className="mr-3 h-5 w-5" />
            <span>Profile</span>
          </NavLink>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b shadow-sm p-4 z-20">
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="ml-auto flex items-center space-x-2">
              <div className="hidden sm:block text-right mr-2">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
              <Avatar>
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main 
          className="flex-1 overflow-y-auto p-4 md:p-6 bg-background"
          onClick={handleMainClick}
        >
          <Outlet />
        </main>
      </div>
      
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AppLayout;
