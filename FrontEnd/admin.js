// admin.js - JavaScript cho trang admin

const AdminAPI = {
    // Authentication
    async login(username, password) {
        try {
            const response = await fetch(`${API_BASE}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            if (response.ok) {
                return await response.json();
            }
            throw new Error('Đăng nhập thất bại');
        } catch (error) {
            throw error;
        }
    },
    
    // Patients
    async getPatients() {
        return fetchData('/patients');
    },
    
    async savePatient(patient) {
        return saveData('/patients', patient);
    },
    
    async deletePatient(id) {
        return deleteData(`/patients/${id}`);
    },
    
    // Doctors
    async getDoctors() {
        return fetchData('/doctors');
    },
    
    async saveDoctor(doctor) {
        return saveData('/doctors', doctor);
    },
    
    async deleteDoctor(id) {
        return deleteData(`/doctors/${id}`);
    },
    
    // Departments
    async getDepartments() {
        return fetchData('/departments');
    },
    
    async saveDepartment(department) {
        return saveData('/departments', department);
    },
    
    async deleteDepartment(id) {
        return deleteData(`/departments/${id}`);
    },
    
    // Appointments
    async getAppointments() {
        return fetchData('/appointments');
    },
    
    async saveAppointment(appointment) {
        return saveData('/appointments', appointment);
    },
    
    async updateAppointmentStatus(id, status) {
        return updateData(`/appointments/${id}/status`, { status });
    },
    
    async deleteAppointment(id) {
        return deleteData(`/appointments/${id}`);
    },
    
    // Slots
    async getSlots() {
        return fetchData('/slots');
    },
    
    async saveSlot(slot) {
        return saveData('/slots', slot);
    },
    
    async deleteSlot(id) {
        return deleteData(`/slots/${id}`);
    },
    
    // Statistics
    async getStatistics() {
        return fetchData('/stats');
    }
};

// Helper functions
async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            return await response.json();
        }
        throw new Error(`HTTP ${response.status}`);
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

async function saveData(endpoint, data) {
    try {
        const method = data.id ? 'PUT' : 'POST';
        const url = data.id ? `${API_BASE}${endpoint}/${data.id}` : `${API_BASE}${endpoint}`;
        
        const response = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            return await response.json();
        }
        throw new Error(`HTTP ${response.status}`);
    } catch (error) {
        console.error('Save error:', error);
        throw error;
    }
}

async function updateData(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            return await response.json();
        }
        throw new Error(`HTTP ${response.status}`);
    } catch (error) {
        console.error('Update error:', error);
        throw error;
    }
}

async function deleteData(endpoint) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            return true;
        }
        throw new Error(`HTTP ${response.status}`);
    } catch (error) {
        console.error('Delete error:', error);
        throw error;
    }
}

function getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
}

// Form validation
function validateForm(formData, requiredFields) {
    const errors = [];
    
    requiredFields.forEach(field => {
        if (!formData[field] || formData[field].trim() === '') {
            errors.push(`${field} là bắt buộc`);
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// Date formatting
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
}

// Export for use in HTML
window.AdminAPI = AdminAPI;
window.adminUtils = {
    validateForm,
    formatDate,
    formatDateTime
};