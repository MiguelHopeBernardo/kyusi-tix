import { 
  Ticket, 
  Department, 
  UserDetails, 
  TicketStatus, 
  TicketPriority, 
  TicketComment 
} from '@/models';

// Generate random date within the last 30 days
const randomDate = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

// Mock users data
export const mockUsers: UserDetails[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@pupqc.edu.ph',
    role: 'admin',
    position: 'System Administrator',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    createdAt: randomDate(),
  },
  {
    id: '2',
    name: 'Faculty Member',
    email: 'faculty@pupqc.edu.ph',
    role: 'faculty',
    department: 'Computer Science',
    position: 'Professor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=faculty',
    createdAt: randomDate(),
  },
  {
    id: '3',
    name: 'Student User',
    email: 'student@pupqc.edu.ph',
    role: 'student',
    department: 'Computer Science',
    studentId: '2020-12345',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student',
    createdAt: randomDate(),
  },
  {
    id: '4',
    name: 'Alumni User',
    email: 'alumni@pupqc.edu.ph',
    role: 'alumni',
    department: 'Information Technology',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alumni',
    createdAt: randomDate(),
  },
  {
    id: '5',
    name: 'Miguel Bernardo',
    email: 'miggythegreat@pupqc.edu.ph',
    role: 'faculty',
    department: 'Business Administration',
    position: 'Assistant Professor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    createdAt: randomDate(),
  },
  {
    id: '6',
    name: 'Louraine Mercado',
    email: 'louraine33@pupqc.edu.ph',
    role: 'student',
    department: 'Engineering',
    studentId: '2021-54321',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=juan',
    createdAt: randomDate(),
  },
];

// Mock departments data
export const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Computer Science',
    description: 'Department of Computer Science',
    head: 'Dr. Computer Science Head',
    members: 15,
    createdAt: randomDate(),
  },
  {
    id: '2',
    name: 'Information Technology',
    description: 'Department of Information Technology',
    head: 'Dr. IT Head',
    members: 18,
    createdAt: randomDate(),
  },
  {
    id: '3',
    name: 'Business Administration',
    description: 'College of Business Administration',
    head: 'Dr. Business Admin Head',
    members: 20,
    createdAt: randomDate(),
  },
  {
    id: '4',
    name: 'Engineering',
    description: 'College of Engineering',
    head: 'Dr. Engineering Head',
    members: 25,
    createdAt: randomDate(),
  },
  {
    id: '5',
    name: 'Arts and Sciences',
    description: 'College of Arts and Sciences',
    head: 'Dr. Arts Head',
    members: 30,
    createdAt: randomDate(),
  },
];

// Generate mock comments
const generateComments = (ticketId: string, count: number): TicketComment[] => {
  const comments = [];
  for (let i = 0; i < count; i++) {
    const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    comments.push({
      id: `comment-${ticketId}-${i}`,
      ticketId,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      userAvatar: user.avatar,
      content: `This is a sample comment ${i + 1} on ticket ${ticketId}. ${
        Math.random() > 0.5
          ? 'We are working on resolving this issue as soon as possible.'
          : 'Could you provide more information about this issue?'
      }`,
      createdAt: randomDate(),
      isInternal: Math.random() > 0.7, // 30% chance of being internal
    });
  }
  return comments.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
};

// Generate mock tickets
export const generateMockTickets = (count: number): Ticket[] => {
  const ticketTitles = [
    'Unable to access student portal',
    'Registration system error',
    'Library access card not working',
    'Cannot view grades online',
    'Issue with course enrollment',
    'Problem with student email',
    'WiFi connectivity issues in Building A',
    'Computer lab software error',
    'ID verification problem',
    'Payment portal not accepting transactions',
    'Course materials not available',
    'Account login issues',
  ];
  
  const ticketDescriptions = [
    'I am unable to log in to the student portal using my credentials. The system shows an error message.',
    'The registration system crashed while I was selecting courses for the next semester.',
    'My library access card is not being recognized by the scanner at the entrance.',
    'When I try to view my grades for the previous semester, the page shows an error.',
    'I am unable to enroll in the required courses for my program.',
    'My student email account is not receiving any messages for the past two days.',
    'The WiFi connection in Building A is very slow and frequently disconnects.',
    'The software in Computer Lab 3 is not functioning correctly for my project work.',
    'The system is not recognizing my student ID for verification purposes.',
    'I am trying to pay my tuition fee but the payment portal keeps rejecting my transaction.',
    'The course materials for CS101 are not available on the learning platform.',
    'I keep getting locked out of my account after multiple login attempts.',
  ];
  
  const statuses: TicketStatus[] = ['open', 'in_progress', 'on_hold', 'resolved', 'closed'];
  const priorities: TicketPriority[] = ['low', 'medium', 'high', 'urgent'];
  
  const tickets = [];
  for (let i = 0; i < count; i++) {
    const titleIndex = Math.floor(Math.random() * ticketTitles.length);
    const creator = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    
    // Sometimes assign tickets, sometimes leave unassigned
    let assignedTo, assigneeName, assigneeAvatar;
    if (Math.random() > 0.3) { // 70% chance of being assigned
      const assignee = mockUsers.filter(u => u.role === 'admin' || u.role === 'faculty')[
        Math.floor(Math.random() * Math.min(2, mockUsers.length))
      ];
      assignedTo = assignee.id;
      assigneeName = assignee.name;
      assigneeAvatar = assignee.avatar;
    }
    
    const createdAt = randomDate();
    const updatedAt = new Date(new Date(createdAt).getTime() + Math.random() * 86400000).toISOString();
    
    const ticket: Ticket = {
      id: `ticket-${i + 1}`,
      title: ticketTitles[titleIndex],
      description: ticketDescriptions[titleIndex],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      createdBy: creator.id,
      creatorName: creator.name,
      creatorAvatar: creator.avatar,
      creatorRole: creator.role,
      assignedTo,
      assigneeName,
      assigneeAvatar,
      department: Math.random() > 0.5 ? mockDepartments[Math.floor(Math.random() * mockDepartments.length)].name : undefined,
      createdAt,
      updatedAt,
      comments: generateComments(`ticket-${i + 1}`, Math.floor(Math.random() * 5)),
    };
    
    tickets.push(ticket);
  }
  
  return tickets;
};

// Export mock tickets
export const mockTickets = generateMockTickets(30);
