const API_BASE_URL = 'http://localhost:5001/api';

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('kitaab-auth-token');

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (response.status === 401) {
    localStorage.removeItem('kitaab-auth-token');
    localStorage.removeItem('kitaab-demo-user');
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    throw new Error(data.message || 'API request failed.');
  }

  return data;
};

export const getCustomerDashboard = () =>
  apiRequest('/customer/dashboard');

export const getMySubscriptions = () =>
  apiRequest('/subscriptions/my');

export const getMyPayments = () =>
  apiRequest('/payments/my');

export const getMyBookings = () =>
  apiRequest('/bookings/my');

export const cancelMyBooking = (id) =>
  apiRequest(`/bookings/${id}/cancel`, {
    method: 'PATCH',
  });


export const cancelMySubscription = (id) =>
  apiRequest(`/subscriptions/${id}/cancel`, {
    method: 'PATCH',
  });

export const getMyReviews = () =>
  apiRequest('/reviews/my');

export const createMyReview = (reviewData) =>
  apiRequest('/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData),
  });

export const deleteMyReview = (id) =>
  apiRequest(`/reviews/${id}`, {
    method: 'DELETE',
  });


export const getMySavedLibraries = () =>
  apiRequest('/saved-libraries/my');

export const saveMyLibrary = (libraryId) =>
  apiRequest('/saved-libraries', {
    method: 'POST',
    body: JSON.stringify({ library_id: libraryId }),
  });

export const removeMySavedLibrary = (libraryId) =>
  apiRequest(`/saved-libraries/${libraryId}`, {
    method: 'DELETE',
  });


export const getApprovedLibraries = () =>
  apiRequest('/discovery/libraries?limit=50');
