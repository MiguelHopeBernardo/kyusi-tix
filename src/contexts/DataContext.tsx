import React, { createContext, useState, useContext, useEffect } from 'react';
import { Ticket, Department, UserDetails, TicketStatus, TicketPriority, FileAttachment } from '@/models';
import { mockTickets, mockDepartments, mockUsers } from '@/services/mockData';
import { useAuth } from './AuthContext';
import { toast } from "@/components/ui/sonner";

interface DataContextType {
  tickets: Ticket[];
  departments: Department[];
  users: UserDetails[];
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments'>, files?: File[]) => void;
  updateTicket: (id: string, updates: Partial<Ticket>, files?: File[]) => void;
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
  deleteAttachment: (ticketId: string, attachmentId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [users, setUsers] = useState<UserDetails[]>(mockUsers);
  const { user } = useAuth();

  // Helper function to convert File objects to FileAttachment
  const processFiles = (files: File[], ticketId: string): FileAttachment[] => {
    if (!files || files.length === 0) return [];
    if (!user) return [];
    
    return files.map(file => {
      const fileType = file.type as 'image/jpeg' | 'image/png' | 'application/pdf';
      
      // Create object URL for preview
      const fileUrl = URL.createObjectURL(file);
      
      return {
        id: `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ticketId: ticketId,
        filename: file.name,
        fileType: fileType,
        fileUrl: fileUrl,
        fileSize: file.size,
        uploadedBy: user.id,
        uploadedAt: new Date().toISOString()
      };
    });
  };

  // Add a new ticket
  const addTicket = (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments'>, files: File[] = []) => {
    const ticketId = `ticket-${Date.now()}`;
    
    const newAttachments = processFiles(files, ticketId);
    
    const newTicket: Ticket = {
      ...ticket,
      id: ticketId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      attachments: newAttachments,
    };
    
    setTickets(prev => [newTicket, ...prev]);
    toast.success("Ticket created successfully");
    return newTicket;
  };

  // Update an existing ticket
  const updateTicket = (id: string, updates: Partial<Ticket>, files: File[] = []) => {
    setTickets(prev => 
      prev.map(ticket => {
        if (ticket.id === id) {
          // Process new attachments if any
          const newAttachments = processFiles(files, id);
          
          return { 
            ...ticket, 
            ...updates, 
            updatedAt: new Date().toISOString(),
            attachments: [
              ...(ticket.attachments || []),
              ...newAttachments
            ]
          };
        }
        return ticket;
      })
    );
    toast.success("Ticket updated successfully");
  };

  // Delete attachment from a ticket
  const deleteAttachment = (ticketId: string, attachmentId: string) => {
    setTickets(prev => 
      prev.map(ticket => {
        if (ticket.id === ticketId && ticket.attachments) {
          // Find the attachment to revoke its URL
          const attachmentToDelete = ticket.attachments.find(a => a.id === attachmentId);
          if (attachmentToDelete && attachmentToDelete.fileUrl) {
            URL.revokeObjectURL(attachmentToDelete.fileUrl);
          }
          
          return {
            ...ticket,
            attachments: ticket.attachments.filter(a => a.id !== attachmentId)
          };
        }
        return ticket;
      })
    );
    toast.success("Attachment deleted successfully");
  };

  // Delete a ticket
  const deleteTicket = (id: string) => {
    // Find ticket to clean up any attachment URLs before removing
    const ticketToDelete = tickets.find(t => t.id === id);
    if (ticketToDelete && ticketToDelete.attachments) {
      ticketToDelete.attachments.forEach(attachment => {
        if (attachment.fileUrl) {
          URL.revokeObjectURL(attachment.fileUrl);
        }
      });
    }
    
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

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      tickets.forEach(ticket => {
        if (ticket.attachments) {
          ticket.attachments.forEach(attachment => {
            if (attachment.fileUrl) {
              URL.revokeObjectURL(attachment.fileUrl);
            }
          });
        }
      });
    };
  }, []);

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
      deleteAttachment,
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
