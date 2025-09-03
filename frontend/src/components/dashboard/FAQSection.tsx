import React, { useState } from 'react';
import type { FAQ } from '../../types';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQSectionProps {
  faqs: FAQ[];
}

export const FAQSection: React.FC<FAQSectionProps> = ({ faqs }) => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  if (faqs.length === 0) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center mb-4">
        <HelpCircle className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">Frequently Asked Questions</h3>
      </div>
      
      <div className="space-y-3">
        {faqs.slice(0, 5).map((faq) => (
          <div key={faq.id} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleFaq(faq.id)}
              className="w-full px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-colors rounded-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">{faq.question}</span>
                {expandedFaq === faq.id ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </div>
            </button>
            
            {expandedFaq === faq.id && (
              <div className="px-4 pb-3 text-sm text-gray-600">
                <div className="border-t border-gray-200 pt-3">
                  {faq.answer}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {faqs.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors">
            View all FAQs ({faqs.length})
          </button>
        </div>
      )}
    </div>
  );
};