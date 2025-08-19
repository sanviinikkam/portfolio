import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { threatsAPI } from '../services/api';
import { ThreatFormData } from '../types';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const schema = yup.object().shape({
  type: yup
    .string()
    .required('Threat type is required')
    .oneOf(['DDoS', 'Phishing', 'Malware', 'Ransomware', 'Data Breach', 'SQL Injection', 'XSS', 'Social Engineering', 'Other']),
  location: yup
    .string()
    .required('Location is required')
    .min(1, 'Location cannot be empty')
    .max(255, 'Location must be less than 255 characters'),
  country: yup
    .string()
    .required('Country is required')
    .min(1, 'Country cannot be empty')
    .max(100, 'Country must be less than 100 characters'),
  city: yup
    .string()
    .max(100, 'City must be less than 100 characters')
    .optional(),
  latitude: yup
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .optional(),
  longitude: yup
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .optional(),
  severity: yup
    .string()
    .required('Severity is required')
    .oneOf(['Low', 'Medium', 'High']),
  time_detected: yup
    .string()
    .required('Time detected is required'),
  description: yup
    .string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  status: yup
    .string()
    .oneOf(['Active', 'Investigating', 'Resolved', 'False Positive'])
    .optional(),
  source: yup
    .string()
    .max(100, 'Source must be less than 100 characters')
    .optional(),
});

const SubmitThreat: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ThreatFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      time_detected: new Date().toISOString().slice(0, 16),
      severity: 'Medium',
      status: 'Active',
    },
  });

  // Check if user has permission to submit threats
  if (user?.role === 'viewer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card p-8 text-center max-w-md">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to submit threats. Only analysts and admins can create threat reports.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ThreatFormData) => {
    try {
      setIsSubmitting(true);
      const response = await threatsAPI.createThreat(data);
      
      if (response.success) {
        toast.success('Threat submitted successfully!');
        reset();
        navigate('/dashboard');
      } else {
        throw new Error(response.message || 'Failed to submit threat');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to submit threat';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900">Submit New Threat</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Report a Cyber Threat</h2>
            <p className="text-gray-600">
              Provide detailed information about the cyber threat you've detected. All fields marked with * are required.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Threat Type and Severity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Threat Type *
                </label>
                <select
                  {...register('type')}
                  id="type"
                  className={`input-field ${errors.type ? 'border-red-500' : ''}`}
                >
                  <option value="">Select threat type</option>
                  <option value="DDoS">DDoS Attack</option>
                  <option value="Phishing">Phishing</option>
                  <option value="Malware">Malware</option>
                  <option value="Ransomware">Ransomware</option>
                  <option value="Data Breach">Data Breach</option>
                  <option value="SQL Injection">SQL Injection</option>
                  <option value="XSS">Cross-Site Scripting (XSS)</option>
                  <option value="Social Engineering">Social Engineering</option>
                  <option value="Other">Other</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-2">
                  Severity Level *
                </label>
                <select
                  {...register('severity')}
                  id="severity"
                  className={`input-field ${errors.severity ? 'border-red-500' : ''}`}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                {errors.severity && (
                  <p className="mt-1 text-sm text-red-600">{errors.severity.message}</p>
                )}
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Location Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    {...register('country')}
                    type="text"
                    id="country"
                    className={`input-field ${errors.country ? 'border-red-500' : ''}`}
                    placeholder="e.g., United States"
                  />
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    {...register('city')}
                    type="text"
                    id="city"
                    className={`input-field ${errors.city ? 'border-red-500' : ''}`}
                    placeholder="e.g., New York"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Specific Location *
                </label>
                <input
                  {...register('location')}
                  type="text"
                  id="location"
                  className={`input-field ${errors.location ? 'border-red-500' : ''}`}
                  placeholder="e.g., Corporate office, Data center, etc."
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude (optional)
                  </label>
                  <input
                    {...register('latitude', { valueAsNumber: true })}
                    type="number"
                    step="any"
                    id="latitude"
                    className={`input-field ${errors.latitude ? 'border-red-500' : ''}`}
                    placeholder="e.g., 40.7128"
                  />
                  {errors.latitude && (
                    <p className="mt-1 text-sm text-red-600">{errors.latitude.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude (optional)
                  </label>
                  <input
                    {...register('longitude', { valueAsNumber: true })}
                    type="number"
                    step="any"
                    id="longitude"
                    className={`input-field ${errors.longitude ? 'border-red-500' : ''}`}
                    placeholder="e.g., -74.0060"
                  />
                  {errors.longitude && (
                    <p className="mt-1 text-sm text-red-600">{errors.longitude.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Threat Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Threat Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="time_detected" className="block text-sm font-medium text-gray-700 mb-2">
                    Time Detected *
                  </label>
                  <input
                    {...register('time_detected')}
                    type="datetime-local"
                    id="time_detected"
                    className={`input-field ${errors.time_detected ? 'border-red-500' : ''}`}
                  />
                  {errors.time_detected && (
                    <p className="mt-1 text-sm text-red-600">{errors.time_detected.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    {...register('status')}
                    id="status"
                    className={`input-field ${errors.status ? 'border-red-500' : ''}`}
                  >
                    <option value="Active">Active</option>
                    <option value="Investigating">Under Investigation</option>
                    <option value="Resolved">Resolved</option>
                    <option value="False Positive">False Positive</option>
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
                  Source (optional)
                </label>
                <input
                  {...register('source')}
                  type="text"
                  id="source"
                  className={`input-field ${errors.source ? 'border-red-500' : ''}`}
                  placeholder="e.g., Security scanner, User report, etc."
                />
                {errors.source && (
                  <p className="mt-1 text-sm text-red-600">{errors.source.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  {...register('description')}
                  id="description"
                  rows={6}
                  className={`input-field resize-none ${errors.description ? 'border-red-500' : ''}`}
                  placeholder="Provide a detailed description of the threat, including any relevant technical details, impact assessment, and recommended actions..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Minimum 10 characters, maximum 1000 characters
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Submit Threat Report
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default SubmitThreat;
