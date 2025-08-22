import React, { useState } from 'react';
import { V4PersonaCreator, V4ConversationTest, V4ABTestConversation } from '@/components/v4-system';
import { Button } from '@/components/ui/button';

export function V4PersonaCreationPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'chat' | 'abtest'>('create');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">V4 Persona System</h1>
        <p className="text-lg text-gray-600 mt-2">
          Next-generation persona creation with trait-scanning conversations (Grok-powered)
        </p>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>V4 System:</strong> Advanced trait-scanning conversations powered by Grok for more natural, authentic responses.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <Button
              variant={activeTab === 'create' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('create')}
              className="mr-1"
            >
              Create Personas
            </Button>
            <Button
              variant={activeTab === 'chat' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('chat')}
              className="mr-1"
            >
              Test Conversations
            </Button>
            <Button
              variant={activeTab === 'abtest' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('abtest')}
            >
              A/B Test Models
            </Button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'create' && <V4PersonaCreator />}
        {activeTab === 'chat' && <V4ConversationTest />}
        {activeTab === 'abtest' && <V4ABTestConversation />}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>V4 System - Trait-scanning conversations powered by Grok for enhanced authenticity</p>
        </div>
      </div>
    </div>
  );
}