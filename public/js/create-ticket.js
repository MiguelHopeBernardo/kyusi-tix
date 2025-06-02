// Create Ticket page JavaScript

// Form validation rules
const validationRules = {
    subject: {
        required: true,
        minLength: 5,
        maxLength: 255
    },
    description: {
        required: true,
        minLength: 10,
        maxLength: 2000
    },
    priority: {
        required: true
    }
};

// Initialize create ticket page
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    loadDepartmentUsers();
    setupFileUpload();
    loadDraftData();
});

// Initialize form functionality
function initializeForm() {
    const form = document.getElementById('createTicketForm');
    if (!form) return;

    // Form submission
    form.addEventListener('submit', handleFormSubmit);

    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });

    // Department change handler
    const departmentSelect = document.getElementById('department');
    if (departmentSelect) {
        departmentSelect.addEventListener('change', updateAssigneeOptions);
    }

    // Auto-save draft
    inputs.forEach(input => {
        input.addEventListener('input', debounce(saveDraftData, 1000));
    });
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        showToast('Please fix the errors in the form', 'danger');
        return;
    }

    const formData = getFormData();
    await submitTicket(formData);
}

// Get form data
function getFormData() {
    return {
        subject: document.getElementById('subject').value.trim(),
        description: document.getElementById('description').value.trim(),
        priority: document.getElementById('priority').value,
        department: document.getElementById('department').value,
        assignedTo: document.getElementById('assignedTo').value,
        attachments: Array.from(document.getElementById('attachments').files)
    };
}

