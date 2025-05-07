
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Ticket, Department, UserDetails, TicketStatus, TicketPriority } from '@/models';
import { mockTickets, mockDepartments, mockUsers } from '@/services/mockData';
import { useAuth } from './AuthContext';
import { toast } from "@/components/ui/sonner";

interface DataContextType {
  tickets: Ticket[];
  departments: Department[];
  users: UserDetails[];
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;
  addTicketComment: (ticketId: string, content: string, isInternal: boolean) => void;
  addUser: (user: Omit<UserDetails, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<UserDetails>) => void;
  deleteUser: (id: string) => void;
  addDepartment: (department: Omit<Department, 'id' | 'createdAt'>) => void;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  getTicketStatsCounts: () => { 
    open: number; 
    urgent: number; 
    resolvedToday: number;
    statusCounts: Record<TicketStatus, number>;
    priorityCounts: Record<TicketPriority, number>;
  };
  assignTicket: (ticketId: string, userId: string) => void;
  getMyTickets: () => Ticket[];
  getAssignedToMeTickets: () => Ticket[];
  getOpenTickets: () => Ticket[];
  getClosedTickets: () => Ticket[];
  getUserById: (id: string) => UserDetails | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [users, setUsers] = useState<UserDetails[]>(mockUsers);
  const { user } = useAuth();

  // Add a new ticket
  const addTicket = (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => {
    const newTicket: Ticket = {
      ...ticket,
      id: `ticket-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
    };
    
    setTickets(prev => [newTicket, ...prev]);
    toast.success("Ticket created successfully");
    return newTicket;
  };

  // Update an existing ticket
  const updateTicket = (id: string, updates: Partial<Ticket>) => {
    setTickets(prev => 
      prev.map(ticket => 
        ticket.id === id 
          ? { ...ticket, ...updates, updatedAt: new Date().toISOString() } 
          : ticket
      )
    );
    toast.success("Ticket updated successfully");
  };

  // Delete a ticket
  const deleteTicket = (id: string) => {
    setTickets(prev => prev.filter(ticket => ticket.id !== id));
    toast.success("Ticket deleted successfully");
  };

  // Add comment to a ticket
  const addTicketComment = (ticketId: string, content: string, isInternal: boolean) => {
    if (!user) return;
    
    const comment = {
      id: `comment-${Date.now()}`,
      ticketId,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      userAvatar: user.avatar,
      content,
      createdAt: new Date().toISOString(),
      isInternal,
    };
    
    setTickets(prev => 
      prev.map(ticket => 
        ticket.id === ticketId 
          ? { 
              ...ticket, 
              comments: [...ticket.comments, comment],
              updatedAt: new Date().toISOString(),
            } 
          : ticket
      )
    );
  };

  // User management
  const addUser = (userData: Omit<UserDetails, 'id' | 'createdAt'>) => {
    const newUser: UserDetails = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    setUsers(prev => [...prev, newUser]);
    toast.success("User added successfully");
  };

  const updateUser = (id: string, updates: Partial<UserDetails>) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === id 
          ? { ...user, ...updates } 
          : user
      )
    );
    toast.success("User updated successfully");
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
    toast.success("User deleted successfully");
  };

  // Department management
  const addDepartment = (departmentData: Omit<Department, 'id' | 'createdAt'>) => {
    const newDepartment: Department = {
      ...departmentData,
      id: `department-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    setDepartments(prev => [...prev, newDepartment]);
    toast.success("Department added successfully");
  };

  const updateDepartment = (id: string, updates: Partial<Department>) => {
    setDepartments(prev => 
      prev.map(dept => 
        dept.id === id 
          ? { ...dept, ...updates } 
          : dept
      )
    );
    toast.success("Department updated successfully");
  };

  const deleteDepartment = (id: string) => {
    setDepartments(prev => prev.filter(dept => dept.id !== id));
    toast.success("Department deleted successfully");
  };

  // Get ticket statistics
  const getTicketStatsCounts = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const open = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
    const urgent = tickets.filter(t => t.priority === 'urgent' && (t.status === 'open' || t.status === 'in_progress')).length;
    const resolvedToday = tickets.filter(t => {
      const updatedDate = new Date(t.updatedAt);
      updatedDate.setHours(0, 0, 0, 0);
      return t.status === 'resolved' && updatedDate.getTime() === today.getTime();
    }).length;
    
    // Get counts by status
    const statusCounts: Record<TicketStatus, number> = {
      open: tickets.filter(t => t.status === 'open').length,
      in_progress: tickets.filter(t => t.status === 'in_progress').length,
      on_hold: tickets.filter(t => t.status === 'on_hold').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length,
    };
    
    // Get counts by priority
    const priorityCounts: Record<TicketPriority, number> = {
      low: tickets.filter(t => t.priority === 'low').length,
      medium: tickets.filter(t => t.priority === 'medium').length,
      high: tickets.filter(t => t.priority === 'high').length,
      urgent: tickets.filter(t => t.priority === 'urgent').length,
    };
    
    return { open, urgent, resolvedToday, statusCounts, priorityCounts };
  };

  // Assign a ticket to a user
  const assignTicket = (ticketId: string, userId: string) => {
    const assignee = users.find(u => u.id === userId);
    
    if (assignee) {
      updateTicket(ticketId, {
        assignedTo: assignee.id,
        assigneeName: assignee.name,
        assigneeAvatar: assignee.avatar,
        status: 'in_progress'
      });
    }
  };

  // Get tickets created by the current user
  const getMyTickets = () => {
    if (!user) return [];
    return tickets.filter(ticket => ticket.createdBy === user.id);
  };

  // Get tickets assigned to the current user
  const getAssignedToMeTickets = () => {
    if (!user) return [];
    return tickets.filter(ticket => ticket.assignedTo === user.id);
  };

  // Get all open tickets (for admins)
  const getOpenTickets = () => {
    return tickets.filter(ticket => ticket.status === 'open' || ticket.status === 'in_progress');
  };

  // Get all closed tickets (for admins)
  const getClosedTickets = () => {
    return tickets.filter(ticket => ticket.status === 'closed' || ticket.status === 'resolved');
  };

  // Get user by ID
  const getUserById = (id: string) => {
    return users.find(user => user.id === id);
  };

  return (
    <DataContext.Provider value={{
      tickets,
      departments,
      users,
      addTicket,
      updateTicket,
      deleteTicket,
      addTicketComment,
      addUser,
      updateUser,
      deleteUser,
      addDepartment,
      updateDepartment,
      deleteDepartment,
      getTicketStatsCounts,
      assignTicket,
      getMyTickets,
      getAssignedToMeTickets,
      getOpenTickets,
      getClosedTickets,
      getUserById,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
