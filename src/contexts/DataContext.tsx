import React, { createContext, useState, useContext, useEffect } from 'react';
import { Ticket, Department, UserDetails, TicketStatus, TicketPriority, FileAttachment, TicketComment } from '@/models';
import { useAuth } from './AuthContext';
import { toast } from "@/components/ui/sonner";
import { ticketAPI, departmentAPI, userAPI } from '@/services/api';

interface SystemLog {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: 'ticket_created' | 'comment_added' | 'status_changed' | 'assigned' | 'unassigned' | 'auto_routed';
  ticketId: string;
  description: string;
  timestamp: string;
}

interface DataContextType {
  tickets: Ticket[];
  departments: Department[];
  users: UserDetails[];
  logs: SystemLog[];
  loading: boolean;
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments'>, files?: File[]) => Promise<void>;
  updateTicket: (id: string, updates: Partial<Ticket>, files?: File[]) => Promise<void>;
  deleteTicket: (id: string) => void;
  addTicketComment: (ticketId: string, content: string, isInternal: boolean, file?: File | null) => Promise<void>;
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
  assignTicket: (ticketId: string, userId: string) => Promise<void>;
  getMyTickets: () => Ticket[];
  getAssignedToMeTickets: () => Ticket[];
  getOpenTickets: () => Ticket[];
  getClosedTickets: () => Ticket[];
  getUserById: (id: string) => UserDetails | undefined;
  deleteAttachment: (ticketId: string, attachmentId: string) => void;
  refreshTickets: () => Promise<void>;
  exportTickets: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load initial data
  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        refreshTickets(),
        loadDepartments(),
        loadUsers(),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const refreshTickets = async () => {
    try {
      const response = await ticketAPI.getTickets();
      const backendTickets = response.tickets.map((ticket: any) => ({
        id: ticket.id.toString(),
        title: ticket.subject,
        description: ticket.description,
        status: ticket.status as TicketStatus,
        priority: ticket.priority as TicketPriority,
        createdBy: ticket.created_by || 'unknown',
        creatorName: ticket.created_by || 'Unknown User',
        creatorRole: 'student' as const,
        assignedTo: ticket.assigned_to || undefined,
        assigneeName: ticket.assigned_to || undefined,
        department: ticket.department || undefined,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
        comments: [], // Will be loaded when viewing ticket details
        attachments: [],
      }));
      setTickets(backendTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast.error('Failed to load tickets');
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await departmentAPI.getDepartments();
      const backendDepartments = response.departments.map((dept: any) => ({
        id: dept.id,
        name: dept.name,
        description: `Department handling ${dept.name.toLowerCase()} related matters`,
        head: 'Department Head',
        members: dept.ticket_count || 0,
        createdAt: new Date().toISOString(),
      }));
      setDepartments(backendDepartments);
    } catch (error) {
      console.error('Error loading departments:', error);
      toast.error('Failed to load departments');
    }
  };

  const loadUsers = async () => {
    try {
      if (user?.role === 'admin') {
        const response = await userAPI.getUsers();
        const backendUsers = response.users.map((u: any) => ({
          id: u.id.toString(),
          name: u.name,
          email: u.email,
          role: u.role,
          department: u.department,
          position: u.role === 'admin' ? 'Administrator' : 'Staff Member',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`,
          createdAt: u.date_joined,
        }));
        setUsers(backendUsers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      // Don't show error for non-admin users
      if (user?.role === 'admin') {
        toast.error('Failed to load users');
      }
    }
  };

  const addTicket = async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments'>, files: File[] = []) => {
    try {
      const response = await ticketAPI.createTicket({
        subject: ticketData.title,
        description: ticketData.description,
        priority: ticketData.priority,
        department: ticketData.department,
      });

      toast.success("Ticket created successfully");
      await refreshTickets(); // Refresh to get the new ticket

      addLog('ticket_created', response.ticket_id, `Created ticket "${ticketData.title}" with priority ${ticketData.priority}`);
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create ticket');
      throw error;
    }
  };

  const updateTicket = async (id: string, updates: Partial<Ticket>, files: File[] = []) => {
    try {
      // Update status if provided
      if (updates.status) {
        await ticketAPI.updateTicketStatus(id, updates.status);
      }

      toast.success("Ticket updated successfully");
      await refreshTickets();

      addLog('status_changed', id, `Updated ticket status to ${updates.status}`);
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Failed to update ticket');
      throw error;
    }
  };

  const deleteTicket = (id: string) => {
    // Note: You might want to implement a delete endpoint in the backend
    setTickets(prev => prev.filter(ticket => ticket.id !== id));
    toast.success("Ticket deleted successfully");
  };

  const addTicketComment = async (ticketId: string, content: string, isInternal: boolean, file?: File | null) => {
    try {
      await ticketAPI.addComment(ticketId, content, isInternal);
      toast.success("Comment added successfully");

      // Refresh tickets to get updated comments
      await refreshTickets();

      addLog('comment_added', ticketId, `Added ${isInternal ? 'internal note' : 'comment'}`);
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
      throw error;
    }
  };

  const assignTicket = async (ticketId: string, userId: string) => {
    try {
      await ticketAPI.assignTicket(ticketId, userId);
      toast.success("Ticket assigned successfully");
      await refreshTickets();

      const assignee = users.find(u => u.id === userId);
      addLog('assigned', ticketId, `Assigned ticket to ${assignee?.name || 'user'}`);
    } catch (error) {
      console.error('Error assigning ticket:', error);
      toast.error('Failed to assign ticket');
      throw error;
    }
  };

  const exportTickets = async () => {
    try {
      await ticketAPI.exportTickets();
      toast.success("Tickets exported successfully");
    } catch (error) {
      console.error('Error exporting tickets:', error);
      toast.error('Failed to export tickets');
    }
  };

  // Helper functions (keeping the same logic but working with backend data)
  const getMyTickets = () => {
    if (!user) return [];
    return tickets.filter(ticket => ticket.createdBy === user.id);
  };

  const getAssignedToMeTickets = () => {
    if (!user) return [];
    return tickets.filter(ticket => ticket.assignedTo === user.id);
  };

  const getOpenTickets = () => {
    return tickets.filter(ticket => ticket.status === 'open' || ticket.status === 'in_progress');
  };

  const getClosedTickets = () => {
    return tickets.filter(ticket => ticket.status === 'closed' || ticket.status === 'resolved');
  };

  const getUserById = (id: string) => {
    return users.find(user => user.id === id);
  };

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

    const statusCounts: Record<TicketStatus, number> = {
      open: tickets.filter(t => t.status === 'open').length,
      in_progress: tickets.filter(t => t.status === 'in_progress').length,
      on_hold: tickets.filter(t => t.status === 'on_hold').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length,
    };

    const priorityCounts: Record<TicketPriority, number> = {
      low: tickets.filter(t => t.priority === 'low').length,
      medium: tickets.filter(t => t.priority === 'medium').length,
      high: tickets.filter(t => t.priority === 'high').length,
      urgent: tickets.filter(t => t.priority === 'urgent').length,
    };

    return { open, urgent, resolvedToday, statusCounts, priorityCounts };
  };

  // Placeholder functions for features not yet implemented in backend
  const addUser = (userData: Omit<UserDetails, 'id' | 'createdAt'>) => {
    toast.info("User management not yet implemented in backend");
  };

  const updateUser = (id: string, updates: Partial<UserDetails>) => {
    toast.info("User management not yet implemented in backend");
  };

  const deleteUser = (id: string) => {
    toast.info("User management not yet implemented in backend");
  };

  const addDepartment = (departmentData: Omit<Department, 'id' | 'createdAt'>) => {
    toast.info("Department management not yet implemented in backend");
  };

  const updateDepartment = (id: string, updates: Partial<Department>) => {
    toast.info("Department management not yet implemented in backend");
  };

  const deleteDepartment = (id: string) => {
    toast.info("Department management not yet implemented in backend");
  };

  const deleteAttachment = (ticketId: string, attachmentId: string) => {
    toast.info("Attachment management not yet implemented in backend");
  };

  const addLog = (action: SystemLog['action'], ticketId: string, description: string) => {
    if (!user) return;

    const log: SystemLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      action,
      ticketId,
      description,
      timestamp: new Date().toISOString(),
    };

    setLogs(prev => [log, ...prev]);
  };

  return (
    <DataContext.Provider value={{
      tickets,
      departments,
      users,
      logs,
      loading,
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
      deleteAttachment,
      refreshTickets,
      exportTickets,
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