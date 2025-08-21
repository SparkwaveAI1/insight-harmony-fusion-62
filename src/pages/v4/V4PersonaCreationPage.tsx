import React from 'react';
import { V4PersonaCreator } from '@/components/v4-system';

export function V4PersonaCreationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">V4 Persona System</h1>
          <p className="text-lg text-gray-600 mt-2">
            Next-generation persona creation with two-stage generation
          </p>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Beta System:</strong> This is a parallel V4 system running alongside the existing persona system.
            </p>
          </div>
        </div>

        <V4PersonaCreator />

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>V4 System - Two-stage persona generation for enhanced authenticity</p>
        </div>
      </div>
    </div>
  );
}