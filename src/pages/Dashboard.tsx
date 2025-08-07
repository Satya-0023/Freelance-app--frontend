import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Briefcase, ClipboardList, PlusCircle, ShoppingBag } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div className="p-8 text-center">You must be logged in to view the dashboard.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl shadow-lg p-8 flex items-center gap-6 mb-8 text-white">
        <div className="flex-shrink-0 h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
          {user.firstName?.charAt(0) || <User className="h-8 w-8" />}
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-1">Welcome, {user.firstName}!</h2>
          <p className="text-blue-100">Here’s your personalized dashboard. Quick actions and stats at a glance.</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {user.userType === 'freelancer' ? (
          <>
            <Link to="/gigs/create" className="group block bg-white rounded-xl shadow-md p-6 hover:shadow-lg border border-blue-100 transition-all">
              <div className="flex items-center gap-4 mb-2">
                <PlusCircle className="h-7 w-7 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-lg font-semibold text-gray-900">Create New Gig</span>
              </div>
              <p className="text-gray-500">Showcase your skills and attract clients by creating a new gig.</p>
            </Link>
            <Link to="/orders" className="group block bg-white rounded-xl shadow-md p-6 hover:shadow-lg border border-green-100 transition-all">
              <div className="flex items-center gap-4 mb-2">
                <ClipboardList className="h-7 w-7 text-green-600 group-hover:scale-110 transition-transform" />
                <span className="text-lg font-semibold text-gray-900">Orders for My Gigs</span>
              </div>
              <p className="text-gray-500">Manage orders placed for your gigs and track progress.</p>
            </Link>
            <Link to="/services" className="group block bg-white rounded-xl shadow-md p-6 hover:shadow-lg border border-gray-100 transition-all">
              <div className="flex items-center gap-4 mb-2">
                <Briefcase className="h-7 w-7 text-gray-600 group-hover:scale-110 transition-transform" />
                <span className="text-lg font-semibold text-gray-900">Browse All Services</span>
              </div>
              <p className="text-gray-500">Explore the marketplace and see what other freelancers offer.</p>
            </Link>
          </>
        ) : (
          <>
            <Link to="/orders" className="group block bg-white rounded-xl shadow-md p-6 hover:shadow-lg border border-green-100 transition-all">
              <div className="flex items-center gap-4 mb-2">
                <ShoppingBag className="h-7 w-7 text-green-600 group-hover:scale-110 transition-transform" />
                <span className="text-lg font-semibold text-gray-900">My Orders</span>
              </div>
              <p className="text-gray-500">View and manage all your service orders in one place.</p>
            </Link>
            <Link to="/services" className="group block bg-white rounded-xl shadow-md p-6 hover:shadow-lg border border-blue-100 transition-all">
              <div className="flex items-center gap-4 mb-2">
                <Briefcase className="h-7 w-7 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-lg font-semibold text-gray-900">Browse Services</span>
              </div>
              <p className="text-gray-500">Find the perfect freelancer for your next project.</p>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 