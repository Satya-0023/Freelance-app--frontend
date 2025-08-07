import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { User, Mail, Phone, MapPin, Edit, Save, X, Camera, Loader } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Profile: React.FC = () => {
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userDetails, setUserDetails] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    skills: [] as string[],
    portfolio: ''
  });

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      setFetchingUser(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        showErrorToast('Authentication Error', 'Please log in to view your profile.');
        setFetchingUser(false);
        return;
      }

      const response = await apiService.getMe(token);
      console.log('Profile fetch response:', response); // Debug log
      
      if (response.success && response.data && response.data.user) {
        const userData = response.data.user;
        setUserDetails(userData);
        
        // Handle different possible data structures
        const firstName = userData.profile?.firstName || userData.firstName || '';
        const lastName = userData.profile?.lastName || userData.lastName || '';
        const email = userData.email || '';
        const phone = userData.profile?.phone || '';
        const location = userData.profile?.location || '';
        const bio = userData.profile?.bio || '';
        const skills = userData.profile?.skills || [];
        const portfolio = userData.profile?.portfolio || userData.profile?.website || '';
        
        setFormData({
          firstName,
          lastName,
          email,
          phone,
          location,
          bio,
          skills,
          portfolio
        });
      } else {
        setError('Failed to fetch user details. Please try again.');
        showErrorToast('Error', 'Failed to fetch user details.');
      }
    } catch (err: any) {
      console.error('Error fetching user details:', err);
      setError('Failed to fetch user details. Please try again.');
      showErrorToast('Error', 'Failed to fetch user details.');
    } finally {
      setFetchingUser(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setFormData(prev => ({ ...prev, skills }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        skills: formData.skills,
        portfolio: formData.portfolio
      };

      const response = await apiService.updateProfile(token, updateData);
      
      if (response.success) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        showSuccessToast('Success', 'Profile updated successfully!');
        // Refresh user details
        await fetchUserDetails();
      } else {
        setError(response.message || 'Failed to update profile');
        showErrorToast('Error', response.message || 'Failed to update profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      showErrorToast('Error', err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    // Reset form data to current user details
    if (userDetails) {
      const firstName = userDetails.profile?.firstName || userDetails.firstName || '';
      const lastName = userDetails.profile?.lastName || userDetails.lastName || '';
      const email = userDetails.email || '';
      const phone = userDetails.profile?.phone || '';
      const location = userDetails.profile?.location || '';
      const bio = userDetails.profile?.bio || '';
      const skills = userDetails.profile?.skills || [];
      const portfolio = userDetails.profile?.portfolio || userDetails.profile?.website || '';
      
      setFormData({
        firstName,
        lastName,
        email,
        phone,
        location,
        bio,
        skills,
        portfolio
      });
    }
  };

  if (fetchingUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600 dark:text-dark-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Profile</h1>
          <p className="text-gray-600 dark:text-dark-300">You must be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
            <p className="text-gray-600 dark:text-dark-300 mt-2">Manage your account information and preferences</p>
          </div>
          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{loading ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="h-32 w-32 bg-primary-600 text-white rounded-full flex items-center justify-center text-4xl font-bold mx-auto">
                    {userDetails?.profile?.firstName?.charAt(0) || userDetails?.firstName?.charAt(0) || <User className="h-16 w-16" />}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 h-8 w-8 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors">
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">
                  {userDetails?.profile?.firstName || userDetails?.firstName} {userDetails?.profile?.lastName || userDetails?.lastName}
                </h2>
                <p className="text-gray-600 dark:text-dark-400">{userDetails?.role || 'User'}</p>
                <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">
                  {userDetails?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-dark-700 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-dark-700 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-dark-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={true}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-dark-700 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-dark-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-dark-700 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-dark-400" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="City, Country"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-dark-700 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-dark-700 bg-white dark:bg-dark-700 text-gray-900 dark:text-white resize-none"
                  />
                </div>

                {/* Skills */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills.join(', ')}
                    onChange={handleSkillsChange}
                    disabled={!isEditing}
                    placeholder="JavaScript, React, Node.js"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-dark-700 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Portfolio */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="https://your-portfolio.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-dark-700 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 