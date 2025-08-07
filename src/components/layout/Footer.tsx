import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 dark:bg-dark-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-primary-600 text-white p-2 rounded-lg">
                <Briefcase className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold">FreelanceHub</span>
            </div>
            <p className="text-gray-400 dark:text-dark-300 text-sm">
              The world's largest marketplace for creative and professional services.
              Find the perfect freelancer for your project today.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 dark:text-dark-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 dark:text-dark-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 dark:text-dark-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 dark:text-dark-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-gray-400 dark:text-dark-300">
              <li><Link to="/categories/graphics-design" className="hover:text-white transition-colors">Graphics & Design</Link></li>
              <li><Link to="/categories/programming-tech" className="hover:text-white transition-colors">Programming & Tech</Link></li>
              <li><Link to="/categories/digital-marketing" className="hover:text-white transition-colors">Digital Marketing</Link></li>
              <li><Link to="/categories/writing-translation" className="hover:text-white transition-colors">Writing & Translation</Link></li>
              <li><Link to="/categories/video-animation" className="hover:text-white transition-colors">Video & Animation</Link></li>
              <li><Link to="/categories/music-audio" className="hover:text-white transition-colors">Music & Audio</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400 dark:text-dark-300">
              <li><Link to="/help" className="hover:text-white transition-colors">Help & Support</Link></li>
              <li><Link to="/trust-safety" className="hover:text-white transition-colors">Trust & Safety</Link></li>
              <li><Link to="/selling" className="hover:text-white transition-colors">Selling on FreelanceHub</Link></li>
              <li><Link to="/buying" className="hover:text-white transition-colors">Buying on FreelanceHub</Link></li>
              <li><Link to="/community" className="hover:text-white transition-colors">Community</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400 dark:text-dark-300">
              <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="/press" className="hover:text-white transition-colors">Press & News</Link></li>
              <li><Link to="/partnerships" className="hover:text-white transition-colors">Partnerships</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 dark:border-dark-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 dark:text-dark-300 text-sm">
            © 2024 FreelanceHub. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/terms" className="text-gray-400 dark:text-dark-300 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-gray-400 dark:text-dark-300 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/cookies" className="text-gray-400 dark:text-dark-300 hover:text-white text-sm transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 