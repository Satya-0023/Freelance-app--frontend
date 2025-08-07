const API_BASE = '/api/auth';

export const apiService = {
  async register(data: any) {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: data.username,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role
      }),
    });
    if (!res.ok) {
      throw new Error(`Registration failed: ${res.status}`);
    }
    return res.json();
  },
  async login(data: any) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`Login failed: ${res.status}`);
    }
    return res.json();
  },
  async getMe(token: string) {
    const res = await fetch(`${API_BASE}/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },
  async updateProfile(token: string, data: any) {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async changePassword(token: string, data: any) {
    const res = await fetch(`${API_BASE}/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async logout(token: string) {
    const res = await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },

  async getServices(params: { limit?: number } = {}) {
    const query = params.limit ? `?limit=${params.limit}` : '';
    const res = await fetch(`/api/services${query}`);
    return res.json();
  },

  async getGigs(params: { q?: string; category?: string; minPrice?: number; maxPrice?: number; page?: number; limit?: number } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const res = await fetch(`/api/gigs${query}`);
    return res.json();
  },

  async getServiceById(id: string) {
    const res = await fetch(`/api/services/${id}`);
    const data = await res.json();
    // Transform gig data to service format for compatibility
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
    const res = await fetch('/api/categories');
    return res.json();
  },

  async getReviewsForService(serviceId: string) {
    const res = await fetch(`/api/reviews/service/${serviceId}`);
    return res.json();
  },

  async createGig(data: any) {
    const res = await fetch('/api/gigs', {
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
    const res = await fetch('/api/gigs/my-gigs', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    return res.json();
  },

  async deleteGig(gigId: string) {
    const res = await fetch(`/api/gigs/${gigId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    return res.json();
  },

  async updateGig(id: string, data: any) {
    const res = await fetch(`/api/gigs/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async createOrder(data: any) {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getOrderById(id: string) {
    const res = await fetch(`/api/orders/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to load order: ${res.status}`);
    }
    return res.json();
  },

  async getMyOrders() {
    const res = await fetch('/api/orders', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to load orders: ${res.status}`);
    }
    return res.json();
  },

  async getOrderMessages(orderId: string) {
    const res = await fetch(`/api/messages/order/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    return res.json();
  },

  async getMessages(conversationId: string) {
    const res = await fetch(`/api/messages/conversation/${conversationId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to load messages: ${res.status}`);
    }
    const text = await res.text();
    if (!text) {
      throw new Error('Empty response from server');
    }
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
    }
  },

  async getMessagesByConversation(conversationId: string) {
    const res = await fetch(`/api/messages/conversation/${conversationId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to load messages: ${res.status}`);
    }
    const text = await res.text();
    if (!text) {
      throw new Error('Empty response from server');
    }
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
    }
  },

  async getConversations() {
    const res = await fetch('/api/messages/conversations', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to load conversations: ${res.status}`);
    }
    const text = await res.text();
    if (!text) {
      throw new Error('Empty response from server');
    }
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
    }
  },

  async getFreelancers() {
    const res = await fetch('/api/messages/freelancers', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to load freelancers: ${res.status}`);
    }
    const text = await res.text();
    if (!text) {
      throw new Error('Empty response from server');
    }
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
    }
  },

  async sendMessage(data: { receiverId: string, content: string, orderId?: string }) {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to send message: ${res.status}`);
    }
    const text = await res.text();
    if (!text) {
      throw new Error('Empty response from server');
    }
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
    }
  },

  // Payment methods
  async createCheckoutSession(data: { gigId: string; requirements?: string }) {
    const res = await fetch('/api/payments/checkout-session', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Payment failed: ${res.status}`);
    }
    return res.json();
  },

  // Image upload
  async uploadImage(formData: FormData) {
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Image upload failed: ${res.status}`);
      }
      
      const result = await res.json();
      if (!result.success) {
        throw new Error(result.message || 'Image upload failed');
      }
      
      return result;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  },

  // User management
  async getUsers() {
    const res = await fetch('/api/users', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    return res.json();
  },

  async deleteUser(userId: string) {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    return res.json();
  },

  // Admin methods
  async getAdminStats() {
    const res = await fetch('/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    return res.json();
  },

  // Payment verification
  async verifyPayment(sessionId: string) {
    const res = await fetch(`/api/payments/verify/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    return res.json();
  },
}; 