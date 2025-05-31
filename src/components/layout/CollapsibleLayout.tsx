
import React from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
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

const AppSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  
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
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white overflow-hidden">
            <img 
              src="https://www.pup.edu.ph/about/images/PUPLogo.png" 
              alt="PUP Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          {state === "expanded" && <span className="font-semibold text-lg">KyusiTix</span>}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/profile')}>
              <Link to="/profile">
                <User className="size-4" />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <ArrowLeftFromLine className="size-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

const CollapsibleLayout = () => {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <div className="bg-white border-b px-4 md:px-6 py-3">
            <div className="flex items-center justify-between">
              <SidebarTrigger />
              
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium">{user?.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
                </div>
                <Avatar className="size-8">
                  <AvatarImage src={user?.avatar || ""} alt={user?.name || "Avatar"} />
                  <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
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
    </SidebarProvider>
  );
};

export default CollapsibleLayout;
