
import React, { createContext, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, Ticket, TicketComment, TicketPriority, TicketStatus, Department } from '@/models';
import { useAuth } from './AuthContext';

interface DataContextType {
  users: User[];
  tickets: Ticket[];
  departments: Department[];
  addUser: (user: Omit<User, 'id' | 'avatar'>) => void;
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments'>, files?: File[]) => void;
  addTicketComment: (ticketId: string, content: string, isInternal: boolean, file?: File | null) => void;
  updateTicket: (id: string, updates: Partial<Ticket>, files?: File[]) => void;
  deleteTicket: (id: string) => void;
  deleteAttachment: (ticketId: string, attachmentId: string) => void;
  assignTicket: (ticketId: string, assigneeId: string) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addDepartment: (department: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  getMyTickets: () => Ticket[];
  getAssignedToMeTickets: () => Ticket[];
  getOpenTickets: () => Ticket[];
  getClosedTickets: () => Ticket[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Generate a simple unique ID
const generateId = () => uuidv4();

// Initial data - replace with API calls later
const initialUsers: User[] = [
  {
    id: generateId(),
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin',
    department: 'IT',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=John',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Alice Smith',
    email: 'alice.smith@example.com',
    role: 'faculty',
    department: 'Registrar',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Alice',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Bob Williams',
    email: 'bob.williams@example.com',
    role: 'student',
    department: 'Student Services',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Bob',
    createdAt: new Date().toISOString(),
  },
];

const initialDepartments: Department[] = [
  { id: generateId(), name: 'IT', description: 'Information Technology', createdAt: new Date().toISOString() },
  { id: generateId(), name: 'Registrar', description: 'Student Registration', createdAt: new Date().toISOString() },
  { id: generateId(), name: 'Finance', description: 'Financial Affairs', createdAt: new Date().toISOString() },
  { id: generateId(), name: 'Student Services', description: 'Student Support', createdAt: new Date().toISOString() },
  { id: generateId(), name: 'Academic Affairs', description: 'Academic Management', createdAt: new Date().toISOString() },
];

const initialTickets: Ticket[] = [
  {
    id: generateId(),
    title: 'Password Reset Request',
    description: 'I need help resetting my password. I have forgotten it and cannot log in.',
    status: 'open',
    priority: 'high',
    createdBy: initialUsers[2].id,
    creatorName: initialUsers[2].name,
    creatorAvatar: initialUsers[2].avatar,
    creatorRole: initialUsers[2].role,
    assignedTo: initialUsers[0].id,
    assigneeName: initialUsers[0].name,
    assigneeAvatar: initialUsers[0].avatar,
    department: 'IT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [
      {
        id: generateId(),
        ticketId: '',
        userId: initialUsers[0].id,
        content: 'We are looking into it',
        userName: initialUsers[0].name,
        userAvatar: initialUsers[0].avatar,
        userRole: initialUsers[0].role,
        createdAt: new Date().toISOString(),
        isInternal: false
      }
    ],
    attachments: []
  },
  {
    id: generateId(),
    title: 'Enrollment Issues',
    description: 'I am having trouble enrolling in classes for the upcoming semester.',
    status: 'in_progress',
    priority: 'medium',
    createdBy: initialUsers[2].id,
    creatorName: initialUsers[2].name,
    creatorAvatar: initialUsers[2].avatar,
    creatorRole: initialUsers[2].role,
    assignedTo: initialUsers[1].id,
    assigneeName: initialUsers[1].name,
    assigneeAvatar: initialUsers[1].avatar,
    department: 'Registrar',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [],
    attachments: []
  },
  {
    id: generateId(),
    title: 'Financial Aid Inquiry',
    description: 'I have a question about my financial aid package. Can someone assist me?',
    status: 'resolved',
    priority: 'low',
    createdBy: initialUsers[2].id,
    creatorName: initialUsers[2].name,
    creatorAvatar: initialUsers[2].avatar,
    creatorRole: initialUsers[2].role,
    assignedTo: initialUsers[0].id,
    assigneeName: initialUsers[0].name,
    assigneeAvatar: initialUsers[0].avatar,
    department: 'Finance',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [],
    attachments: []
  },
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const { user } = useAuth();

  useEffect(() => {
    // Load data from local storage on component mount
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }

    const storedTickets = localStorage.getItem('tickets');
    if (storedTickets) {
      setTickets(JSON.parse(storedTickets));
    }

    const storedDepartments = localStorage.getItem('departments');
    if (storedDepartments) {
      setDepartments(JSON.parse(storedDepartments));
    }
  }, []);

  useEffect(() => {
    // Save data to local storage whenever it changes
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('tickets', JSON.stringify(tickets));
    localStorage.setItem('departments', JSON.stringify(departments));
  }, [users, tickets, departments]);

  const addUser = (user: Omit<User, 'id' | 'avatar'>) => {
    const newUser: User = {
      id: generateId(),
      ...user,
      avatar: `https://api.dicebear.com/7.x/lorelei/svg?seed=${user.name}`,
    };
    setUsers(prev => [...prev, newUser]);
  };

  const addTicket = (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'attachments'>, files?: File[]) => {
    if (!user) return;

    const newTicket: Ticket = {
      id: generateId(),
      ...ticket,
      createdBy: user.id,
      creatorName: user.name,
      creatorAvatar: user.avatar,
      creatorRole: user.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      attachments: []
    };
    setTickets(prev => [...prev, newTicket]);
  };

  const addTicketComment = (ticketId: string, content: string, isInternal: boolean, file?: File | null) => {
    if (!user) return;

    const newComment: TicketComment = {
      id: generateId(),
      ticketId,
      userId: user.id,
      content,
      userName: user.name,
      userAvatar: user.avatar,
      userRole: user.role,
      createdAt: new Date().toISOString(),
      isInternal,
      attachment: file ? {
        id: generateId(),
        ticketId,
        filename: file.name,
        fileSize: file.size,
        fileType: file.type as any,
        fileUrl: URL.createObjectURL(file),
        uploadedBy: user.id,
        uploadedAt: new Date().toISOString()
      } : undefined
    };

    setTickets(prev => prev.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          comments: [...ticket.comments, newComment],
          updatedAt: new Date().toISOString()
        };
      }
      return ticket;
    }));
  };

  const updateTicket = (id: string, updates: Partial<Ticket>, files?: File[]) => {
    setTickets(prev => prev.map(ticket => {
      if (ticket.id === id) {
        const updatedTicket = { ...ticket, ...updates, updatedAt: new Date().toISOString() };
        
        // Check if assignment changed for manual routing tracking
        if (updates.assignedTo !== undefined && updates.assignedTo !== ticket.assignedTo) {
          const oldAssignee = ticket.assigneeName || 'No one';
          const newAssignee = updates.assigneeName || users.find(u => u.id === updates.assignedTo)?.name || 'No one';
          const department = updates.department || ticket.department || 'Unknown';
          
          // Add internal note for manual routing
          if (updates.assignedTo !== ticket.assignedTo) {
            const routingNote = `Ticket was manually routed to department: ${department}, assignee: ${newAssignee}.`;
            const internalComment: TicketComment = {
              id: generateId(),
              ticketId: id,
              userId: 'system',
              content: routingNote,
              userName: 'System',
              userAvatar: '',
              userRole: 'admin',
              createdAt: new Date().toISOString(),
              isInternal: true
            };
            
            updatedTicket.comments = [...updatedTicket.comments, internalComment];
          }
        }
        
        return updatedTicket;
      }
      return ticket;
    }));
  };

  const assignTicket = (ticketId: string, assigneeId: string) => {
    const assignee = users.find(u => u.id === assigneeId);
    if (!assignee) return;
    
    setTickets(prev => prev.map(ticket => {
      if (ticket.id === ticketId) {
        const oldAssignee = ticket.assigneeName || 'No one';
        const newAssignee = assignee.name;
        const department = assignee.department || ticket.department || 'Unknown';
        
        // Create internal note for assignment tracking
        const assignmentNote = `Ticket was manually routed to department: ${department}, assignee: ${newAssignee}.`;
        const internalComment: TicketComment = {
          id: generateId(),
          ticketId,
          userId: 'system',
          content: assignmentNote,
          userName: 'System',
          userAvatar: '',
          userRole: 'admin',
          createdAt: new Date().toISOString(),
          isInternal: true
        };
        
        return {
          ...ticket,
          assignedTo: assignee.id,
          assigneeName: assignee.name,
          assigneeAvatar: assignee.avatar,
          department: assignee.department,
          status: 'in_progress' as TicketStatus,
          updatedAt: new Date().toISOString(),
          comments: [...ticket.comments, internalComment]
        };
      }
      return ticket;
    }));
  };

  const deleteTicket = (id: string) => {
    setTickets(prev => prev.filter(ticket => ticket.id !== id));
  };

  const deleteAttachment = (ticketId: string, attachmentId: string) => {
    setTickets(prev => prev.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          attachments: ticket.attachments?.filter(attachment => attachment.id !== attachmentId) || [],
          updatedAt: new Date().toISOString()
        };
      }
      return ticket;
    }));
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user =>
      user.id === id ? { ...user, ...updates } : user
    ));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  const addDepartment = (department: Omit<Department, 'id'>) => {
    const newDepartment: Department = {
      id: generateId(),
      ...department,
      createdAt: new Date().toISOString(),
    };
    setDepartments(prev => [...prev, newDepartment]);
  };

  const updateDepartment = (id: string, updates: Partial<Department>) => {
    setDepartments(prev => prev.map(department =>
      department.id === id ? { ...department, ...updates } : department
    ));
  };

  const deleteDepartment = (id: string) => {
    setDepartments(prev => prev.filter(department => department.id !== id));
  };

  // Helper methods for ticket filtering
  const getMyTickets = () => {
    if (!user) return [];
    return tickets.filter(ticket => ticket.createdBy === user.id);
  };

  const getAssignedToMeTickets = () => {
    if (!user) return [];
    return tickets.filter(ticket => ticket.assignedTo === user.id);
  };

  const getOpenTickets = () => {
    return tickets.filter(ticket => ['open', 'in_progress'].includes(ticket.status));
  };

  const getClosedTickets = () => {
    return tickets.filter(ticket => ['resolved', 'closed'].includes(ticket.status));
  };

  return (
    <DataContext.Provider value={{
      users,
      tickets,
      departments,
      addUser,
      addTicket,
      addTicketComment,
      updateTicket,
      deleteTicket,
      deleteAttachment,
      assignTicket,
      updateUser,
      deleteUser,
      addDepartment,
      updateDepartment,
      deleteDepartment,
      getMyTickets,
      getAssignedToMeTickets,
      getOpenTickets,
      getClosedTickets
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
