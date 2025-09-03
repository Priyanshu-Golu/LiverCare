import React from 'react';
import type { Hospital } from '../../types';
import { MapPin, Phone, Building } from 'lucide-react';

interface HospitalListProps {
  hospitals: Hospital[];
}

export const HospitalList: React.FC<HospitalListProps> = ({ hospitals }) => {
  if (hospitals.length === 0) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center mb-4">
        <Building className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">Nearby Hospitals</h3>
      </div>
      
      <div className="space-y-4">
        {hospitals.slice(0, 3).map((hospital) => (
          <div key={hospital.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 mb-1">{hospital.name}</h4>
                
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{hospital.address}</span>
                </div>
                
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <Phone className="h-3 w-3 mr-1" />
                  <span>{hospital.phone}</span>
                </div>
                
                <div className="mt-2">
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {hospital.specialty}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {hospitals.length > 3 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors">
            View all hospitals ({hospitals.length})
          </button>
        </div>
      )}
    </div>
  );
};