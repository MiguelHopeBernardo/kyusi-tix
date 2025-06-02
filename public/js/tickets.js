
// Tickets page JavaScript

// Tickets page variables
let filteredTickets = [];
let currentFilters = {
    status: '',
    priority: '',
    department: '',
    search: ''
};

// Initialize tickets page
document.addEventListener('DOMContentLoaded', function() {
    loadTickets();
    initializeFilters();
    initializeBulkActions();
});

// Load and display tickets
function loadTickets() {
    showLoading('ticketsTable', 'Loading tickets...');
    
    // Apply current filters
    filteredTickets = filterTickets(tickets, currentFilters);
    
    // Sort by creation date (newest first)
    filteredTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Paginate results
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageTickets = filteredTickets.slice(startIndex, endIndex);
    
    setTimeout(() => {
        renderTicketsTable(pageTickets);
        generatePagination(filteredTickets.length, currentPage, itemsPerPage, 'pagination');
    }, 500);
}

// Render tickets table
function renderTicketsTable(ticketsToRender) {
    const tableBody = document.getElementById('ticketsTable');
    if (!tableBody) return;

    if (ticketsToRender.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center py-4">
                    <div class="text-muted">
                        <i class="bi bi-inbox display-4 d-block mb-2"></i>
                        <p>No tickets found</p>
                        ${Object.values(currentFilters).some(filter => filter) ? 
                            '<button class="btn btn-outline-primary" onclick="clearFilters()">Clear Filters</button>' :
                            '<a href="create-ticket.html" class="btn btn-primary">Create Your First Ticket</a>'
                        }
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    const ticketsHtml = ticketsToRender.map((ticket, index) => `
        <tr class="fade-in" style="animation-delay: ${index * 0.05}s">
            <td>
                <input type="checkbox" class="form-check-input ticket-checkbox" value="${ticket.id}">
            </td>
            <td>
                <span class="badge bg-secondary">#${ticket.id}</span>
            </td>
            <td>
                <div>
                    <a href="ticket-detail.html?id=${ticket.id}" class="text-decoration-none fw-medium">
                        ${ticket.subject}
                    </a>
                    <br>
                    <small class="text-muted">
                        <i class="bi bi-chat-dots me-1"></i>${ticket.comments}
                        <i class="bi bi-paperclip ms-2 me-1"></i>${ticket.attachments}
                    </small>
                </div>
            </td>
            <td>${getStatusBadge(ticket.status)}</td>
            <td>${getPriorityBadge(ticket.priority)}</td>
            <td>
                <span class="badge bg-light text-dark">${ticket.department || 'Unassigned'}</span>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    ${getUserAvatar(ticket.createdBy)}
                    <span class="ms-2">${ticket.createdBy}</span>
                </div>
            </td>
            <td>
                ${ticket.assignedTo ? `
                    <div class="d-flex align-items-center">
                        ${getUserAvatar(ticket.assignedTo)}
                        <span class="ms-2">${ticket.assignedTo}</span>
                    </div>
                ` : '<span class="text-muted">Unassigned</span>'}
            </td>
            <td>
                <small title="${formatDate(ticket.createdAt)}">
                    ${formatRelativeTime(ticket.createdAt)}
                </small>
            </td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <a href="ticket-detail.html?id=${ticket.id}" class="btn btn-outline-primary btn-sm" title="View">
                        <i class="bi bi-eye"></i>
                    </a>
                    <div class="dropdown">
                        <button class="btn btn-outline-secondary btn-sm dropdown-toggle" data-bs-toggle="dropdown" title="More actions">
                            <i class="bi bi-three-dots"></i>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="ticket-detail.html?id=${ticket.id}">
                                <i class="bi bi-eye me-2"></i>View Details
                            </a></li>
                            <li><a class="dropdown-item" href="#" onclick="editTicket(${ticket.id})">
                                <i class="bi bi-pencil me-2"></i>Edit
                            </a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="#" onclick="assignTicket(${ticket.id})">
                                <i class="bi bi-person-plus me-2"></i>Assign
                            </a></li>
                            <li><a class="dropdown-item" href="#" onclick="changeStatus(${ticket.id})">
                                <i class="bi bi-arrow-repeat me-2"></i>Change Status
                            </a></li>
                            ${ticket.status !== 'closed' ? `
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item text-danger" href="#" onclick="closeTicket(${ticket.id})">
                                    <i class="bi bi-x-circle me-2"></i>Close Ticket
                                </a></li>
                            ` : ''}
                        </ul>
                    </div>
                </div>
            </td>
        </tr>
    `).join('');

    tableBody.innerHTML = ticketsHtml;
}

// Initialize filters
function initializeFilters() {
    // Add event listeners to filter elements
    const filterElements = ['statusFilter', 'priorityFilter', 'departmentFilter', 'searchInput'];
    
    filterElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener('change', applyFilters);
            if (elementId === 'searchInput') {
                element.addEventListener('input', debounce(applyFilters, 300));
            }
        }
    });

    // Enter key on search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                applyFilters();
            }
        });
    }
}

