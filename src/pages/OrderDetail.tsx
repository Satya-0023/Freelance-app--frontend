import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import type { Order } from '../types';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiService.getOrderById(id!);
        setOrder(res.data || null);
      } catch (err: any) {
        if (err.message.includes('404')) {
          setOrder(null); // This will trigger "Order not found." message
        } else {
          setError('Failed to load order');
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!order) return <div className="p-8 text-center">Order not found.</div>;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Order Details</h1>
      <div className="mb-2">Service: {order.gig?.title || 'N/A'}</div>
      <div className="mb-2">Freelancer: {order.seller?.profile?.firstName} {order.seller?.profile?.lastName}</div>
      <div className="mb-2">Client: {order.buyer?.profile?.firstName} {order.buyer?.profile?.lastName}</div>
      <div className="mb-2">Price: ${order.price}</div>
      <div className="mb-2">
        Status: 
        <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
          order.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
          order.status === 'Delivered' ? 'bg-purple-100 text-purple-800' :
          order.status === 'Completed' ? 'bg-green-100 text-green-800' :
          order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {order.status}
        </span>
      </div>
      <div className="mb-2">Created: {new Date(order.createdAt).toLocaleString()}</div>
      {/* Add more order details as needed */}
      <Link to={`/orders/${order._id}/messages`} className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Message</Link>
    </div>
  );
};

export default OrderDetail; 