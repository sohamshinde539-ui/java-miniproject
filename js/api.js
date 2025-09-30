// API Configuration
const API_BASE_URL = (typeof window !== 'undefined' && window.location && !window.location.origin.includes('localhost'))
  ? `${window.location.origin}/api`
  : 'http://localhost:3000/api';

// Token management
const TokenManager = {
    get() {
        return localStorage.getItem('authToken');
    },
    
    set(token) {
        localStorage.setItem('authToken', token);
    },
    
    clear() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    },
    
    isValid() {
        const token = this.get();
        if (!token) return false;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }
};

// Current user management
const UserManager = {
    get() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },
    
    set(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    },
    
    clear() {
        localStorage.removeItem('currentUser');
    }
};

// API class for making HTTP requests
class API {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = TokenManager.get();
        
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            ...options
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            const contentType = (response.headers.get('content-type') || '').toLowerCase();
            let data;

            if (contentType.includes('application/json')) {
                data = await response.json();
            } else {
                // Fallback for non-JSON responses (e.g., plain text rate limit messages)
                const text = await response.text();
                data = text && text.length ? { message: text } : {};
            }

            if (!response.ok) {
                let errorMessage = (data && (data.error || data.message)) || `HTTP error! status: ${response.status}`;
                
                // If there are validation details, include them
                if (data && data.details && Array.isArray(data.details)) {
                    const validationErrors = data.details.map(detail => detail.msg).join('. ');
                    errorMessage = `Validation failed: ${validationErrors}`;
                }
                
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            
            // Handle token expiration
            if (error.message.includes('Invalid or expired token')) {
                TokenManager.clear();
                UserManager.clear();
                window.location.href = '#login';
            }
            
            throw error;
        }
    }

    // Authentication endpoints
    static async login(username, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: { username, password }
        });
        
        if (response.token) {
            TokenManager.set(response.token);
            UserManager.set(response.user);
        }
        
        return response;
    }

    static async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } finally {
            TokenManager.clear();
            UserManager.clear();
        }
    }

    static async getProfile() {
        return await this.request('/auth/profile');
    }

    static async updateProfile(profileData) {
        return await this.request('/auth/profile', {
            method: 'PUT',
            body: profileData
        });
    }

    static async changePassword(currentPassword, newPassword) {
        return await this.request('/auth/change-password', {
            method: 'PUT',
            body: { currentPassword, newPassword }
        });
    }

    static async registerStudent(studentData) {
        return await this.request('/auth/register-student', {
            method: 'POST',
            body: studentData
        });
    }

    static async registerAdmin(adminData) {
        return await this.request('/auth/register-admin', {
            method: 'POST',
            body: adminData
        });
    }

    // Homework endpoints
    static async getHomework() {
        const response = await this.request('/homework');
        return response.homework;
    }

    static async getHomeworkById(id) {
        const response = await this.request(`/homework/${id}`);
        return response.homework;
    }

    static async createHomework(homeworkData) {
        return await this.request('/homework', {
            method: 'POST',
            body: homeworkData
        });
    }

    static async updateHomework(id, homeworkData) {
        return await this.request(`/homework/${id}`, {
            method: 'PUT',
            body: homeworkData
        });
    }

    static async deleteHomework(id) {
        return await this.request(`/homework/${id}`, {
            method: 'DELETE'
        });
    }

    // Assignment endpoints
    static async getAssignments() {
        const response = await this.request('/assignments');
        return response.assignments;
    }

    static async getAssignmentById(id) {
        const response = await this.request(`/assignments/${id}`);
        return response.assignment;
    }

    static async createAssignment(assignmentData) {
        return await this.request('/assignments', {
            method: 'POST',
            body: assignmentData
        });
    }

    static async updateAssignment(id, assignmentData) {
        return await this.request(`/assignments/${id}`, {
            method: 'PUT',
            body: assignmentData
        });
    }

    static async deleteAssignment(id) {
        return await this.request(`/assignments/${id}`, {
            method: 'DELETE'
        });
    }

    // Health check
    static async healthCheck() {
        return await this.request('/health');
    }
}

// Export for use in HTML files
window.API = API;
window.TokenManager = TokenManager;
window.UserManager = UserManager;