// Apply filters
function applyFilters() {
    // Get filter values
    currentFilters = {
        status: document.getElementById('statusFilter')?.value || '',
        priority: document.getElementById('priorityFilter')?.value || '',
        department: document.getElementById('departmentFilter')?.value || '',
        search: document.getElementById('searchInput')?.value || ''
    };

    // Reset to first page
    currentPage = 1;
    
    // Reload tickets with filters
    loadTickets();
    
    // Update filter summary
    updateFilterSummary();
}

// Clear all filters
function clearFilters() {
    // Reset filter inputs
    document.getElementById('statusFilter').value = '';
    document.getElementById('priorityFilter').value = '';
    document.getElementById('departmentFilter').value = '';
    document.getElementById('searchInput').value = '';
    
    // Reset filters object
    currentFilters = {
        status: '',
        priority: '',
        department: '',
        search: ''
    };
    
    // Reset to first page
    currentPage = 1;
    
    // Reload tickets
    loadTickets();
    
    // Update filter summary
    updateFilterSummary();
    
    showToast('Filters cleared', 'info');
}

// Update filter summary
function updateFilterSummary() {
    const activeFilters = Object.entries(currentFilters).filter(([key, value]) => value);
    
    if (activeFilters.length > 0) {
        const summary = activeFilters.map(([key, value]) => {
            const label = key.charAt(0).toUpperCase() + key.slice(1);
            return `${label}: ${value}`;
        }).join(', ');
        
        // You could add a filter summary element to show active filters
        console.log('Active filters:', summary);
    }
}

// Search tickets
function searchTickets() {
    applyFilters();
}

// Refresh tickets
function refreshTickets() {
    showToast('Refreshing tickets...', 'info');
    
    // Simulate data refresh
    setTimeout(() => {
        loadTickets();
        showToast('Tickets refreshed!', 'success');
    }, 1000);
}

// Change page
function changePage(page) {
    currentPage = page;
    loadTickets();
    
    // Scroll to top of table
    document.getElementById('ticketsTable').scrollIntoView({ behavior: 'smooth' });
}

// Initialize bulk actions
function initializeBulkActions() {
    // Select all checkbox
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const ticketCheckboxes = document.querySelectorAll('.ticket-checkbox');
            ticketCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateBulkActionsVisibility();
        });
    }
    
    // Individual checkboxes
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('ticket-checkbox')) {
            updateSelectAllState();
            updateBulkActionsVisibility();
        }
    });
}

// Update select all checkbox state
function updateSelectAllState() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const ticketCheckboxes = document.querySelectorAll('.ticket-checkbox');
    const checkedBoxes = document.querySelectorAll('.ticket-checkbox:checked');
    
    if (checkedBoxes.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (checkedBoxes.length === ticketCheckboxes.length) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    }
}

// Update bulk actions visibility
function updateBulkActionsVisibility() {
    const checkedBoxes = document.querySelectorAll('.ticket-checkbox:checked');
    // You can add bulk actions toolbar here
    console.log(`${checkedBoxes.length} tickets selected`);
}

// Ticket actions
function editTicket(ticketId) {
    window.location.href = `edit-ticket.html?id=${ticketId}`;
}

function assignTicket(ticketId) {
    // Show assign modal
    showToast('Assign ticket functionality would be implemented here', 'info');
}

function changeStatus(ticketId) {
    // Show status change modal
    showToast('Change status functionality would be implemented here', 'info');
}

function closeTicket(ticketId) {
    if (confirm('Are you sure you want to close this ticket?')) {
        const ticket = tickets.find(t => t.id === ticketId);
        if (ticket) {
            ticket.status = 'closed';
            ticket.updatedAt = new Date().toISOString();
            loadTickets();
            showToast(`Ticket #${ticketId} has been closed`, 'success');
        }
    }
}

// Export tickets
function exportTickets() {
    const dataToExport = filteredTickets.map(ticket => ({
        ID: ticket.id,
        Subject: ticket.subject,
        Status: ticket.status,
        Priority: ticket.priority,
        Department: ticket.department,
        'Created By': ticket.createdBy,
        'Assigned To': ticket.assignedTo || 'Unassigned',
        'Created At': formatDate(ticket.createdAt),
        'Updated At': formatDate(ticket.updatedAt)
    }));

    const csv = convertToCSV(dataToExport);
    downloadCSV(csv, `tickets-export-${new Date().toISOString().split('T')[0]}.csv`);
    
    showToast('Tickets exported successfully!', 'success');
}

// Bulk actions
function bulkActions() {
    const checkedBoxes = document.querySelectorAll('.ticket-checkbox:checked');
    if (checkedBoxes.length === 0) {
        showToast('Please select tickets to perform bulk actions', 'warning');
        return;
    }
    
    showToast('Bulk actions functionality would be implemented here', 'info');
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function convertToCSV(data) {
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    return csvContent;
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}
