import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import type { Service, Review } from '../types';
import { Star, User, CheckCircle, Clock, DollarSign, X } from 'lucide-react';
import { motion } from 'framer-motion';
import ImageGallery from '../components/services/ImageGallery';

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiService.getServiceById(id!);
        setService(res.service || null);
      } catch (err) {
        setError('Failed to load service.');
      } finally {
        setLoading(false);
      }
    };
    const fetchReviews = async () => {
      try {
        const res = await apiService.getReviewsForService(id!);
        setReviews(res.data || []);
      } catch (err) {
        setReviews([]);
      }
    };
    if (id) {
      fetchService();
      fetchReviews();
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!service) return <div className="p-8 text-center">Service not found.</div>;

  const handlePurchase = () => {
    setShowOrderForm(true);
    setOrderError('');
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service || !selectedTier) return;
    setOrderLoading(true);
    setOrderError('');
    try {
      const pricing = service.pricing.find(p => p.id === selectedTier);
      if (!pricing) {
        setOrderError('Selected pricing tier not found');
        return;
      }
      
      // Use the existing Stripe checkout session API
      const res = await apiService.createCheckoutSession({
        gigId: service.id, // Use service.id as gigId
        requirements: `Selected Package: ${pricing.title} - $${pricing.price}`
      });
      
             if (res.success && res.url) {
         // Redirect to Stripe checkout or test success page
         window.location.href = res.url;
       } else {
         setOrderError('Failed to create payment session');
       }
    } catch (err: any) {
      setOrderError(err.message || 'Failed to create order');
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="min-h-screen max-w-4xl mx-auto py-10 px-4">
      {/* Service Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 flex flex-col md:flex-row gap-8">
        {/* Images */}
        <div className="flex-shrink-0 w-full md:w-72">
          <ImageGallery images={service.images} title={service.title} />
        </div>
        {/* Info */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900">{service.title}</h1>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 text-yellow-500 font-semibold"><Star className="h-5 w-5" /> {service.rating?.toFixed(1) || 'N/A'}</span>
              <span className="text-gray-400">({service.totalReviews} reviews)</span>
            </div>
            <div className="mb-2 text-blue-600 font-medium">Category: {service.category}</div>
            <div className="mb-4 text-gray-700">{service.description}</div>
                         <div className="flex flex-wrap gap-2 mb-4">
               {service.tags && service.tags.length > 0 ? (
                 service.tags.map(tag => (
                   <span key={tag} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">#{tag}</span>
                 ))
               ) : (
                 <span className="text-gray-500 text-sm">No tags available</span>
               )}
             </div>
          </div>
          {/* Freelancer Info */}
          <div className="flex items-center gap-4 mt-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
              {service.freelancer?.firstName?.charAt(0) || <User className="h-6 w-6" />}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{service.freelancer?.firstName} {service.freelancer?.lastName}</div>
              <div className="text-xs text-gray-500">{service.freelancer?.email}</div>
            </div>
            <span className="ml-auto flex items-center gap-1 text-green-600 font-medium"><CheckCircle className="h-4 w-4" /> Verified</span>
          </div>
        </div>
      </div>
      {/* Pricing Tiers */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Pricing</h2>
                 {service.pricing && service.pricing.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {service.pricing.map((tier) => (
               <div key={tier.id} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow p-6 flex flex-col gap-2 border border-blue-100">
                 <div className="flex items-center gap-2 mb-2">
                   <DollarSign className="h-5 w-5 text-blue-500" />
                   <span className="text-lg font-bold text-gray-900">{tier.title}</span>
                   <span className="ml-auto text-blue-600 font-semibold text-lg">${tier.price}</span>
                 </div>
                 <div className="text-gray-700 mb-1">{tier.description}</div>
                 <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><Clock className="h-4 w-4" /> Delivery: {tier.deliveryTime} days</div>
                 <div className="flex items-center gap-2 text-sm text-gray-500 mb-1"><CheckCircle className="h-4 w-4" /> Revisions: {tier.revisions}</div>
                 {tier.features && tier.features.length > 0 && (
                   <ul className="list-disc list-inside text-xs text-gray-500 mb-2">
                     {tier.features.map((f, i) => <li key={i}>{f}</li>)}
                   </ul>
                 )}
                 <button onClick={handlePurchase} className="mt-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Purchase</button>
               </div>
             ))}
           </div>
         ) : (
           <div className="text-gray-500">No pricing information available.</div>
         )}
      </motion.div>
      {/* Purchase Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2 }} className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowOrderForm(false)}><X className="h-6 w-6" /></button>
            <h3 className="text-xl font-bold mb-4">Confirm Purchase</h3>
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Select Pricing Tier</label>
                                 <select value={selectedTier} onChange={e => setSelectedTier(e.target.value)} required className="w-full border rounded px-3 py-2">
                   <option value="">Select a package...</option>
                   {service.pricing && service.pricing.length > 0 ? (
                     service.pricing.map(tier => (
                       <option key={tier.id} value={tier.id}>{tier.title} - ${tier.price}</option>
                     ))
                   ) : (
                     <option value="" disabled>No packages available</option>
                   )}
                 </select>
              </div>
              <button type="submit" disabled={orderLoading} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full">
                {orderLoading ? 'Placing Order...' : 'Place Order'}
              </button>
              {orderError && <div className="text-red-500 mt-2">{orderError}</div>}
            </form>
          </motion.div>
        </div>
      )}
      {/* Reviews Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="mt-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Reviews</h2>
                 {reviews && reviews.length > 0 ? (
           <ul>
             {reviews.map((review) => (
               <li key={review.id} className="mb-6 border-b pb-4">
                 <div className="flex items-center mb-1 gap-2">
                   <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600">
                     {review.client?.firstName?.charAt(0) || <User className="h-4 w-4" />}
                   </div>
                   <span className="font-semibold mr-2">{review.client?.firstName} {review.client?.lastName}</span>
                   <span className="text-yellow-500 font-bold flex items-center gap-1"><Star className="h-4 w-4" /> {review.rating}★</span>
                   <span className="ml-2 text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                 </div>
                 <div className="text-gray-700 mt-1">{review.comment}</div>
               </li>
             ))}
           </ul>
         ) : (
           <div className="text-gray-500">No reviews yet.</div>
         )}
      </motion.div>
    </motion.div>
  );
};

export default ServiceDetail; 