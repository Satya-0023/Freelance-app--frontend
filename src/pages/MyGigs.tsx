import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Calendar, DollarSign, Tag } from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface Gig {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  deliveryTime: number;
  images: string[];
  tags: string[];
  isActive: boolean;
  createdAt: string;
}

const MyGigs: React.FC = () => {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingGig, setDeletingGig] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role !== 'freelancer') {
      showErrorToast('Access Denied', 'Only freelancers can access this page.');
      navigate('/services');
      return;
    }
    loadGigs();
  }, [user, navigate]);

  const loadGigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getMyGigs();
      setGigs(response.data || []);
    } catch (err) {
      setError('Failed to load gigs');
      showErrorToast('Error', 'Failed to load your gigs.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGig = async (gigId: string) => {
    if (!confirm('Are you sure you want to delete this gig?')) return;

    setDeletingGig(gigId);
    try {
      await apiService.deleteGig(gigId);
      setGigs(prev => prev.filter(gig => gig._id !== gigId));
      showSuccessToast('Success', 'Gig deleted successfully!');
    } catch (err) {
      showErrorToast('Error', 'Failed to delete gig.');
    } finally {
      setDeletingGig(null);
    }
  };

  if (!user || user.role !== 'freelancer') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <LoadingSpinner size="lg" variant="primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">My Gigs</h1>
          <Link
            to="/gigs/create"
            className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Gig</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" variant="primary" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={loadGigs}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gigs.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="text-gray-600 dark:text-dark-300 mb-4">No gigs yet</p>
                <Link
                  to="/gigs/create"
                  className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create Your First Gig</span>
                </Link>
              </div>
            ) : (
              gigs.map((gig) => (
                <div
                  key={gig._id}
                  className="bg-white dark:bg-dark-800 rounded-lg shadow-md border border-gray-200 dark:border-dark-700 overflow-hidden"
                >
                  <div className="relative h-48 bg-gray-100 dark:bg-dark-700">
                    {gig.images && gig.images.length > 0 ? (
                      <img
                        src={gig.images[0]}
                        alt={gig.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Tag className="h-12 w-12 text-gray-400 dark:text-dark-400" />
                      </div>
                    )}

                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          gig.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}
                      >
                        {gig.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 flex space-x-2">
                      <Link
                        to={`/services/${gig._id}`}
                        className="p-2 bg-white/80 dark:bg-dark-800/80 hover:bg-white dark:hover:bg-dark-800 rounded-full"
                      >
                        <Eye className="h-4 w-4 text-gray-600 dark:text-dark-300" />
                      </Link>
                      <Link
                        to={`/gigs/${gig._id}/edit`}
                        className="p-2 bg-white/80 dark:bg-dark-800/80 hover:bg-white dark:hover:bg-dark-800 rounded-full"
                      >
                        <Edit className="h-4 w-4 text-gray-600 dark:text-dark-300" />
                      </Link>
                      <button
                        onClick={() => handleDeleteGig(gig._id)}
                        disabled={deletingGig === gig._id}
                        className="p-2 bg-white/80 dark:bg-dark-800/80 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full"
                      >
                        {deletingGig === gig._id ? (
                          <LoadingSpinner size="sm" variant="red" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {gig.title}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-dark-300 mb-4 line-clamp-2">
                      {gig.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1 text-gray-500 dark:text-dark-400">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm font-medium">${gig.price}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500 dark:text-dark-400">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{gig.deliveryTime} days</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-400 px-2 py-1 rounded">
                        {gig.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGigs;
