
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

interface BackgroundSectionProps {
  backstory: string;
}

const BackgroundSection = ({ backstory }: BackgroundSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Background
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {backstory}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BackgroundSection;
