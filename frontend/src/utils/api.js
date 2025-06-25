// API utility functions with comprehensive logging
export const API_BASE_URL = 'http://localhost:5000';
const API_TIMEOUT = 10000;
const DEBUG_MODE = true;

// Log API configuration
console.log('🔧 API Configuration:', {
  API_BASE_URL,
  API_TIMEOUT,
  DEBUG_MODE,
  timestamp: new Date().toISOString()
});

// Helper function to get auth headers
const getAuthHeaders = (token) => {
  if (!token) {
    if (DEBUG_MODE) console.warn('⚠️ No token provided for API request');
    return { 'Content-Type': 'application/json' };
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Generic API request function with logging
export const apiRequest = async (endpoint, options = {}, token = null) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getAuthHeaders(token);
  
  const requestConfig = {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  };

  if (DEBUG_MODE) {
    console.log('📡 API Request:', {
      method: requestConfig.method || 'GET',
      url,
      hasToken: !!token,
      timestamp: new Date().toISOString()
    });

    if (requestConfig.body) {
      console.log('📦 Request body:', requestConfig.body);
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(url, {
      ...requestConfig,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    if (DEBUG_MODE) {
      console.log('📊 API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });
    }

    const data = await response.json();
    
    if (!response.ok) {
      if (DEBUG_MODE) {
        console.error('❌ API Error:', {
          status: response.status,
          error: data.error,
          message: data.message,
          details: data
        });
      }
      throw new Error(data.error || data.message || 'API request failed');
    }

    if (DEBUG_MODE) {
      console.log('✅ API Success:', {
        dataType: typeof data,
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : null
      });
    }

    return data;
  } catch (error) {
    if (DEBUG_MODE) {
      console.error('💥 API Request Error:', {
        message: error.message,
        stack: error.stack,
        url
      });
    }
    throw error;
  }
};

// Specific API functions
export const api = {
  // Patient APIs
  getPatients: (token) => apiRequest('/patients', {}, token),
  getPatient: (hn, token) => apiRequest(`/patients/${hn}`, {}, token),
  getPatientById: (id, token) => apiRequest(`/patients/id/${id}`, {}, token),
  createPatient: (patientData, token) => apiRequest('/patients', {
    method: 'POST',
    body: JSON.stringify(patientData)
  }, token),
  updatePatient: (hn, patientData, token) => apiRequest(`/patients/${hn}`, {
    method: 'PUT',
    body: JSON.stringify(patientData)
  }, token),
  updatePatientById: (id, patientData, token) => apiRequest(`/patients/id/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patientData)
  }, token),
  deletePatient: (hn, token) => apiRequest(`/patients/${hn}`, {
    method: 'DELETE'
  }, token),
  deletePatientById: (id, token) => apiRequest(`/patients/id/${id}`, {
    method: 'DELETE'
  }, token),
  deletePatientAttachment: (id, attachmentPath, token) => apiRequest(`/patients/id/${id}/delete-attachment`, {
    method: 'PUT',
    body: JSON.stringify({ attachmentPath })
  }, token),

  // Appointment APIs
  getAppointments: (token) => apiRequest('/appointments', {}, token),
  getAppointment: (id, token) => apiRequest(`/appointments/${id}`, {}, token),
  createAppointment: (appointmentData, token) => apiRequest('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData)
  }, token),
  updateAppointment: (id, appointmentData, token) => apiRequest(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(appointmentData)
  }, token),
  deleteAppointment: (id, token) => apiRequest(`/appointments/${id}`, {
    method: 'DELETE'
  }, token),
  updateAppointmentStatus: (id, statusData, token) => apiRequest(`/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(statusData)
  }, token),

  // User APIs
  login: (credentials) => apiRequest('/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  register: (userData, token) => apiRequest('/users/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }, token),
  getProfile: (token) => apiRequest('/users/profile', {}, token),
  updateProfile: (profileData, token) => apiRequest('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }, token),

  // Link APIs
  getLinks: (token) => apiRequest('/links', {}, token),
  createLink: (linkData, token) => apiRequest('/links', {
    method: 'POST',
    body: JSON.stringify(linkData)
  }, token),
  updateLink: (id, linkData, token) => apiRequest(`/links/${id}`, {
    method: 'PUT',
    body: JSON.stringify(linkData)
  }, token),
  deleteLink: (id, token) => apiRequest(`/links/${id}`, {
    method: 'DELETE'
  }, token),

  // Health check
  healthCheck: () => apiRequest('/health', {})
};

// Log when API module is loaded
if (DEBUG_MODE) {
  console.log('📚 API utility module loaded');
} 