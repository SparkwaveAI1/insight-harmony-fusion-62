
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, FileText, BarChart3, Settings } from 'lucide-react';

interface ResearchTabsProps {
  activeTab: 'chat' | 'personas' | 'documents' | 'survey' | 'settings';
  setActiveTab: (tab: 'chat' | 'personas' | 'documents' | 'survey' | 'settings') => void;
}

export const ResearchTabs: React.FC<ResearchTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
    { id: 'personas' as const, label: 'Personas', icon: Users },
    { id: 'documents' as const, label: 'Documents', icon: FileText },
    { id: 'survey' as const, label: 'Survey', icon: BarChart3 },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex gap-2 border-b">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2"
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
};
