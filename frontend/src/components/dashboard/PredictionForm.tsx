import React, { useState, useEffect } from 'react';
import { featuresAPI, predictionsAPI } from '../../services/api';
import type { Prediction } from '../../types';
import { X, Brain, AlertCircle } from 'lucide-react';

interface PredictionFormProps {
  onClose: () => void;
  onComplete: (prediction: Prediction) => void;
}

export const PredictionForm: React.FC<PredictionFormProps> = ({ onClose, onComplete }) => {
  const [features, setFeatures] = useState<string[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const featuresData = await featuresAPI.getFeatures();
        setFeatures(featuresData);
        
        // Initialize form data with empty values
        const initialData: Record<string, any> = {};
        featuresData.forEach(feature => {
          initialData[feature] = '';
        });
        setFormData(initialData);
      } catch (err) {
        setError('Failed to load features');
      }
    };

    fetchFeatures();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convert string values to numbers where appropriate
      const processedData: Record<string, any> = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value === '') {
          processedData[key] = null;
        } else if (!isNaN(Number(value))) {
          processedData[key] = Number(value);
        } else {
          processedData[key] = value;
        }
      });

      const prediction = await predictionsAPI.predict(processedData);
      onComplete(prediction);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (feature: string, value: string) => {
    setFormData(prev => ({ ...prev, [feature]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Brain className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Create New Prediction</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {features.map((feature) => (
              <div key={feature}>
                <label 
                  htmlFor={feature} 
                  className="block text-sm font-medium text-gray-700 mb-1 capitalize"
                >
                  {feature.replace(/_/g, ' ')}
                </label>
                <input
                  type="text"
                  id={feature}
                  value={formData[feature] || ''}
                  onChange={(e) => handleInputChange(feature, e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                  placeholder={`Enter ${feature.replace(/_/g, ' ')}`}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Create Prediction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};