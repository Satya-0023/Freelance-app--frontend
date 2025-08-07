import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Upload, X, Plus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { showSuccessToast, showErrorToast, safeShowToast } from '../utils/toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface Category {
  id: string;
  name: string;
}

const CreateGig: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [deliveryTime, setDeliveryTime] = useState(1);
  const [price, setPrice] = useState(5);
  const [tags, setTags] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();


  useEffect(() => {
    // Redirect if not a freelancer
    if (user && user.role !== 'freelancer') {
      safeShowToast('error', 'Access Denied', 'Only freelancers can create gigs.');
      navigate('/services');
      return;
    }
    fetchCategories();
  }, [user, navigate]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await apiService.getCategories();
      if (response && Array.isArray(response)) {
        setCategories(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        console.error('Invalid categories response:', response);
        // Fallback to default categories
        const fallbackCategories = [
          { id: '1', name: 'Graphics & Design' },
          { id: '2', name: 'Programming & Tech' },
          { id: '3', name: 'Digital Marketing' },
          { id: '4', name: 'Writing & Translation' },
          { id: '5', name: 'Video & Animation' },
          { id: '6', name: 'Music & Audio' }
        ];
        setCategories(fallbackCategories);
        safeShowToast('warning', 'Warning', 'Using default categories. Some features may be limited.');
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      // Fallback to default categories
      const fallbackCategories = [
        { id: '1', name: 'Graphics & Design' },
        { id: '2', name: 'Programming & Tech' },
        { id: '3', name: 'Digital Marketing' },
        { id: '4', name: 'Writing & Translation' },
        { id: '5', name: 'Video & Animation' },
        { id: '6', name: 'Music & Audio' }
      ];
      setCategories(fallbackCategories);
      safeShowToast('warning', 'Warning', 'Using default categories. Some features may be limited.');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    console.log('📁 Selected files:', files.map(f => ({ name: f.name, type: f.type, size: f.size })));
    
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      
      if (!isValidType) {
        console.log('❌ Invalid file type:', file.type, 'for file:', file.name);
        setError(`Invalid file type: ${file.name}. Only image files are allowed.`);
        return false;
      }
      
      if (!isValidSize) {
        console.log('❌ File too large:', file.size, 'for file:', file.name);
        setError(`File too large: ${file.name}. Maximum size is 5MB.`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length + images.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    console.log('✅ Valid files:', validFiles.map(f => f.name));
    setImages(prev => [...prev, ...validFiles]);
    setError(''); // Clear any previous errors
    
    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrls(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!title.trim()) {
      setError('Title is required');
      setLoading(false);
      return;
    }
    if (!description.trim()) {
      setError('Description is required');
      setLoading(false);
      return;
    }
    if (!category) {
      setError('Category is required');
      setLoading(false);
      return;
    }
    if (price < 5) {
      setError('Minimum price is $5');
      setLoading(false);
      return;
    }

    try {
      // Upload images first
      const uploadedImages: string[] = [];
      for (const image of images) {
        try {
          const formData = new FormData();
          formData.append('image', image);
          const uploadResponse = await apiService.uploadImage(formData);
          if (uploadResponse.data && uploadResponse.data.url) {
            uploadedImages.push(uploadResponse.data.url);
          } else {
            throw new Error('Invalid upload response');
          }
        } catch (uploadError: any) {
          console.error('Image upload error:', uploadError);
          setError(`Failed to upload image: ${uploadError.message}`);
          setLoading(false);
          return;
        }
      }

      const data = {
        title: title.trim(),
        description: description.trim(),
        category,
        price: Number(price),
        deliveryTime: Number(deliveryTime),
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        images: uploadedImages,
      };

      const res = await apiService.createGig(data);
      setSuccess(true);
      safeShowToast('success', 'Success', 'Gig created successfully!');
      setTimeout(() => {
        navigate(`/services/${res.data._id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create gig');
      safeShowToast('error', 'Error', 'Failed to create gig. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'freelancer') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" variant="primary" />
          <p className="mt-4 text-gray-600 dark:text-dark-300">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-6">
          {/* Header */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/services')}
              className="mr-4 p-2 text-gray-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create a New Gig</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block font-semibold mb-2 text-gray-700 dark:text-dark-200">Gig Title *</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="I will create a professional logo design"
                required 
                className="w-full border border-gray-300 dark:border-dark-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-dark-400" 
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold mb-2 text-gray-700 dark:text-dark-200">Description *</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Describe what you will deliver, your process, and why clients should choose you..."
                required 
                rows={6}
                className="w-full border border-gray-300 dark:border-dark-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-dark-400" 
              />
            </div>

            {/* Category and Price Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2 text-gray-700 dark:text-dark-200">Category *</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)} 
                  required 
                  disabled={categoriesLoading}
                  className="w-full border border-gray-300 dark:border-dark-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-dark-600"
                >
                  <option value="">{categoriesLoading ? 'Loading categories...' : 'Select a category'}</option>
                  {categoriesLoading ? (
                    <option value="" disabled>Loading categories...</option>
                  ) : categories.length === 0 ? (
                    <option value="" disabled>No categories found. Please try again later.</option>
                  ) : (
                    categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700 dark:text-dark-200">Price ($) *</label>
                <input 
                  type="number" 
                  value={price} 
                  min={5} 
                  onChange={e => setPrice(Number(e.target.value))} 
                  required 
                  className="w-full border border-gray-300 dark:border-dark-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white" 
                />
              </div>
            </div>

            {/* Delivery Time and Tags Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2 text-gray-700 dark:text-dark-200">Delivery Time (days) *</label>
                <input 
                  type="number" 
                  value={deliveryTime} 
                  min={1} 
                  onChange={e => setDeliveryTime(Number(e.target.value))} 
                  required 
                  className="w-full border border-gray-300 dark:border-dark-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white" 
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700 dark:text-dark-200">Tags</label>
                <input 
                  type="text" 
                  value={tags} 
                  onChange={e => setTags(e.target.value)} 
                  placeholder="design, logo, branding (comma separated)"
                  className="w-full border border-gray-300 dark:border-dark-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-dark-400" 
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block font-semibold mb-2 text-gray-700 dark:text-dark-200">Images (Optional)</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/tiff"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-dark-400" />
                  <p className="mt-2 text-sm text-gray-600 dark:text-dark-400">
                    Click to upload images (max 5, 5MB each)
                  </p>
                </label>
              </div>
              
              {/* Image Previews */}
              {imageUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={url} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/services')}
                className="px-6 py-3 border border-gray-300 dark:border-dark-600 rounded-lg text-gray-700 dark:text-dark-200 hover:bg-gray-50 dark:hover:bg-dark-700"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" variant="white" />
                    <span className="ml-2">Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Gig
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
                Gig created successfully! Redirecting...
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGig;