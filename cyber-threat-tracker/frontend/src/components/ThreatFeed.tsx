import React, { useState, useEffect } from 'react';
import { Threat, FilterOptions } from '../types';
import { threatsAPI } from '../services/api';
import { useWebSocket } from '../contexts/WebSocketContext';
import ThreatCard from './ThreatCard';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface ThreatFeedProps {
  filters?: FilterOptions;
  onThreatClick?: (threat: Threat) => void;
  showFilters?: boolean;
}

const ThreatFeed: React.FC<ThreatFeedProps> = ({ 
  filters = {}, 
  onThreatClick,
  showFilters = true 
}) => {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const { socket, isConnected } = useWebSocket();

  // Load threats
  const loadThreats = async (page = 1, resetList = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await threatsAPI.getThreats({
        ...filters,
        page,
        limit: 20,
        sortBy: 'time_detected',
        sortOrder: 'DESC',
      });

      if (response.success && response.data) {
        const { threats: newThreats, pagination } = response.data;
        
        if (resetList || page === 1) {
          setThreats(newThreats);
        } else {
          setThreats(prev => [...prev, ...newThreats]);
        }

        setCurrentPage(pagination.currentPage);
        setTotalPages(pagination.totalPages);
        setTotalItems(pagination.totalItems);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load threats');
      toast.error('Failed to load threats');
    } finally {
      setLoading(false);
    }
  };

  // Initial load and reload on filter changes
  useEffect(() => {
    loadThreats(1, true);
  }, [filters]);

  // WebSocket listeners for real-time updates
  useEffect(() => {
    if (socket && isConnected) {
      const handleNewThreat = (threat: Threat) => {
        setThreats(prev => [threat, ...prev]);
        setTotalItems(prev => prev + 1);
        toast.success('New threat detected!', {
          duration: 3000,
        });
      };

      const handleThreatUpdate = (updatedThreat: Threat) => {
        setThreats(prev => 
          prev.map(threat => 
            threat.id === updatedThreat.id ? updatedThreat : threat
          )
        );
      };

      const handleThreatDelete = (threatId: string) => {
        setThreats(prev => prev.filter(threat => threat.id !== threatId));
        setTotalItems(prev => prev - 1);
      };

      socket.on('new-threat', handleNewThreat);
      socket.on('threat-updated', handleThreatUpdate);
      socket.on('threat-deleted', handleThreatDelete);

      return () => {
        socket.off('new-threat', handleNewThreat);
        socket.off('threat-updated', handleThreatUpdate);
        socket.off('threat-deleted', handleThreatDelete);
      };
    }
  }, [socket, isConnected]);

  const loadMore = () => {
    if (currentPage < totalPages && !loading) {
      loadThreats(currentPage + 1, false);
    }
  };

  if (loading && threats.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading threats...</p>
        </div>
      </div>
    );
  }

  if (error && threats.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => loadThreats(1, true)}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Threat Feed
            {isConnected && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                Live
              </span>
            )}
          </h2>
          <p className="text-gray-600 mt-1">
            {totalItems} threats found
          </p>
        </div>
        
        <button
          onClick={() => loadThreats(1, true)}
          className="btn-secondary flex items-center"
          disabled={loading}
        >
          <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Threats Grid */}
      {threats.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No threats found</h3>
          <p className="text-gray-600">No threats match your current filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {threats.map((threat, index) => (
                <motion.div
                  key={threat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ThreatCard
                    threat={threat}
                    onClick={() => onThreatClick?.(threat)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Load More Button */}
          {currentPage < totalPages && (
            <div className="text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="btn-secondary flex items-center mx-auto"
              >
                {loading ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    Load More
                    <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ThreatFeed;
