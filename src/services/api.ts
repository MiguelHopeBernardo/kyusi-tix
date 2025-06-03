
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper function to get CSRF token
const getCSRFToken = (): string => {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='));
  return token ? token.split('=')[1] : '';
};

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken(),
    },
    credentials: 'include', // Include cookies for authentication
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  const response = await fetch(url, mergedOptions);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  // Handle CSV download
  if (response.headers.get('content-type')?.includes('text/csv')) {
    return response.blob();
  }

  return response.json();
};

// Ticket API endpoints
export const ticketAPI = {
  // Get tickets with filtering and pagination
  getTickets: (params: {
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
    return apiRequest(`/tickets/api/tickets/?${queryParams}`);
  },

  // Get ticket statistics
  getTicketStats: () => apiRequest('/tickets/api/tickets/stats/'),

  // Get specific ticket details
  getTicket: (id: string) => apiRequest(`/tickets/api/tickets/${id}/`),

  // Create new ticket
  createTicket: (ticketData: {
    subject: string;
    description: string;
    priority: string;
    department?: string;
  }) => apiRequest('/tickets/api/tickets/submit/', {
    method: 'POST',
    body: JSON.stringify(ticketData),
  }),

  // Update ticket status
  updateTicketStatus: (id: string, status: string) => 
    apiRequest(`/tickets/api/tickets/${id}/status/`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  // Assign ticket
  assignTicket: (id: string, assigneeId: string | null) =>
    apiRequest(`/tickets/api/tickets/${id}/assign/`, {
      method: 'POST',
      body: JSON.stringify({ assignee_id: assigneeId }),
    }),

  // Add comment to ticket
  addComment: (id: string, content: string, isInternal: boolean = false) =>
    apiRequest(`/tickets/api/tickets/${id}/comment/`, {
      method: 'POST',
      body: JSON.stringify({ content, is_internal: isInternal }),
    }),

  // Bulk update tickets
  bulkUpdate: (ticketIds: string[], action: string, assigneeId?: string) =>
    apiRequest('/tickets/api/tickets/bulk-update/', {
      method: 'POST',
      body: JSON.stringify({ 
        ticket_ids: ticketIds, 
        action, 
        assignee_id: assigneeId 
      }),
    }),

  // Search tickets
  searchTickets: (query: string) => 
    apiRequest(`/tickets/api/tickets/search/?q=${encodeURIComponent(query)}`),

  // Export tickets
  exportTickets: async () => {
    const blob = await apiRequest('/tickets/api/tickets/export/');
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // Re-route ticket (admin only)
  rerouteTicket: (id: string) =>
    apiRequest(`/tickets/${id}/reroute/`, {
      method: 'POST',
    }),
};

// Department API endpoints
export const departmentAPI = {
  getDepartments: () => apiRequest('/tickets/api/departments/'),
};

// User API endpoints
export const userAPI = {
  getUsers: () => apiRequest('/tickets/api/users/'),
};

// Authentication endpoints (if you have Django auth endpoints)
export const authAPI = {
  login: (username: string, password: string) =>
    apiRequest('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  logout: () => apiRequest('/auth/logout/', { method: 'POST' }),

  getCurrentUser: () => apiRequest('/auth/user/'),
};

export default {
  ticketAPI,
  departmentAPI,
  userAPI,
  authAPI,
};
