import React, { useState, useEffect } from 'react';
import { consentAPI } from '../../services/api';
import type { ConsentStatus } from '../../types';
import { Shield, Check, AlertTriangle } from 'lucide-react';

export const ConsentCard: React.FC = () => {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    const fetchConsentStatus = async () => {
      try {
        const status = await consentAPI.getStatus();
        setConsentStatus(status);
      } catch (error) {
        console.error('Error fetching consent status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsentStatus();
  }, []);

  const handleAcceptConsent = async () => {
    setAccepting(true);
    try {
      const updatedStatus = await consentAPI.acceptConsent();
      setConsentStatus(updatedStatus);
    } catch (error) {
      console.error('Error accepting consent:', error);
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!consentStatus) {
    return null;
  }

  if (consentStatus.consent_given) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-green-800">
              Data Consent Approved
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                You have given consent for your medical data to be used for predictive analysis.
                Consent given on {new Date(consentStatus.consent_date!).toLocaleDateString()}.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-6 w-6 text-yellow-600" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Consent Required
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p className="mb-3">
              To use our prediction services, we need your consent to process your medical data
              in accordance with healthcare privacy regulations.
            </p>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-yellow-600" />
              <span className="text-xs">Your data is encrypted and HIPAA compliant</span>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleAcceptConsent}
              disabled={accepting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {accepting ? 'Processing...' : 'Give Consent'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};