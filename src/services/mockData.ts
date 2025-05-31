import { UserDetails, Ticket, Department, SystemLog } from '../models';

// Updated users with the new departments
export const mockUsers: UserDetails[] = [
  // Admin
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@pupqc.edu.ph',
    role: 'admin',
    department: 'it',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    contactNumber: '+63 123 456 7890',
    isActive: true,
    createdAt: '2024-01-15T08:00:00Z',
    lastLogin: '2024-12-15T10:30:00Z'
  },
  
  // Staff users with specific names
  {
    id: 'staff-1',
    name: 'Demelyn E. Monzon',
    email: 'demelyn.monzon@pupqc.edu.ph',
    role: 'staff',
    department: 'academic_affairs',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demelyn',
    contactNumber: '+63 123 456 7891',
    isActive: true,
    createdAt: '2024-01-16T08:00:00Z',
    lastLogin: '2024-12-15T09:15:00Z'
  },
  {
    id: 'staff-2',
    name: 'Alma C. Fernandez',
    email: 'alma.fernandez@pupqc.edu.ph',
    role: 'staff',
    department: 'student_affairs',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alma',
    contactNumber: '+63 123 456 7892',
    isActive: true,
    createdAt: '2024-01-17T08:00:00Z',
    lastLogin: '2024-12-15T08:45:00Z'
  },
  {
    id: 'staff-3',
    name: 'Berna A. Bulawit',
    email: 'berna.bulawit@pupqc.edu.ph',
    role: 'staff',
    department: 'finance',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=berna',
    contactNumber: '+63 123 456 7893',
    isActive: true,
    createdAt: '2024-01-18T08:00:00Z',
    lastLogin: '2024-12-15T11:20:00Z'
  },
  {
    id: 'staff-4',
    name: 'Roberto B. Doromal',
    email: 'roberto.doromal@pupqc.edu.ph',
    role: 'staff',
    department: 'it',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=roberto',
    contactNumber: '+63 123 456 7894',
    isActive: true,
    createdAt: '2024-01-19T08:00:00Z',
    lastLogin: '2024-12-15T14:30:00Z'
  },
  {
    id: 'staff-5',
    name: 'Geronimo A. Cuadra',
    email: 'geronimo.cuadra@pupqc.edu.ph',
    role: 'staff',
    department: 'student_affairs',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=geronimo',
    contactNumber: '+63 123 456 7895',
    isActive: true,
    createdAt: '2024-01-20T08:00:00Z',
    lastLogin: '2024-12-15T13:10:00Z'
  },
  {
    id: 'staff-6',
    name: 'Cherrylyn P. Esparagoza',
    email: 'cherrylyn.esparagoza@pupqc.edu.ph',
    role: 'staff',
    department: 'registrar',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cherrylyn',
    contactNumber: '+63 123 456 7896',
    isActive: true,
    createdAt: '2024-01-21T08:00:00Z',
    lastLogin: '2024-12-15T12:00:00Z'
  },
  
  // Faculty
  {
    id: 'faculty-1',
    name: 'Dr. Maria Santos',
    email: 'faculty@pupqc.edu.ph',
    role: 'faculty',
    department: 'computer_science',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=faculty',
    contactNumber: '+63 123 456 7897',
    isActive: true,
    createdAt: '2024-01-22T08:00:00Z',
    lastLogin: '2024-12-15T07:30:00Z'
  },
  
  // Student
  {
    id: 'student-1',
    name: 'Juan dela Cruz',
    email: 'student@pupqc.edu.ph',
    role: 'student',
    department: 'computer_science',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student',
    contactNumber: '+63 123 456 7898',
    isActive: true,
    createdAt: '2024-01-23T08:00:00Z',
    lastLogin: '2024-12-15T16:45:00Z'
  },
  
  // Alumni
  {
    id: 'alumni-1',
    name: 'Patricia Reyes',
    email: 'alumni@pupqc.edu.ph',
    role: 'alumni',
    department: 'information_technology',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alumni',
    contactNumber: '+63 123 456 7899',
    isActive: true,
    createdAt: '2024-01-24T08:00:00Z',
    lastLogin: '2024-12-15T18:20:00Z'
  }
];

// Sample tickets with updated departments
export const mockTickets: Ticket[] = [
  {
    id: 'TKT-2024-001',
    title: 'Cannot access student portal',
    description: 'I am unable to log into the student portal. It keeps showing an error message.',
    status: 'open',
    priority: 'high',
    createdBy: 'student-1',
    creatorName: 'Juan dela Cruz',
    assignedTo: 'staff-4',
    assigneeName: 'Roberto B. Doromal',
    department: 'it',
    createdAt: '2024-12-10T09:30:00Z',
    updatedAt: '2024-12-10T09:30:00Z',
    tags: ['portal', 'login'],
    attachments: []
  },
  {
    id: 'TKT-2024-002',
    title: 'Grade report request',
    description: 'I need my official grade report for scholarship application.',
    status: 'in_progress',
    priority: 'medium',
    createdBy: 'student-1',
    creatorName: 'Juan dela Cruz',
    assignedTo: 'staff-6',
    assigneeName: 'Cherrylyn P. Esparagoza',
    department: 'registrar',
    createdAt: '2024-12-12T14:15:00Z',
    updatedAt: '2024-12-14T10:20:00Z',
    tags: ['grades', 'report'],
    attachments: []
  },
  {
    id: 'TKT-2024-003',
    title: 'Scholarship inquiry',
    description: 'I would like to know about available scholarships for next semester.',
    status: 'resolved',
    priority: 'low',
    createdBy: 'student-1',
    creatorName: 'Juan dela Cruz',
    assignedTo: 'staff-5',
    assigneeName: 'Geronimo A. Cuadra',
    department: 'student_affairs',
    createdAt: '2024-12-08T11:00:00Z',
    updatedAt: '2024-12-13T16:30:00Z',
    tags: ['scholarship'],
    attachments: []
  },
  {
    id: 'TKT-2024-004',
    title: 'Enrollment issue',
    description: 'Having trouble with course enrollment for next semester.',
    status: 'open',
    priority: 'urgent',
    createdBy: 'alumni-1',
    creatorName: 'Patricia Reyes',
    assignedTo: 'staff-1',
    assigneeName: 'Demelyn E. Monzon',
    department: 'academic_affairs',
    createdAt: '2024-12-15T08:45:00Z',
    updatedAt: '2024-12-15T08:45:00Z',
    tags: ['enrollment'],
    attachments: []
  },
  {
    id: 'TKT-2024-005',
    title: 'Payment verification',
    description: 'Need verification of tuition payment made last week.',
    status: 'on_hold',
    priority: 'medium',
    createdBy: 'student-1',
    creatorName: 'Juan dela Cruz',
    assignedTo: 'staff-3',
    assigneeName: 'Berna A. Bulawit',
    department: 'finance',
    createdAt: '2024-12-11T13:20:00Z',
    updatedAt: '2024-12-14T09:15:00Z',
    tags: ['payment', 'verification'],
    attachments: []
  }
];

