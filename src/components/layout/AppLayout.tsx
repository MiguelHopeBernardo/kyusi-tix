import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
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
} from "@/components/ui/sidebar"

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { collapse } = useSidebar();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar collapsible="icon" className="hidden md:flex">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-bold">KT</span>
              </div>
              <span className="font-semibold text-lg">KyusiTix</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/dashboard" className="flex items-center gap-2">
                        <LayoutDashboard className="size-4" />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/tickets" className="flex items-center gap-2">
                        <Ticket className="size-4" />
                        <span>Tickets</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {user?.role === 'admin' && (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <Link to="/users" className="flex items-center gap-2">
                            <Users className="size-4" />
                            <span>Users</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <Link to="/departments" className="flex items-center gap-2">
                            <Building className="size-4" />
                            <span>Departments</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <Link to="/logs" className="flex items-center gap-2">
                            <FileText className="size-4" />
                            <span>Activity Logs</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/chat" className="flex items-center gap-2">
                        <MessageSquare className="size-4" />
                        <span>KyusiChat</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center gap-2 px-4 py-3">
              <Avatar className="size-8">
                <AvatarImage src={user?.avatar || ""} alt={user?.name || "Avatar"} />
                <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{user?.name}</span>
                <Button variant="link" size="sm" onClick={handleLogout} className="p-0 hover:underline">
                  <ArrowLeftFromLine className="mr-2 size-4" />
                  Logout
                </Button>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

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
    </SidebarProvider>
  );
};

export default AppLayout;
