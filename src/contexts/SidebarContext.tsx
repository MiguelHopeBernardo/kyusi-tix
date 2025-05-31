
import React, { createContext, useContext, useState } from 'react';

interface SidebarContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  collapse: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(true);

  const collapse = () => setOpen(!open);

  return (
    <SidebarContext.Provider value={{ open, setOpen, collapse }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
