import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, MessageCircle, User, Menu, X, LogOut, Settings, Briefcase, Moon, Sun, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileMenuOpen(false);
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm dark:bg-gray-800/95 shadow-lg border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group" data-cy="logo">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <Briefcase className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FreelanceHub</span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for services..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 backdrop-blur-sm"
                  data-cy="search-input"
                />
              </div>
            </form>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200"
              data-cy="theme-toggle"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <>
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-3">
                  {/* Create Gig Button for Freelancers */}
                  {user.role === 'freelancer' && (
                    <Link
                      to="/gigs/create"
                      className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2.5 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      data-cy="create-gig-link"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="font-medium">Create Gig</span>
                    </Link>
                  )}

                  {/* Messages with Badge */}
                  <Link
                    to="/messages"
                    className="relative p-2.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 group"
                    data-cy="messages-link"
                  >
                    <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                      +3
                    </span>
                  </Link>
                  
                  {/* Notifications with Badge */}
                  <Link
                    to="/notifications"
                    className="relative p-2.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 group"
                    data-cy="notifications-link"
                  >
                    <Bell className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                      +5
                    </span>
                  </Link>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center space-x-2 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group"
                      data-cy="profile-menu"
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.firstName}
                          className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-blue-300 dark:group-hover:ring-blue-600 transition-all duration-200"
                        />
                      ) : (
                        <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 transform group-hover:scale-105">
                          {user && user.firstName ? user.firstName.charAt(0) : ''}
                        </div>
                      )}
                      {user && user.firstName && (
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {user.firstName}
                        </span>
                      )}
                    </button>

                    {/* Profile Dropdown Menu */}
                    {isProfileMenuOpen && (
                      <div className="absolute right-0 mt-3 w-48 bg-white/95 backdrop-blur-sm dark:bg-gray-800/95 rounded-xl shadow-2xl py-2 z-50 border border-gray-100 dark:border-gray-700 animate-in slide-in-from-top-2" data-cy="profile-dropdown">
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                          data-cy="dashboard-link"
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                          data-cy="profile-link"
                        >
                          Profile
                        </Link>
                        {user.role === 'freelancer' && (
                          <Link
                            to="/my-gigs"
                            className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                            data-cy="my-gigs-link"
                          >
                            My Gigs
                          </Link>
                        )}
                        <Link
                          to="/orders"
                          className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                          data-cy="orders-link"
                        >
                          Orders
                        </Link>
                        <Link
                          to="/settings"
                          className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                          data-cy="settings-link"
                        >
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                          data-cy="logout-button"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                  data-cy="mobile-menu"
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </>
            ) : (
              <>
                {/* Guest Navigation */}
                <div className="hidden md:flex items-center space-x-3">
                  <Link
                    to="/services"
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                    data-cy="services-link"
                  >
                    Services
                  </Link>
                  <Link
                    to="/login"
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                    data-cy="login-link"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2.5 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                    data-cy="register-link"
                  >
                    Register
                  </Link>
                </div>

                {/* Mobile menu button for guests */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                  data-cy="mobile-menu"
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden animate-in slide-in-from-top-2" data-cy="mobile-nav">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-sm dark:bg-gray-800/95 border-t border-gray-100 dark:border-gray-700 rounded-b-xl shadow-lg">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2.5 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 rounded-lg"
                    data-cy="mobile-dashboard-link"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/services"
                    className="block px-3 py-2.5 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 rounded-lg"
                    data-cy="mobile-services-link"
                  >
                    Services
                  </Link>
                  {user.role === 'freelancer' && (
                    <Link
                      to="/gigs/create"
                      className="block px-3 py-2.5 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 rounded-lg"
                      data-cy="mobile-create-gig-link"
                    >
                      Create Gig
                    </Link>
                  )}
                  <Link
                    to="/orders"
                    className="block px-3 py-2.5 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 rounded-lg"
                    data-cy="mobile-orders-link"
                  >
                    Orders
                  </Link>
                  <Link
                    to="/messages"
                    className="block px-3 py-2.5 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 rounded-lg"
                    data-cy="mobile-messages-link"
                  >
                    Messages
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2.5 text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 rounded-lg"
                    data-cy="mobile-logout-button"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/services"
                    className="block px-3 py-2.5 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 rounded-lg"
                    data-cy="mobile-services-link"
                  >
                    Services
                  </Link>
                  <Link
                    to="/login"
                    className="block px-3 py-2.5 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 rounded-lg"
                    data-cy="mobile-login-link"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2.5 text-base font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 rounded-lg"
                    data-cy="mobile-register-link"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 