// Updated departments with the requested ones
export const mockDepartments: Department[] = [
  {
    id: 'academic_affairs',
    name: 'Academic Affairs',
    description: 'Handles academic policies, curriculum, and academic matters',
    headOfDepartment: 'Demelyn E. Monzon',
    contactEmail: 'academic.affairs@pupqc.edu.ph',
    contactNumber: '+63 123 456 1001',
    isActive: true
  },
  {
    id: 'registrar',
    name: 'Registrar',
    description: 'Manages student records, grades, and academic transcripts',
    headOfDepartment: 'Cherrylyn P. Esparagoza',
    contactEmail: 'registrar@pupqc.edu.ph',
    contactNumber: '+63 123 456 1002',
    isActive: true
  },
  {
    id: 'it',
    name: 'IT',
    description: 'Information Technology support and infrastructure',
    headOfDepartment: 'Roberto B. Doromal',
    contactEmail: 'it.support@pupqc.edu.ph',
    contactNumber: '+63 123 456 1003',
    isActive: true
  },
  {
    id: 'finance',
    name: 'Finance (Accounting)',
    description: 'Financial services, accounting, and payment processing',
    headOfDepartment: 'Berna A. Bulawit',
    contactEmail: 'finance@pupqc.edu.ph',
    contactNumber: '+63 123 456 1004',
    isActive: true
  },
  {
    id: 'alumni_affairs',
    name: 'Alumni Affairs',
    description: 'Alumni relations and services',
    headOfDepartment: 'Alumni Director',
    contactEmail: 'alumni@pupqc.edu.ph',
    contactNumber: '+63 123 456 1005',
    isActive: true
  },
  {
    id: 'student_affairs',
    name: 'Student Affairs (OSAS)',
    description: 'Student services, scholarships, and student welfare',
    headOfDepartment: 'Alma C. Fernandez',
    contactEmail: 'osas@pupqc.edu.ph',
    contactNumber: '+63 123 456 1006',
    isActive: true
  },
  {
    id: 'computer_science',
    name: 'Computer Science',
    description: 'Computer Science department',
    headOfDepartment: 'Dr. Maria Santos',
    contactEmail: 'cs@pupqc.edu.ph',
    contactNumber: '+63 123 456 1007',
    isActive: true
  },
  {
    id: 'information_technology',
    name: 'Information Technology',
    description: 'Information Technology department',
    headOfDepartment: 'IT Department Head',
    contactEmail: 'it.dept@pupqc.edu.ph',
    contactNumber: '+63 123 456 1008',
    isActive: true
  }
];

// Sample system logs
export const mockSystemLogs: SystemLog[] = [
  {
    id: 'log-1',
    action: 'user_login',
    userId: 'admin-1',
    userName: 'Admin User',
    details: 'User logged into the system',
    timestamp: '2024-12-15T10:30:00Z',
    ipAddress: '192.168.1.100'
  },
  {
    id: 'log-2',
    action: 'ticket_created',
    userId: 'student-1',
    userName: 'Juan dela Cruz',
    details: 'Created ticket TKT-2024-001: Cannot access student portal',
    timestamp: '2024-12-10T09:30:00Z',
    ipAddress: '192.168.1.101'
  },
  {
    id: 'log-3',
    action: 'ticket_assigned',
    userId: 'admin-1',
    userName: 'Admin User',
    details: 'Assigned ticket TKT-2024-001 to Roberto B. Doromal',
    timestamp: '2024-12-10T10:15:00Z',
    ipAddress: '192.168.1.100'
  },
  {
    id: 'log-4',
    action: 'user_created',
    userId: 'admin-1',
    userName: 'Admin User',
    details: 'Created new user account for Demelyn E. Monzon',
    timestamp: '2024-01-16T08:00:00Z',
    ipAddress: '192.168.1.100'
  },
  {
    id: 'log-5',
    action: 'ticket_status_updated',
    userId: 'staff-6',
    userName: 'Cherrylyn P. Esparagoza',
    details: 'Updated ticket TKT-2024-002 status to in_progress',
    timestamp: '2024-12-14T10:20:00Z',
    ipAddress: '192.168.1.105'
  }
];

export const generateMockData = () => {
  return {
    users: mockUsers,
    tickets: mockTickets,
    departments: mockDepartments,
    systemLogs: mockSystemLogs
  };
};
