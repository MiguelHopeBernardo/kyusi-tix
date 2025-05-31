
import React from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
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
  X,
  Menu,
} from 'lucide-react';

const AppSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { state, setOpenMobile, openMobile } = useSidebar();
  
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
    <Sidebar className="bg-red-800 border-none">
      <SidebarHeader>
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-white overflow-hidden">
              <img 
                src="https://www.pup.edu.ph/about/images/PUPLogo.png" 
                alt="PUP Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            {state === "expanded" && <span className="font-semibold text-lg text-white">KyusiTix</span>}
          </div>
          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-red-700"
            onClick={() => setOpenMobile(false)}
          >
            <X className="size-4" />
          </Button>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.url)}
                    className={`text-white hover:bg-red-700 data-[active=true]:bg-red-900 data-[active=true]:text-white ${
                      isActive(item.url) ? 'bg-red-900' : ''
                    }`}
                  >
                    <Link to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg">
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
        <SidebarMenu className="space-y-1 px-2">
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={isActive('/profile')}
              className={`text-white hover:bg-red-700 data-[active=true]:bg-red-900 data-[active=true]:text-white ${
                isActive('/profile') ? 'bg-red-900' : ''
              }`}
            >
              <Link to="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg">
                <User className="size-4" />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="text-white hover:bg-red-700 flex items-center gap-3 px-3 py-2 rounded-lg"
            >
              <ArrowLeftFromLine className="size-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

const FixedSidebar = () => {
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
    <div className="bg-red-800 border-none w-64 min-h-screen flex flex-col">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-white overflow-hidden">
            <img 
              src="https://www.pup.edu.ph/about/images/PUPLogo.png" 
              alt="PUP Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-semibold text-lg text-white">KyusiTix</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="space-y-1 px-2">
          {navigationItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-red-700 transition-colors ${
                isActive(item.url) ? 'bg-red-900' : ''
              }`}
            >
              <item.icon className="size-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="space-y-1 px-2 pb-4">
        <Link
          to="/profile"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-red-700 transition-colors ${
            isActive('/profile') ? 'bg-red-900' : ''
          }`}
        >
          <User className="size-4" />
          <span>Profile</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-red-700 transition-colors"
        >
          <ArrowLeftFromLine className="size-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

const CollapsibleLayout = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  if (isMobile) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          
          <div className="flex-1 flex flex-col">
            {/* Top Header */}
            <div className="bg-white border-b px-4 md:px-6 py-3">
              <div className="flex items-center justify-between">
                <SidebarTrigger className="text-gray-600" />
                
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
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
      </SidebarProvider>
    );
  }

  // Desktop layout with fixed sidebar
  return (
    <div className="min-h-screen flex w-full">
      <FixedSidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="bg-white border-b px-4 md:px-6 py-3">
          <div className="flex items-center justify-end">
            {/* User Info */}
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

export default CollapsibleLayout;
