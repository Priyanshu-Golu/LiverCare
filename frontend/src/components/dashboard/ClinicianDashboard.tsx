import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { PredictionHistory } from './PredictionHistory';
import { AdminMetrics } from './AdminMetrics';
import { FAQSection } from './FAQSection';
import { HospitalList } from './HospitalList';
import type { Prediction, FAQ, Hospital, AdminMetrics as AdminMetricsType } from '../../types';
import { predictionsAPI, generalAPI, adminAPI } from '../../services/api';
import { Activity, Users, TrendingUp } from 'lucide-react';

export const ClinicianDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [metrics, setMetrics] = useState<AdminMetricsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [predictionsData, faqsData, hospitalsData, metricsData] = await Promise.all([
          predictionsAPI.getPredictions(),
          generalAPI.getFAQs(),
          generalAPI.getHospitals(),
          adminAPI.getMetrics(),
        ]);
        
        setPredictions(predictionsData);
        setFaqs(faqsData);
        setHospitals(hospitalsData);
        setMetrics(metricsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
                Dr. {user?.last_name} Dashboard
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Clinician Dashboard - Monitor patient predictions and system metrics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Metrics Overview */}
        {metrics && <AdminMetrics metrics={metrics} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Predictions */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Patient Predictions
                  </h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <Activity className="h-4 w-4 mr-1" />
                    {predictions.length} total
                  </div>
                </div>
                <PredictionHistory predictions={predictions} showPatientInfo />
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Active Patients</span>
                  </div>
                  <span className="text-sm text-gray-900">{metrics?.active_users || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Accuracy Rate</span>
                  </div>
                  <span className="text-sm text-gray-900">{metrics?.accuracy_rate || 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 text-orange-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Today's Predictions</span>
                  </div>
                  <span className="text-sm text-gray-900">{metrics?.predictions_today || 0}</span>
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
    </div>
  );
};