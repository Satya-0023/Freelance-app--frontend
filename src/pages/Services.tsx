import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import ServiceCard from '../components/services/ServiceCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import { useAuth } from '../contexts/AuthContext';
import type { Service, Category } from '../types';
import { apiService } from '../services/api';
import { motion } from 'framer-motion';

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load gigs from the backend
      const gigsResponse = await apiService.getGigs();
      const categoriesRes = await apiService.getCategories();
      
      // Transform gigs to services format
      const transformedServices = gigsResponse.data?.gigs?.map((gig: any) => ({
        id: gig._id,
        title: gig.title,
        description: gig.description,
        category: gig.category,
        price: gig.price,
        deliveryTime: gig.deliveryTime,
        rating: 4.5, // Default rating
        totalReviews: 12, // Default reviews
        images: gig.images || [],
        tags: gig.tags || [],
        freelancer: {
          id: gig.user?._id,
          firstName: gig.user?.profile?.firstName || 'Unknown',
          lastName: gig.user?.profile?.lastName || 'User',
          avatar: gig.user?.profile?.avatar,
        },
        pricing: [
          {
            name: 'Basic',
            price: gig.price,
            description: 'Basic package',
            deliveryTime: gig.deliveryTime,
          }
        ]
      })) || [];

      setServices(transformedServices);
      setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
    } catch (err) {
      setError('Failed to load services');
              showErrorToast('Error', 'Failed to load services. Please try again.');
      setServices([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory ? service.category === selectedCategory : true;
    const matchesSearch = searchQuery ? 
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesCategory && matchesSearch;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality is already handled by the input onChange
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-dark-900 dark:to-dark-800 py-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }} 
          className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center"
          data-cy="services-title"
        >
          Browse Services
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2, duration: 0.6 }} 
          className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-10 justify-center"
        >
          <div className="flex-1 mb-4 md:mb-0 max-w-xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-400 dark:text-primary-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search for services..."
                className="w-full pl-10 pr-4 py-3 border border-primary-200 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent shadow-md text-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-dark-400"
                data-cy="search-input"
              />
            </form>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary-400 dark:text-primary-300" />
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="px-4 py-3 border border-primary-200 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent shadow-md bg-white dark:bg-dark-700 text-gray-900 dark:text-white text-lg"
              data-cy="category-filter"
            >
              <option value="">All Categories</option>
              {Array.isArray(categories) && categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Create Gig Button for Freelancers */}
        {user && user.role === 'freelancer' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center mb-8"
          >
            <Link
              to="/gigs/create"
              className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
              data-cy="create-gig-button"
            >
              <Plus className="h-5 w-5" />
              <span>Create New Gig</span>
            </Link>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <LoadingSpinner size="lg" color="primary" />
              <p className="mt-4 text-gray-600 dark:text-dark-300" data-cy="loading-text">Loading services...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20" data-cy="error-message">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              data-cy="retry-button"
            >
              Try Again
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.5 }} 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            data-cy="services-grid"
          >
            {filteredServices.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 dark:text-dark-400 py-12" data-cy="no-services">
                {searchQuery || selectedCategory ? 'No services found matching your criteria.' : 'No services available.'}
                {user && user.role === 'freelancer' && (
                  <div className="mt-4">
                    <Link
                      to="/gigs/create"
                      className="text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      Create the first gig!
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              filteredServices.map((service, i) => (
                <motion.div 
                  key={service.id} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.07 }}
                >
                  <ServiceCard service={service} />
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Services; 