import React from 'react';
import type { Prediction } from '../../types/index.ts';
import { Calendar, TrendingUp, AlertCircle } from 'lucide-react';

interface PredictionHistoryProps {
  predictions: Prediction[];
  showPatientInfo?: boolean;
}

export const PredictionHistory: React.FC<PredictionHistoryProps> = ({ 
  predictions, 
  showPatientInfo = false 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-800 bg-green-100';
      case 'processing':
        return 'text-yellow-800 bg-yellow-100';
      case 'failed':
        return 'text-red-800 bg-red-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (predictions.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No predictions yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating your first prediction.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {predictions.map((prediction) => (
        <div key={prediction.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{formatDate(prediction.created_at)}</span>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(prediction.status)}`}>
                  {prediction.status}
                </span>
              </div>
              
              {showPatientInfo && (
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Patient ID: {prediction.id}
                </p>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Result:</span>
                  <span className="ml-2 text-gray-900">{prediction.result}</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="font-medium text-gray-700">Confidence:</span>
                  <span className={`ml-2 font-medium ${getConfidenceColor(prediction.confidence)}`}>
                    {prediction.confidence}%
                  </span>
                </div>
              </div>
              
              {/* Feature Summary */}
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Input Features:</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(prediction.features).slice(0, 3).map(([key, value]) => (
                    <span 
                      key={key} 
                      className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                    >
                      {key}: {String(value)}
                    </span>
                  ))}
                  {Object.keys(prediction.features).length > 3 && (
                    <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      +{Object.keys(prediction.features).length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};