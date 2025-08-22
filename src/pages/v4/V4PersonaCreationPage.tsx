import React from 'react';
import { V4PersonaCreator } from '@/components/v4-system';

export function V4PersonaCreationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">V4 Persona Creation</h1>
          <p className="text-lg text-gray-600 mt-2">
            Next-generation persona creation with trait-scanning conversations (Grok-powered)
          </p>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>V4 System:</strong> Advanced trait-scanning conversations powered by Grok for enhanced authenticity.
            </p>
          </div>
        </div>

        {/* Only Persona Creation - No Tabs */}
        <V4PersonaCreator />

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>V4 System - Advanced psychological modeling for authentic conversations</p>
        </div>
      </div>
    </div>
  );
}