
import { useState, useEffect } from 'react';

export interface Activity {
  id: string;
  type: 'persona' | 'collection' | 'insight';
  title: string;
  description: string;
  iconName: 'Users' | 'Folder' | 'BarChart3';
  timestamp: Date;
}

export function useRecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      setIsLoading(true);
      
      // In a real implementation, this would fetch from an API/database
      // For now, we're using mock data
      const mockActivities: Activity[] = [
        {
          id: '1',
          type: 'persona',
          title: 'Persona interview completed',
          description: 'You interviewed "Jamie, 34, Marketing Manager"',
          iconName: 'Users',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
        },
        {
          id: '2',
          type: 'collection',
          title: 'New collection created',
          description: 'You created "Product Feedback - Q2"',
          iconName: 'Folder',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
        },
        {
          id: '3',
          type: 'insight',
          title: 'Insight generated',
          description: 'New insights for "Millennial Shopping Habits"',
          iconName: 'BarChart3',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
        },
        {
          id: '4',
          type: 'persona',
          title: 'Persona created',
          description: 'You created "Alex, 28, Software Developer"',
          iconName: 'Users',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4) // 4 days ago
        },
        {
          id: '5',
          type: 'insight',
          title: 'Research completed',
          description: 'Focus group on "Gen Z Social Media Usage"',
          iconName: 'BarChart3',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) // 5 days ago
        }
      ];
      
      setActivities(mockActivities);
      setIsLoading(false);
    };

    fetchRecentActivity();
  }, []);

  return { activities, isLoading };
}
