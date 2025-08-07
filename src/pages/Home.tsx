import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Users, Award, TrendingUp, ChevronRight } from 'lucide-react';
import ServiceCard from '../components/services/ServiceCard';
import type { Service, Category } from '../types';
import { apiService } from '../services/api';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      // Load gigs from the backend
      const gigsResponse = await apiService.getGigs({ limit: 8 });
      const categoriesResponse = await apiService.getCategories();
      
      // Transform gigs to services format
      const transformedServices = gigsResponse.data?.gigs?.map((gig: any) => ({
        id: gig._id,
        title: gig.title,
        description: gig.description,
        shortDescription: gig.description.substring(0, 100),
        category: gig.category,
        subcategory: 'general',
        tags: gig.tags || [],
        images: gig.images || [],
        pricing: [
          {
            id: '1',
            title: 'Basic',
            description: 'Basic package',
            price: gig.price,
            deliveryTime: gig.deliveryTime,
            revisions: 3,
            features: ['High-quality work', 'Fast delivery']
          }
        ],
        freelancerId: gig.user?._id || 'unknown',
        freelancer: {
          id: gig.user?._id || 'unknown',
          email: 'user@example.com',
          firstName: gig.user?.profile?.firstName || 'Unknown',
          lastName: gig.user?.profile?.lastName || 'User',
          avatar: gig.user?.profile?.avatar,
          userType: 'freelancer' as const,
          isVerified: true,
          createdAt: '2024-01-01',
          rating: 4.5,
          totalReviews: 12
        },
        rating: 4.5,
        totalReviews: 12,
        totalOrders: 0,
        deliveryTime: gig.deliveryTime,
        revisions: 3,
        features: ['High-quality work', 'Fast delivery'],
        createdAt: gig.createdAt || '2024-01-01',
        isActive: true
      })) || [];

      setFeaturedServices(transformedServices);
      setCategories(Array.isArray(categoriesResponse) ? categoriesResponse : []);
    } catch (error) {
      console.error('Failed to load home data:', error);
      // Mock data for demonstration
      setFeaturedServices([
        {
          id: '1',
          title: 'I will create a modern logo design for your business',
          description: 'Professional logo design with unlimited revisions',
          shortDescription: 'Modern logo design',
          category: 'Graphics & Design',
          subcategory: 'logo-design',
          tags: ['logo', 'design', 'branding'],
          images: ['https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg'],
          pricing: [
            {
              id: '1',
              title: 'Basic',
              description: 'Logo design',
              price: 25,
              deliveryTime: 2,
              revisions: 3,
              features: ['1 Logo concept', '2 Revisions']
            }
          ],
          freelancerId: '1',
          freelancer: {
            id: '1',
            email: 'designer@example.com',
            firstName: 'Sarah',
            lastName: 'Johnson',
            avatar: undefined,
            userType: 'freelancer',
            isVerified: true,
            createdAt: '2024-01-01',
            rating: 4.9,
            totalReviews: 156
          },
          rating: 4.9,
          totalReviews: 156,
          totalOrders: 234,
          deliveryTime: 2,
          revisions: 3,
          features: ['High-quality design', 'Commercial use rights'],
          createdAt: '2024-01-01',
          isActive: true
        }
      ]);
      
      setCategories([
        { id: '1', name: 'Graphics & Design', slug: 'graphics-design', icon: '🎨', subcategories: [] },
        { id: '2', name: 'Programming & Tech', slug: 'programming-tech', icon: '💻', subcategories: [] },
        { id: '3', name: 'Digital Marketing', slug: 'digital-marketing', icon: '📱', subcategories: [] },
        { id: '4', name: 'Writing & Translation', slug: 'writing-translation', icon: '✍️', subcategories: [] },
        { id: '5', name: 'Video & Animation', slug: 'video-animation', icon: '🎬', subcategories: [] },
        { id: '6', name: 'Music & Audio', slug: 'music-audio', icon: '🎵', subcategories: [] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/services?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-700 dark:to-accent-700 text-white relative overflow-hidden">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none" style={{background: 'url(https://www.toptal.com/designers/subtlepatterns/patterns/memphis-mini.png) repeat'}} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-4xl md:text-6xl font-bold mb-6">
              Find the perfect
              <span className="text-yellow-400"> freelance </span>
              services for your business
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }} className="text-xl md:text-2xl mb-8 text-primary-100 dark:text-primary-200">
              Work with talented freelancers from around the world
            </motion.p>
            {/* Search Bar */}
            <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }} onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-primary-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Try 'building mobile app'"
                  className="w-full pl-12 pr-20 py-4 text-lg text-gray-900 dark:text-white bg-white dark:bg-dark-800 rounded-lg focus:ring-4 focus:ring-primary-300 focus:outline-none shadow-lg"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-primary-600 to-accent-600 text-white px-6 py-2 rounded-lg hover:scale-105 hover:shadow-xl transition-all font-medium shadow-md"
                >
                  Search
                </button>
              </div>
            </motion.form>
            {/* Popular Searches */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.7 }} className="mt-6">
              <p className="text-primary-200 mb-2">Popular:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Website Design', 'WordPress', 'Logo Design', 'Video Editing', 'SEO'].map((term) => (
                  <Link
                    key={term}
                    to={`/services?q=${encodeURIComponent(term)}`}
                    className="px-4 py-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors text-sm shadow"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-white dark:bg-dark-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-gray-600 dark:text-dark-300">Trusted by:</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center">
            <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-dark-400">
              <Users className="h-8 w-8" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">1M+</p>
                <p className="text-sm">Active Buyers</p>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-dark-400">
              <Award className="h-8 w-8" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">500K+</p>
                <p className="text-sm">Freelancers</p>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-dark-400">
              <Star className="h-8 w-8" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">4.9/5</p>
                <p className="text-sm">Average Rating</p>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-dark-400">
              <TrendingUp className="h-8 w-8" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">2M+</p>
                <p className="text-sm">Orders Completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="py-16 bg-gray-50 dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Browse by Category
            </h2>
            <p className="text-xl text-gray-600 dark:text-dark-300">
              Find services in every category
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {Array.isArray(categories) && categories.map((category) => (
              <Link
                key={category.id}
                to={`/services?category=${category.slug}`}
                className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow group text-center border border-gray-200 dark:border-dark-700"
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Services */}
      <div className="py-16 bg-white dark:bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Featured Services
              </h2>
              <p className="text-xl text-gray-600 dark:text-dark-300">
                Hand-picked services from top freelancers
              </p>
            </div>
            <Link
              to="/services"
              className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
            >
              <span>View All</span>
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 dark:bg-dark-700 rounded-lg h-80 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-dark-800 dark:to-dark-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">Why Choose FreelanceHub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-lg transition-all border border-gray-200 dark:border-dark-700">
              <Star className="h-10 w-10 text-yellow-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Top Talent</h3>
              <p className="text-gray-500 dark:text-dark-300">Work with vetted, highly-rated freelancers from around the world.</p>
            </div>
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-lg transition-all border border-gray-200 dark:border-dark-700">
              <TrendingUp className="h-10 w-10 text-primary-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Fast Results</h3>
              <p className="text-gray-500 dark:text-dark-300">Get your projects done quickly with our streamlined platform.</p>
            </div>
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-lg transition-all border border-gray-200 dark:border-dark-700">
              <Award className="h-10 w-10 text-accent-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Secure Payments</h3>
              <p className="text-gray-500 dark:text-dark-300">Your payments are protected until you're satisfied with the work.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 dark:bg-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-primary-100 dark:text-primary-200 mb-8">
            Join millions of people who use FreelanceHub to turn their ideas into reality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register?type=client"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              Start Buying
            </Link>
            <Link
              to="/register?type=freelancer"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-primary-600 transition-colors"
            >
              Start Selling
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;