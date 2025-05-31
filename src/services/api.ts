
// API configuration and service functions
const API_BASE_URL = 'http://127.0.0.1:8000'; // Django development server

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  login: '/login/',
  logout: '/logout/',
  
  // Tickets
  tickets: '/tickets/api/tickets/',
  ticketStats: '/tickets/api/tickets/stats/',
  ticketSearch: '/tickets/api/tickets/search/',
  submitTicket: '/tickets/api/tickets/submit/',
  bulkUpdateTickets: '/tickets/api/tickets/bulk-update/',
  ticketDetail: (id: string) => `/tickets/api/tickets/${id}/`,
  addComment: (id: string) => `/tickets/api/tickets/${id}/comment/`,
  updateTicketStatus: (id: string) => `/tickets/api/tickets/${id}/status/`,
  assignTicket: (id: string) => `/tickets/api/tickets/${id}/assign/`,
  
  // Users
  users: '/users/',
  profile: '/users/profile/',
  register: '/users/register/',
};

// Helper function to get CSRF token from Django
export const getCSRFToken = async (): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/admin/`, {
    credentials: 'include',
  });
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('csrftoken='));
  return csrfCookie ? csrfCookie.split('=')[1] : '';
};

// API request helper with authentication
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const csrfToken = await getCSRFToken();
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'X-CSRFToken': csrfToken,
  };

  const config: RequestInit = {
    credentials: 'include', // Include cookies for Django session authentication
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  return response;
};

// Specific API functions
export const ticketService = {
  // Get all tickets with filtering
  getTickets: async (params: {
    status?: string;
    priority?: string;
    department?: string;
    assigned_to_me?: boolean;
    my_tickets?: boolean;
    page?: number;
    per_page?: number;
  } = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    const response = await apiRequest(`${API_ENDPOINTS.tickets}?${queryParams}`);
    return response.json();
  },

  // Get ticket statistics
  getTicketStats: async () => {
    const response = await apiRequest(API_ENDPOINTS.ticketStats);
    return response.json();
  },

  // Search tickets
  searchTickets: async (query: string) => {
    const response = await apiRequest(`${API_ENDPOINTS.ticketSearch}?q=${encodeURIComponent(query)}`);
    return response.json();
  },

  // Submit new ticket
  submitTicket: async (ticketData: {
    subject: string;
    description: string;
    priority: string;
    department?: string;
  }) => {
    const response = await apiRequest(API_ENDPOINTS.submitTicket, {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
    return response.json();
  },

  // Get ticket details
  getTicketDetail: async (ticketId: string) => {
    const response = await apiRequest(API_ENDPOINTS.ticketDetail(ticketId));
    return response.json();
  },

  // Add comment to ticket
  addComment: async (ticketId: string, content: string, isInternal = false) => {
    const response = await apiRequest(API_ENDPOINTS.addComment(ticketId), {
      method: 'POST',
      body: JSON.stringify({ content, is_internal: isInternal }),
    });
    return response.json();
  },

  // Update ticket status
  updateStatus: async (ticketId: string, status: string) => {
    const response = await apiRequest(API_ENDPOINTS.updateTicketStatus(ticketId), {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
    return response.json();
  },

  // Assign ticket
  assignTicket: async (ticketId: string, assigneeId?: string) => {
    const response = await apiRequest(API_ENDPOINTS.assignTicket(ticketId), {
      method: 'POST',
      body: JSON.stringify({ assignee_id: assigneeId }),
    });
    return response.json();
  },
};

export const authService = {
  // Login user
  login: async (username: string, password: string) => {
    const response = await apiRequest(API_ENDPOINTS.login, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  },

  // Logout user
  logout: async () => {
    const response = await apiRequest(API_ENDPOINTS.logout, {
      method: 'POST',
    });
    return response.ok;
  },
};
