export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    userType: 'freelancer' | 'client';
    isVerified: boolean;
    createdAt: string;
    rating?: number;
    totalReviews?: number;
  }
  
  export interface Service {
    id: string;
    title: string;
    description: string;
    shortDescription: string;
    category: string;
    subcategory: string;
    tags: string[];
    images: string[];
    pricing: ServicePricing[];
    freelancerId: string;
    freelancer: User;
    rating: number;
    totalReviews: number;
    totalOrders: number;
    deliveryTime: number;
    revisions: number;
    features: string[];
    createdAt: string;
    isActive: boolean;
  }
  
  export interface ServicePricing {
    id: string;
    title: string;
    description: string;
    price: number;
    deliveryTime: number;
    revisions: number;
    features: string[];
  }
  
  export interface Order {
    id: string;
    serviceId: string;
    service: Service;
    clientId: string;
    client: User;
    freelancerId: string;
    freelancer: User;
    pricingTier: ServicePricing;
    status: 'pending' | 'active' | 'delivered' | 'completed' | 'cancelled';
    totalAmount: number;
    requirements: string;
    deliveryDate: string;
    createdAt: string;
    milestones: OrderMilestone[];
  }
  
  export interface OrderMilestone {
    id: string;
    title: string;
    description: string;
    amount: number;
    dueDate: string;
    status: 'pending' | 'in_progress' | 'delivered' | 'approved';
    deliverables?: string[];
  }
  
  export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    receiverId: string;
    content: string;
    attachments?: string[];
    createdAt: string;
    isRead: boolean;
  }
  
  export interface Conversation {
    id: string;
    participants: User[];
    lastMessage: Message;
    orderId?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Review {
    id: string;
    orderId: string;
    serviceId: string;
    clientId: string;
    client: User;
    freelancerId: string;
    rating: number;
    comment: string;
    createdAt: string;
  }
  
  export interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string;
    subcategories: Subcategory[];
  }
  
  export interface Subcategory {
    id: string;
    name: string;
    slug: string;
    categoryId: string;
  }