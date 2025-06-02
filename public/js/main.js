// KyusiTix Main JavaScript Functions

// Global variables
let currentUser = {
    id: 1,
    name: 'Admin User',
    role: 'admin',
    department: 'IT'
};

let tickets = [];
let users = [];
let currentPage = 1;
let itemsPerPage = 20;

// API Configuration
const API_BASE_URL = '/api'; // Django API base URL
const CSRF_TOKEN = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

// API Helper Functions
async function apiRequest(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': CSRF_TOKEN || '',
        },
        credentials: 'include', // Include cookies for Django session auth
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };
    
    try {
        const response = await fetch(url, mergedOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        return await response.text();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// API Functions
async function fetchTickets(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.department) params.append('department', filters.department);
    if (filters.page) params.append('page', filters.page);
    if (filters.per_page) params.append('per_page', filters.per_page);
    
    const url = `${API_BASE_URL}/tickets/api/tickets/?${params.toString()}`;
    return await apiRequest(url);
}

async function fetchTicketStats() {
    const url = `${API_BASE_URL}/tickets/api/tickets/stats/`;
    return await apiRequest(url);
}

async function fetchTicketDetail(ticketId) {
    const url = `${API_BASE_URL}/tickets/api/tickets/${ticketId}/`;
    return await apiRequest(url);
}

async function createTicket(ticketData) {
    const url = `${API_BASE_URL}/tickets/api/tickets/submit/`;
    return await apiRequest(url, {
        method: 'POST',
        body: JSON.stringify(ticketData),
    });
}

async function addComment(ticketId, commentData) {
    const url = `${API_BASE_URL}/tickets/api/tickets/${ticketId}/comment/`;
    return await apiRequest(url, {
        method: 'POST',
        body: JSON.stringify(commentData),
    });
}

async function updateTicketStatus(ticketId, status) {
    const url = `${API_BASE_URL}/tickets/api/tickets/${ticketId}/status/`;
    return await apiRequest(url, {
        method: 'POST',
        body: JSON.stringify({ status }),
    });
}

async function assignTicket(ticketId, assigneeId) {
    const url = `${API_BASE_URL}/tickets/api/tickets/${ticketId}/assign/`;
    return await apiRequest(url, {
        method: 'POST',
        body: JSON.stringify({ assignee_id: assigneeId }),
    });
}

async function searchTickets(query) {
    const url = `${API_BASE_URL}/tickets/api/tickets/search/?q=${encodeURIComponent(query)}`;
    return await apiRequest(url);
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return formatDate(dateString);
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getStatusBadge(status) {
    const statusMap = {
        'open': { class: 'bg-danger', text: 'Open' },
        'in_progress': { class: 'bg-warning text-dark', text: 'In Progress' },
        'on_hold': { class: 'bg-secondary', text: 'On Hold' },
        'resolved': { class: 'bg-success', text: 'Resolved' },
        'closed': { class: 'bg-info text-dark', text: 'Closed' }
    };
    
    const statusInfo = statusMap[status] || { class: 'bg-secondary', text: status };
    return `<span class="badge ${statusInfo.class}">${statusInfo.text}</span>`;
}

function getPriorityBadge(priority) {
    const priorityMap = {
        'low': { class: 'bg-secondary', text: 'Low' },
        'medium': { class: 'bg-info text-dark', text: 'Medium' },
        'high': { class: 'bg-warning text-dark', text: 'High' },
        'urgent': { class: 'bg-danger', text: 'Urgent' }
    };
    
    const priorityInfo = priorityMap[priority] || { class: 'bg-secondary', text: priority };
    return `<span class="badge ${priorityInfo.class}">${priorityInfo.text}</span>`;
}

function getUserAvatar(userName) {
    const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
    return `<div class="user-avatar">${initials}</div>`;
}

// Toast Notifications
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '1055';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <i class="bi bi-${getToastIcon(type)} me-2 text-${type}"></i>
                <strong class="me-auto">KyusiTix</strong>
                <small>now</small>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    // Show toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();

    // Remove toast from DOM after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

function getToastIcon(type) {
    const iconMap = {
        'success': 'check-circle',
        'danger': 'exclamation-triangle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle',
        'primary': 'info-circle'
    };
    return iconMap[type] || 'info-circle';
}

// Loading States
function showLoading(elementId, message = 'Loading...') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2 text-muted">${message}</p>
            </div>
        `;
    }
}

function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '';
    }
}

// API Mock Functions
function generateMockTickets() {
    const subjects = [
        'Cannot access my student portal account',
        'Grade inquiry for CMSC 123',
        'Password reset request',
        'Enrollment system error',
        'Payment processing issue',
        'Certificate request',
        'WiFi connection problems',
        'Printer not working in library',
        'Course schedule conflict',
        'Transcript request'
    ];

    const descriptions = [
        'I am unable to login to my student account. The system shows an error message.',
        'I need clarification on my grade for the recent exam in CMSC 123.',
        'I forgot my password and the reset link is not working.',
        'The enrollment system crashes when I try to add subjects.',
        'My payment was processed but not reflected in the system.',
        'I need to request my certificate of enrollment.',
        'The WiFi in the computer lab keeps disconnecting.',
        'The printer in the library is showing paper jam error.',
        'My schedule shows two subjects at the same time slot.',
        'I need my official transcript for job application.'
    ];

    const departments = ['IT', 'Academic Affairs', 'Registrar', 'Finance', 'Student Affairs'];
    const users_list = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'Admin User'];
    const statuses = ['open', 'in_progress', 'on_hold', 'resolved', 'closed'];
    const priorities = ['low', 'medium', 'high', 'urgent'];

    tickets = [];
    for (let i = 1; i <= 50; i++) {
        const createdDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        tickets.push({
            id: i,
            subject: subjects[Math.floor(Math.random() * subjects.length)],
            description: descriptions[Math.floor(Math.random() * descriptions.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            priority: priorities[Math.floor(Math.random() * priorities.length)],
            department: departments[Math.floor(Math.random() * departments.length)],
            createdBy: users_list[Math.floor(Math.random() * users_list.length)],
            assignedTo: Math.random() > 0.3 ? users_list[Math.floor(Math.random() * users_list.length)] : null,
            createdAt: createdDate.toISOString(),
            updatedAt: new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            comments: Math.floor(Math.random() * 5),
            attachments: Math.floor(Math.random() * 3)
        });
    }
}

// Initialize mock data
generateMockTickets();

// File Upload Utilities
function handleFileUpload(inputElement, previewElementId) {
    const files = Array.from(inputElement.files);
    const previewContainer = document.getElementById(previewElementId);
    
    if (files.length > 0) {
        previewContainer.classList.remove('d-none');
        const fileList = previewContainer.querySelector('#fileList') || previewContainer;
        fileList.innerHTML = '';
        
        files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item d-flex align-items-center justify-content-between mb-2 p-2 border rounded';
            
            const fileInfo = document.createElement('div');
            fileInfo.innerHTML = `
                <i class="bi bi-${getFileIcon(file.type)} me-2"></i>
                <span class="fw-medium">${file.name}</span>
                <small class="text-muted ms-2">(${formatFileSize(file.size)})</small>
            `;
            
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'btn btn-sm btn-outline-danger';
            removeBtn.innerHTML = '<i class="bi bi-x"></i>';
            removeBtn.onclick = () => removeFile(inputElement, index, previewElementId);
            
            fileItem.appendChild(fileInfo);
            fileItem.appendChild(removeBtn);
            fileList.appendChild(fileItem);
        });
    } else {
        previewContainer.classList.add('d-none');
    }
}

function getFileIcon(fileType) {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType === 'application/pdf') return 'file-pdf';
    if (fileType.includes('word')) return 'file-word';
    if (fileType.includes('excel')) return 'file-excel';
    return 'file-text';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function removeFile(inputElement, fileIndex, previewElementId) {
    const dt = new DataTransfer();
    const files = Array.from(inputElement.files);
    
    files.forEach((file, index) => {
        if (index !== fileIndex) {
            dt.items.add(file);
        }
    });
    
    inputElement.files = dt.files;
    handleFileUpload(inputElement, previewElementId);
}

// Local Storage Utilities
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadFromLocalStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return defaultValue;
    }
}

// Search and Filter Utilities
function searchInText(searchTerm, text) {
    if (!searchTerm) return true;
    return text.toLowerCase().includes(searchTerm.toLowerCase());
}

function filterTickets(tickets, filters) {
    return tickets.filter(ticket => {
        // Status filter
        if (filters.status && ticket.status !== filters.status) return false;
        
        // Priority filter
        if (filters.priority && ticket.priority !== filters.priority) return false;
        
        // Department filter
        if (filters.department && ticket.department !== filters.department) return false;
        
        // Search filter
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            const searchableText = `${ticket.subject} ${ticket.description} ${ticket.created_by}`.toLowerCase();
            if (!searchableText.includes(searchTerm)) return false;
        }
        
        return true;
    });
}

// Pagination Utilities
function generatePagination(totalItems, currentPage, itemsPerPage, containerId) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.getElementById(containerId);
    
    if (!paginationContainer || totalPages <= 1) {
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHtml = '';
    
    // Previous button
    paginationHtml += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">
                <i class="bi bi-chevron-left"></i>
            </a>
        </li>
    `;
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        paginationHtml += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changePage(1); return false;">1</a>
            </li>
        `;
        if (startPage > 2) {
            paginationHtml += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHtml += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
            </li>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHtml += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
        paginationHtml += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changePage(${totalPages}); return false;">${totalPages}</a>
            </li>
        `;
    }
    
    // Next button
    paginationHtml += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">
                <i class="bi bi-chevron-right"></i>
            </a>
        </li>
    `;
    
    paginationContainer.innerHTML = paginationHtml;
}

// Initialize common functionality
document.addEventListener('DOMContentLoaded', function() {
    // Set current user in navigation
    const currentUserElements = document.querySelectorAll('#currentUser');
    currentUserElements.forEach(element => {
        element.textContent = currentUser.name;
    });
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function(popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
});
