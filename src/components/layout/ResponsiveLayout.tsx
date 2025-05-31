
import React, { useState } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Ticket,
  Users,
  Building,
  FileText,
  MessageSquare,
  ArrowLeftFromLine,
  User,
  Menu,
} from 'lucide-react';

const ResponsiveLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const NavItems = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
      {user?.role === 'admin' && (
        <Link 
          to="/dashboard" 
          onClick={onItemClick}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
        >
          <LayoutDashboard className="size-4" />
          Dashboard
        </Link>
      )}
      
      <Link 
        to="/tickets" 
        onClick={onItemClick}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
      >
        <Ticket className="size-4" />
        Tickets
      </Link>
      
      {user?.role === 'admin' && (
        <>
          <Link 
            to="/users" 
            onClick={onItemClick}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            <Users className="size-4" />
            User Roles
          </Link>
          
          <Link 
            to="/departments" 
            onClick={onItemClick}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            <Building className="size-4" />
            Departments
          </Link>
          
          <Link 
            to="/logs" 
            onClick={onItemClick}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            <FileText className="size-4" />
            Activity Logs
          </Link>
        </>
      )}
      
      <Link 
        to="/chat" 
        onClick={onItemClick}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
      >
        <MessageSquare className="size-4" />
        KyusiChat
      </Link>
    </>
  );

  const FooterItems = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
      <Link 
        to="/profile" 
        onClick={onItemClick}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
      >
        <User className="size-4" />
        Profile
      </Link>
      
      <Button 
        variant="ghost" 
        onClick={() => {
          handleLogout();
          onItemClick?.();
        }}
        className="w-full justify-start text-white hover:bg-red-700 hover:text-white px-3 py-2"
      >
        <ArrowLeftFromLine className="mr-3 size-4" />
        Sign Out
      </Button>
    </>
  );
  
  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
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
            <NavItems />
          </nav>
          
          {/* Footer */}
          <div className="border-t border-red-700 p-4 space-y-2 mt-auto">
            <FooterItems />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Top Header */}
        <div className="bg-white border-b px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-red-800 text-white p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
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
                  
                  {/* Mobile Navigation */}
                  <nav className="flex-1 px-4 py-4 space-y-2">
                    <NavItems onItemClick={() => setMobileMenuOpen(false)} />
                  </nav>
                  
                  {/* Mobile Footer */}
                  <div className="border-t border-red-700 p-4 space-y-2 mt-auto">
                    <FooterItems onItemClick={() => setMobileMenuOpen(false)} />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop Logo - Only shown on mobile when sidebar is hidden */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="flex aspect-square size-6 items-center justify-center rounded-lg bg-red-800 overflow-hidden">
                <img 
                  src="https://www.pup.edu.ph/about/images/PUPLogo.png" 
                  alt="PUP Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-semibold text-red-800">KyusiTix</span>
            </div>

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
  );
};

export default ResponsiveLayout;
