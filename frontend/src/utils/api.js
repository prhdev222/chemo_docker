// API utility functions with comprehensive logging
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;
const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true' || true; // Default to true for development

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
  createPatient: (patientData, token) => apiRequest('/patients', {
    method: 'POST',
    body: JSON.stringify(patientData)
  }, token),
  updatePatient: (hn, patientData, token) => apiRequest(`/patients/${hn}`, {
    method: 'PUT',
    body: JSON.stringify(patientData)
  }, token),
  deletePatient: (hn, token) => apiRequest(`/patients/${hn}`, {
    method: 'DELETE'
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

  // User APIs
  login: (credentials) => apiRequest('/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  getProfile: (token) => apiRequest('/users/profile', {}, token),
  updateProfile: (profileData, token) => apiRequest('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }, token),

  // Health check
  healthCheck: () => apiRequest('/health', {})
};

// Log when API module is loaded
if (DEBUG_MODE) {
  console.log('📚 API utility module loaded');
} 