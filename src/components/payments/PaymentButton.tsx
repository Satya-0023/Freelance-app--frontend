import React, { useState } from 'react';
import { apiService } from '../../services/api';

interface PaymentButtonProps {
  gigId: string;
  price: number;
  requirements?: string;
  className?: string;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({ 
  gigId, 
  price, 
  requirements = '', 
  className = '' 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await apiService.createCheckoutSession({
        gigId,
        requirements
      });
      
      // Redirect to Stripe Checkout
      window.location.href = response.url;
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}
      <button
        onClick={handlePayment}
        disabled={loading}
        className={`w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? 'Processing...' : `Pay $${price}`}
      </button>
    </div>
  );
};

export default PaymentButton; 