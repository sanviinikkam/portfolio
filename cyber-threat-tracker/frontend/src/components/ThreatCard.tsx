import React from 'react';
import { Threat } from '../types';
import { motion } from 'framer-motion';

interface ThreatCardProps {
  threat: Threat;
  onClick?: () => void;
}

const ThreatCard: React.FC<ThreatCardProps> = ({ threat, onClick }) => {
  const getSeverityClass = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'severity-high';
      case 'medium':
        return 'severity-medium';
      case 'low':
        return 'severity-low';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-red-600 bg-red-100';
      case 'investigating':
        return 'text-yellow-600 bg-yellow-100';
      case 'resolved':
        return 'text-green-600 bg-green-100';
      case 'false positive':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`card p-6 cursor-pointer hover:shadow-lg transition-all duration-200 ${
        onClick ? 'hover:border-primary-300' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityClass(threat.severity)}`}>
            {threat.severity}
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(threat.status)}`}>
            {threat.status}
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {formatDate(threat.time_detected)}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {threat.type}
      </h3>

      <div className="flex items-center text-sm text-gray-600 mb-3">
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {threat.city ? `${threat.city}, ${threat.country}` : threat.country}
      </div>

      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
        {threat.description}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {threat.creator?.name || 'Unknown'}
        </div>
        {threat.source && (
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            {threat.source}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ThreatCard;
