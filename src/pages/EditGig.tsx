import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import type { Service, Category } from '../types';

const EditGig: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [gig, setGig] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // TODO: Fetch categories from API if needed
  const categories: Category[] = [];

  useEffect(() => {
    const fetchGig = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiService.getServiceById(id!);
        setGig(res.service || null);
      } catch (err) {
        setError('Failed to load gig');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchGig();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!gig) return;
      const data = {
        title: gig.title,
        description: gig.description,
        category: gig.category,
        price: gig.pricing[0]?.price || 5,
        deliveryTime: gig.deliveryTime,
        tags: gig.tags,
        images: gig.images,
      };
      await apiService.updateGig(id!, data);
      setSuccess(true);
      navigate(`/services/${id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update gig');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!gig) return <div className="p-8 text-center">Gig not found.</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Edit Gig</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input type="text" value={gig.title} onChange={e => setGig({ ...gig, title: e.target.value })} required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea value={gig.description} onChange={e => setGig({ ...gig, description: e.target.value })} required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Category</label>
          <input type="text" value={gig.category} onChange={e => setGig({ ...gig, category: e.target.value })} required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Price ($)</label>
          <input type="number" value={gig.pricing[0]?.price || 5} onChange={e => setGig({ ...gig, pricing: [{ ...gig.pricing[0], price: Number(e.target.value) }] })} required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Delivery Time (days)</label>
          <input type="number" value={gig.deliveryTime} onChange={e => setGig({ ...gig, deliveryTime: Number(e.target.value) })} required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block font-medium mb-1">Tags (comma separated)</label>
          <input type="text" value={gig.tags.join(', ')} onChange={e => setGig({ ...gig, tags: e.target.value.split(',').map(t => t.trim()) })} className="w-full border rounded px-3 py-2" />
        </div>
        {/* TODO: Add image upload */}
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          {loading ? 'Updating...' : 'Update Gig'}
        </button>
        {error && <div className="text-red-500 mt-2">{error}</div>}
        {success && <div className="text-green-600 mt-2">Gig updated successfully!</div>}
      </form>
    </div>
  );
};

export default EditGig; 