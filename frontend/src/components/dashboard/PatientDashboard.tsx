import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { PredictionHistory } from './PredictionHistory';
import { PredictionForm } from './PredictionForm';
import { ConsentCard } from './ConsentCard';
import { FAQSection } from './FAQSection';
import { HospitalList } from './HospitalList';
import type { Prediction, FAQ, Hospital } from '../../types';
import { predictionsAPI, generalAPI } from '../../services/api';
import { Plus, Download, Activity } from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [showPredictionForm, setShowPredictionForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [predictionsData, faqsData, hospitalsData] = await Promise.all([
          predictionsAPI.getPredictions(),
          generalAPI.getFAQs(),
          generalAPI.getHospitals(),
        ]);
        
        setPredictions(predictionsData);
        setFaqs(faqsData);
        setHospitals(hospitalsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExportPredictions = async () => {
    try {
      const blob = await predictionsAPI.exportPredictions();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `predictions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting predictions:', error);
    }
  };

  const handlePredictionComplete = (newPrediction: Prediction) => {
    setPredictions(prev => [newPrediction, ...prev]);
    setShowPredictionForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Welcome back, {user?.first_name}!
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Patient Dashboard - Manage your predictions and health information
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
              <button
                onClick={handleExportPredictions}
                disabled={predictions.length === 0}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </button>
              <button
                onClick={() => setShowPredictionForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Prediction
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Consent Card */}
            <ConsentCard />
            
            {/* Predictions */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Your Predictions
                  </h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Activity className="h-4 w-4 mr-1" />
                    {predictions.length} total
                  </div>
                </div>
                <PredictionHistory predictions={predictions} />
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Total Predictions</span>
                  <span className="text-sm text-gray-900">{predictions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">This Month</span>
                  <span className="text-sm text-gray-900">
                    {predictions.filter(p => 
                      new Date(p.created_at).getMonth() === new Date().getMonth()
                    ).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Avg Confidence</span>
                  <span className="text-sm text-gray-900">
                    {predictions.length > 0 
                      ? Math.round(predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length) + '%'
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* FAQs */}
            <FAQSection faqs={faqs} />
            
            {/* Hospitals */}
            <HospitalList hospitals={hospitals} />
          </div>
        </div>
      </div>

      {/* Prediction Form Modal */}
      {showPredictionForm && (
        <PredictionForm 
          onClose={() => setShowPredictionForm(false)}
          onComplete={handlePredictionComplete}
        />
      )}
    </div>
  );
};