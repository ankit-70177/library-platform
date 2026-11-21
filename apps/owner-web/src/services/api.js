const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('kitaab-auth-token')

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await response.json().catch(() => ({}))

  if (response.status === 401) {
    localStorage.removeItem('kitaab-auth-token')
    localStorage.removeItem('kitaab-demo-user')
    window.location.href = '/login'
    throw new Error('Session expired. Please log in again.')
  }

  if (!response.ok) {
    throw new Error(data.message || 'API request failed.')
  }

  return data
}

// Authentication
export const loginUser = (credentials) =>
  apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })

export const applyAsOwner = (applicationData) =>
  apiRequest('/owners/apply', {
    method: 'POST',
    body: JSON.stringify(applicationData),
  })

export const getCurrentUser = () =>
  apiRequest('/auth/me')

// Owner Dashboard & Library Management
export const getOwnerDashboard = () =>
  apiRequest('/owner/dashboard')

export const getMyLibraries = () =>
  apiRequest('/libraries/my')

export const getLibraryById = (id) =>
  apiRequest(`/libraries/${id}`)

export const createLibrary = (libraryData) =>
  apiRequest('/libraries', {
    method: 'POST',
    body: JSON.stringify(libraryData),
  })

export const updateLibrary = (id, libraryData) =>
  apiRequest(`/libraries/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(libraryData),
  })

export const deleteLibrary = (id) =>
  apiRequest(`/libraries/${id}`, {
    method: 'DELETE',
  })

// Admin Endpoints for MVP Verification & Approval
export const getAdminPendingLibraries = () =>
  apiRequest('/libraries/admin/pending')

export const approveAdminLibrary = (id) =>
  apiRequest(`/libraries/admin/${id}/approve`, {
    method: 'PATCH',
  })

export const rejectAdminLibrary = (id) =>
  apiRequest(`/libraries/admin/${id}/reject`, {
    method: 'PATCH',
  })

export const getAdminDashboard = () =>
  apiRequest('/admin/dashboard')