// Validate entire form
function validateForm() {
    let isValid = true;
    const form = document.getElementById('createTicketForm');
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Validate individual field
function validateField(field) {
    const fieldName = field.id;
    const value = field.value.trim();
    const rules = validationRules[fieldName];
    
    if (!rules) return true;
    
    // Clear previous errors
    clearFieldError(field);
    
    // Required validation
    if (rules.required && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Min length validation
    if (rules.minLength && value.length < rules.minLength) {
        showFieldError(field, `Minimum ${rules.minLength} characters required`);
        return false;
    }
    
    // Max length validation
    if (rules.maxLength && value.length > rules.maxLength) {
        showFieldError(field, `Maximum ${rules.maxLength} characters allowed`);
        return false;
    }
    
    return true;
}

// Show field error
function showFieldError(field, message) {
    field.classList.add('is-invalid');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.invalid-feedback');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

// Clear field error
function clearFieldError(field) {
    field.classList.remove('is-invalid');
    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Submit ticket
async function submitTicket(formData) {
    // Show loading state
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>Creating...';
    submitBtn.disabled = true;

    try {
        // Create ticket via API
        const response = await createTicket({
            subject: formData.subject,
            description: formData.description,
            priority: formData.priority,
            department: formData.department
        });

        // Clear draft data
        clearDraftData();

        // Show success message
        showToast('Ticket created successfully!', 'success');

        // Redirect to ticket details
        setTimeout(() => {
            window.location.href = `ticket-detail.html?id=${response.ticket_id}`;
        }, 1500);

    } catch (error) {
        console.error('Error creating ticket:', error);
        showToast('Failed to create ticket. Please try again.', 'danger');
        
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Auto-assign department based on keywords
function autoAssignDepartment(formData) {
    const text = `${formData.subject} ${formData.description}`.toLowerCase();
    
    if (text.includes('password') || text.includes('login') || text.includes('system') || text.includes('error')) {
        return 'IT';
    }
    if (text.includes('grade') || text.includes('academic') || text.includes('class')) {
        return 'Academic Affairs';
    }
    if (text.includes('enroll') || text.includes('registration') || text.includes('transcript')) {
        return 'Registrar';
    }
    if (text.includes('payment') || text.includes('fee') || text.includes('tuition')) {
        return 'Finance';
    }
    if (text.includes('welfare') || text.includes('counseling') || text.includes('assistance')) {
        return 'Student Affairs';
    }
    
    return 'IT'; // Default fallback
}

// Auto-assign user based on department
function autoAssignUser(formData) {
    const department = formData.department || autoAssignDepartment(formData);
    
    // Mock assignment logic - in real app, this would query available staff
    const staffByDepartment = {
        'IT': 'John Smith (IT)',
        'Academic Affairs': 'Jane Doe (Academic)',
        'Registrar': 'Mike Johnson (Registrar)',
        'Finance': 'Sarah Wilson (Finance)',
        'Student Affairs': 'David Brown (Student Affairs)'
    };
    
    return staffByDepartment[department] || null;
}

// Load users for department
function loadDepartmentUsers() {
    // This would typically load from an API
    const mockUsers = [
        { id: 1, name: 'John Smith', department: 'IT' },
        { id: 2, name: 'Jane Doe', department: 'Academic Affairs' },
        { id: 3, name: 'Mike Johnson', department: 'Registrar' },
        { id: 4, name: 'Sarah Wilson', department: 'Finance' },
        { id: 5, name: 'David Brown', department: 'Student Affairs' }
    ];
    
    users = mockUsers;
    updateAssigneeOptions();
}

// Update assignee options based on selected department
function updateAssigneeOptions() {
    const departmentSelect = document.getElementById('department');
    const assigneeSelect = document.getElementById('assignedTo');
    
    if (!departmentSelect || !assigneeSelect) return;
    
    const selectedDepartment = departmentSelect.value;
    
    // Clear existing options except the first one
    assigneeSelect.innerHTML = '<option value="">Auto-assign</option>';
    
    if (selectedDepartment) {
        // Filter users by department
        const departmentUsers = users.filter(user => 
            user.department.toLowerCase().replace(/\s+/g, '_') === selectedDepartment
        );
        
        departmentUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.name;
            option.textContent = user.name;
            assigneeSelect.appendChild(option);
        });
    }
}

// Setup file upload functionality
function setupFileUpload() {
    const fileInput = document.getElementById('attachments');
    if (!fileInput) return;

    // File selection handler
    fileInput.addEventListener('change', function() {
        handleFileUpload(this, 'filePreview');
        validateFiles();
    });

    // Drag and drop functionality
    const form = document.getElementById('createTicketForm');
    
    form.addEventListener('dragover', function(e) {
        e.preventDefault();
        form.classList.add('drag-over');
    });
    
    form.addEventListener('dragleave', function(e) {
        e.preventDefault();
        form.classList.remove('drag-over');
    });
    
    form.addEventListener('drop', function(e) {
        e.preventDefault();
        form.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        fileInput.files = files;
        handleFileUpload(fileInput, 'filePreview');
        validateFiles();
    });
}

// Validate uploaded files
function validateFiles() {
    const fileInput = document.getElementById('attachments');
    const files = Array.from(fileInput.files);
    
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const maxFiles = 5;
    
    let hasErrors = false;
    
    // Check number of files
    if (files.length > maxFiles) {
        showToast(`Maximum ${maxFiles} files allowed`, 'warning');
        hasErrors = true;
    }
    
    // Check each file
    files.forEach((file, index) => {
        // Check file type
        if (!allowedTypes.includes(file.type)) {
            showToast(`File "${file.name}" has unsupported format`, 'warning');
            hasErrors = true;
        }
        
        // Check file size
        if (file.size > maxSize) {
            showToast(`File "${file.name}" is too large (max 5MB)`, 'warning');
            hasErrors = true;
        }
    });
    
    // Clear files if there are errors
    if (hasErrors) {
        fileInput.value = '';
        document.getElementById('filePreview').classList.add('d-none');
    }
}

// Save draft functionality
function saveDraft() {
    const formData = getFormData();
    saveDraftData(formData);
    showToast('Draft saved', 'info');
}

function saveDraftData(data) {
    if (!data) {
        data = getFormData();
    }
    saveToLocalStorage('ticketDraft', data);
}

function loadDraftData() {
    const draft = loadFromLocalStorage('ticketDraft');
    if (!draft) return;
    
    // Ask user if they want to restore draft
    if (confirm('Found a saved draft. Would you like to restore it?')) {
        document.getElementById('subject').value = draft.subject || '';
        document.getElementById('description').value = draft.description || '';
        document.getElementById('priority').value = draft.priority || 'medium';
        document.getElementById('department').value = draft.department || '';
        
        updateAssigneeOptions();
        
        if (draft.assignedTo) {
            document.getElementById('assignedTo').value = draft.assignedTo;
        }
        
        showToast('Draft restored', 'success');
    }
}

function clearDraftData() {
    localStorage.removeItem('ticketDraft');
}

// Character counter for description
document.addEventListener('DOMContentLoaded', function() {
    const descriptionField = document.getElementById('description');
    if (descriptionField) {
        // Add character counter
        const maxLength = validationRules.description.maxLength;
        const counter = document.createElement('div');
        counter.className = 'form-text text-end';
        counter.id = 'descriptionCounter';
        descriptionField.parentNode.appendChild(counter);
        
        function updateCounter() {
            const currentLength = descriptionField.value.length;
            counter.textContent = `${currentLength}/${maxLength} characters`;
            
            if (currentLength > maxLength * 0.9) {
                counter.classList.add('text-warning');
            } else {
                counter.classList.remove('text-warning');
            }
            
            if (currentLength > maxLength) {
                counter.classList.add('text-danger');
                counter.classList.remove('text-warning');
            } else {
                counter.classList.remove('text-danger');
            }
        }
        
        descriptionField.addEventListener('input', updateCounter);
        updateCounter(); // Initial count
    }
});

// Auto-resize textarea
document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('description');
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
});

// Utility function for debouncing
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
