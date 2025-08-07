import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, Clock } from 'lucide-react';
import type { Service } from '../../types';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const minPrice = Math.min(...service.pricing.map(p => p.price));

  return (
    <div 
      className="bg-white dark:bg-dark-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-200 dark:border-dark-700"
      data-cy="service-card"
    >
      <Link to={`/services/${service.id}`}>
        <div className="relative">
          <img
            src={service.images[0] || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg'}
            alt={service.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            data-cy="service-image"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg';
            }}
          />
          <button 
            className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-dark-800/80 hover:bg-white dark:hover:bg-dark-800 rounded-full transition-colors"
            data-cy="favorite-button"
            aria-label="Add to favorites"
          >
            <Heart className="h-4 w-4 text-gray-600 dark:text-dark-300 hover:text-red-500" />
          </button>
        </div>
      </Link>

      <div className="p-4">
        {/* Freelancer Info */}
        <div className="flex items-center space-x-2 mb-3">
          {service.freelancer.avatar ? (
            <img
              src={service.freelancer.avatar}
              alt={service.freelancer.firstName}
              className="h-8 w-8 rounded-full object-cover"
              data-cy="freelancer-avatar"
            />
          ) : (
            <div 
              className="h-8 w-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium"
              data-cy="freelancer-avatar"
            >
              {service.freelancer.firstName.charAt(0)}
            </div>
          )}
          <div>
            <p 
              className="text-sm font-medium text-gray-900 dark:text-white"
              data-cy="freelancer-name"
            >
              {service.freelancer.firstName} {service.freelancer.lastName}
            </p>
            <p className="text-xs text-gray-500 dark:text-dark-400">Level 2 Seller</p>
          </div>
        </div>

        {/* Service Title */}
        <Link to={`/services/${service.id}`}>
          <h3 
            className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            data-cy="service-title"
          >
            {service.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center space-x-1 mb-3">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span 
            className="text-sm font-medium text-gray-900 dark:text-white"
            data-cy="service-rating"
          >
            {service.rating.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500 dark:text-dark-400">
            ({service.totalReviews})
          </span>
        </div>

        {/* Tags */}
        {service.tags && service.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {service.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-dark-300 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-gray-500 dark:text-dark-400">
            <Clock className="h-4 w-4" />
            <span className="text-xs">{service.deliveryTime} days</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-dark-400">Starting at</p>
            <p 
              className="text-lg font-bold text-gray-900 dark:text-white"
              data-cy="service-price"
            >
              ${minPrice}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
