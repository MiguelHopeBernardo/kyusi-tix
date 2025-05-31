
// Ticket priority levels
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

// Ticket statuses
export type TicketStatus = 'open' | 'in_progress' | 'on_hold' | 'resolved' | 'closed';

// User roles
export type UserRole = 'admin' | 'faculty' | 'student';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  position?: string;
  studentId?: string;
  avatar?: string;
  createdAt?: string;
}

// Comment interface
export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userRole: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  isInternal: boolean; // For staff-only comments
  attachment?: FileAttachment; // New field for comment attachment
}

// File attachment interface
export interface FileAttachment {
  id: string;
  ticketId: string;
  filename: string;
  fileType: 'image/jpeg' | 'image/png' | 'application/pdf';
  fileUrl: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
}

// Ticket interface
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdBy: string;
  creatorName: string;
  creatorAvatar?: string;
  creatorRole: string;
  assignedTo?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
  comments: TicketComment[];
  attachments?: FileAttachment[];
}

// Department interface
export interface Department {
  id: string;
  name: string;
  description: string;
  head?: string;
  members?: number;
  createdAt: string;
}

// User interface extensions
export interface UserDetails {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  position?: string;
  studentId?: string;
  avatar?: string;
  createdAt: string;
}
