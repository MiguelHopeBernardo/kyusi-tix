// Dashboard specific JavaScript

// Dashboard variables
let dashboardStats = {
    open: 0,
    in_progress: 0,
    resolved: 0,
    total: 0
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardStats();
    loadRecentTickets();
});

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        showLoading('openTickets', '');
        showLoading('inProgressTickets', '');
        showLoading('resolvedTickets', '');
        showLoading('totalTickets', '');
        
        const stats = await fetchTicketStats();
        dashboardStats = stats;
        
        // Update UI
        updateStatsDisplay();
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showToast('Failed to load dashboard statistics', 'danger');
    }
}

// Update statistics display
function updateStatsDisplay() {
    const elements = {
        'openTickets': dashboardStats.open,
        'inProgressTickets': dashboardStats.in_progress,
        'resolvedTickets': dashboardStats.resolved,
        'totalTickets': dashboardStats.total
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            // Animate number change
            animateNumber(element, 0, value, 1000);
        }
    });
}

// Animate number counting
function animateNumber(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16); // 60fps
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Load recent tickets
async function loadRecentTickets() {
    const tableBody = document.getElementById('recentTicketsTable');
    if (!tableBody) return;

    // Show loading state
    showLoading('recentTicketsTable', 'Loading recent tickets...');

    try {
        const response = await fetchTickets({ page: 1, per_page: 10 });
        const recentTickets = response.tickets;

        if (recentTickets.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <div class="text-muted">
                            <i class="bi bi-inbox display-4 d-block mb-2"></i>
                            <p>No tickets found</p>
                            <a href="create-ticket.html" class="btn btn-primary">Create Your First Ticket</a>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Render tickets
        const ticketsHtml = recentTickets.map((ticket, index) => `
            <tr class="fade-in" style="animation-delay: ${index * 0.05}s">
                <td>
                    <span class="badge bg-secondary">#${ticket.id}</span>
                </td>
                <td>
                    <a href="ticket-detail.html?id=${ticket.id}" class="text-decoration-none fw-medium">
                        ${ticket.subject}
                    </a>
                    <br>
                    <small class="text-muted">by ${ticket.created_by}</small>
                </td>
                <td>${getStatusBadge(ticket.status)}</td>
                <td>${getPriorityBadge(ticket.priority)}</td>
                <td>
                    <small>${formatRelativeTime(ticket.created_at)}</small>
                </td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <a href="ticket-detail.html?id=${ticket.id}" class="btn btn-outline-primary btn-sm" title="View">
                            <i class="bi bi-eye"></i>
                        </a>
                        ${ticket.status !== 'closed' ? `
                            <button class="btn btn-outline-secondary btn-sm" onclick="quickUpdate(${ticket.id})" title="Quick Update">
                                <i class="bi bi-pencil"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');

        tableBody.innerHTML = ticketsHtml;
    } catch (error) {
        console.error('Error loading recent tickets:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <div class="text-danger">
                        <i class="bi bi-exclamation-triangle display-4 d-block mb-2"></i>
                        <p>Failed to load tickets</p>
                        <button class="btn btn-outline-primary" onclick="loadRecentTickets()">Try Again</button>
                    </div>
                </td>
            </tr>
        `;
        showToast('Failed to load recent tickets', 'danger');
    }
}

// Quick update ticket status
async function quickUpdate(ticketId) {
    try {
        const ticket = await fetchTicketDetail(ticketId);
        const nextStatus = getNextStatus(ticket.status);
        
        if (!nextStatus) {
            showToast('No more status updates available for this ticket.', 'info');
            return;
        }

        // Show confirmation modal
        const modalHtml = `
            <div class="modal fade" id="quickUpdateModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Quick Update Ticket #${ticket.id}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>Update ticket status from <strong>${ticket.status}</strong> to <strong>${nextStatus}</strong>?</p>
                            <div class="alert alert-info">
                                <i class="bi bi-info-circle me-2"></i>
                                <strong>${ticket.subject}</strong>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="confirmQuickUpdate(${ticket.id}, '${nextStatus}')">
                                Update Status
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('quickUpdateModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('quickUpdateModal'));
        modal.show();
    } catch (error) {
        console.error('Error fetching ticket details:', error);
        showToast('Failed to load ticket details', 'danger');
    }
}

// Get next logical status
function getNextStatus(currentStatus) {
    const statusFlow = {
        'open': 'in_progress',
        'in_progress': 'resolved',
        'on_hold': 'in_progress',
        'resolved': 'closed',
        'closed': null
    };
    return statusFlow[currentStatus];
}

// Confirm quick update
async function confirmQuickUpdate(ticketId, newStatus) {
    try {
        await updateTicketStatus(ticketId, newStatus);

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('quickUpdateModal'));
        modal.hide();

        // Show success message
        showToast(`Ticket #${ticketId} status updated to ${newStatus}`, 'success');

        // Refresh dashboard
        setTimeout(() => {
            loadDashboardStats();
            loadRecentTickets();
        }, 500);
    } catch (error) {
        console.error('Error updating ticket status:', error);
        showToast('Failed to update ticket status', 'danger');
    }
}

// Refresh statistics
function refreshStats() {
    showToast('Refreshing statistics...', 'info');
    
    // Add some animation to the stats cards
    const statsCards = document.querySelectorAll('.card-body .display-6');
    statsCards.forEach(card => {
        card.style.transform = 'scale(1.1)';
        card.style.transition = 'transform 0.3s ease';
        setTimeout(() => {
            card.style.transform = 'scale(1)';
        }, 300);
    });

    setTimeout(() => {
        loadDashboardStats();
        showToast('Statistics updated!', 'success');
    }, 1000);
}

// Export dashboard data
function exportDashboard() {
    const data = {
        stats: dashboardStats,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Dashboard data exported successfully!', 'success');
}

// Auto-refresh dashboard every 5 minutes
setInterval(() => {
    loadDashboardStats();
    loadRecentTickets();
}, 5 * 60 * 1000);
