// src/services/apiService.ts or .js

const API_BASE = import.meta.env.DEV
  ? 'https://freelance-app-backend-dtz1.onrender.com/api'
  : '/api';

export const apiService = {
  async register(data) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Registration failed: ${res.status}`);
    return res.json();
  },

  async login(data) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Login failed: ${res.status}`);
    return res.json();
  },

  async getMe(token) {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },

  async updateProfile(token, data) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async changePassword(token, data) {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async logout(token) {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },

  async getServices(params = {}) {
    const query = params.limit ? `?limit=${params.limit}` : '';
    const res = await fetch(`${API_BASE}/services${query}`);
    return res.json();
  },

  async getGigs(params = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const res = await fetch(`${API_BASE}/gigs${query}`);
    return res.json();
  },

  async getServiceById(id) {
    const res = await fetch(`${API_BASE}/services/${id}`);
    const data = await res.json();
    if (data.success && data.data) {
      return {
        success: true,
        service: {
          id: data.data._id,
          title: data.data.title,
          description: data.data.description,
          shortDescription: data.data.description.substring(0, 100) + '...',
          category: data.data.category,
          subcategory: data.data.category,
          tags: data.data.tags || [],
          images: data.data.images || [],
          pricing: [
            {
              id: 'basic',
              title: 'Basic Package',
              description: data.data.description,
              price: data.data.price,
              deliveryTime: data.data.deliveryTime || 3,
              revisions: 2,
              features: [
                'Professional quality work',
                'Fast delivery',
                '2 revisions included',
                'Source files included'
              ]
            }
          ],
          freelancerId: data.data.user?._id || data.data.user,
          freelancer: data.data.user,
          rating: data.data.rating || 0,
          totalReviews: data.data.totalReviews || 0,
          totalOrders: 0,
          deliveryTime: data.data.deliveryTime || 3,
          revisions: 2,
          features: [
            'Professional quality work',
            'Fast delivery',
            '2 revisions included',
            'Source files included'
          ],
          createdAt: data.data.createdAt || new Date().toISOString(),
          isActive: true
        }
      };
    }
    return data;
  },

  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    return res.json();
  },

  async getReviewsForService(serviceId) {
    const res = await fetch(`${API_BASE}/reviews/service/${serviceId}`);
    return res.json();
  },

  async createGig(data) {
    const res = await fetch(`${API_BASE}/gigs`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getMyGigs() {
    const res = await fetch(`${API_BASE}/gigs/my-gigs`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    return res.json();
  },

  async deleteGig(gigId) {
    const res = await fetch(`${API_BASE}/gigs/${gigId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    return res.json();
  },

  async updateGig(id, data) {
    const res = await fetch(`${API_BASE}/gigs/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async uploadImage(formData) {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData,
    });
    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message || 'Image upload failed');
    }
    return result;
  },

  async createOrder(data) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getOrderById(id) {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    return res.json();
  },

  async getMyOrders() {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    return res.json();
  },

  async getConversations() {
    const res = await fetch(`${API_BASE}/messages/conversations`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    return res.json();
  },

  async getMessages(conversationId) {
    const res = await fetch(`${API_BASE}/messages/conversation/${conversationId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    return res.json();
  },

  async sendMessage(data) {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getUsers() {
    const res = await fetch(`${API_BASE}/users`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    return res.json();
  },

  async deleteUser(userId) {
    const res = await fetch(`${API_BASE}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    return res.json();
  },

  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    return res.json();
  },

  async verifyPayment(sessionId) {
    const res = await fetch(`${API_BASE}/payments/verify/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    return res.json();
  },

  async createCheckoutSession(data) {
    const res = await fetch(`${API_BASE}/payments/checkout-session`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
