import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-16">
    <h1 className="text-5xl font-bold text-blue-600 mb-4">404</h1>
    <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
    <p className="text-gray-500 mb-6">Sorry, the page you are looking for does not exist or has been moved.</p>
    <Link to="/dashboard" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">Go to Dashboard</Link>
  </div>
);

export default NotFound; 