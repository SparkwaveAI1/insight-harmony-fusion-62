
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, FileText, Lightbulb } from 'lucide-react';
import { SurveyReport } from './SurveyReportGenerator';

interface ExecutiveSummaryProps {
  summary: SurveyReport['executiveSummary'];
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ summary }) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Executive Summary
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{summary.totalPersonas}</div>
            <div className="text-sm text-muted-foreground">Personas Surveyed</div>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{summary.completionRate}%</div>
            <div className="text-sm text-muted-foreground">Completion Rate</div>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <FileText className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">{summary.averageResponseLength}</div>
            <div className="text-sm text-muted-foreground">Avg Response Length</div>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="mb-2">
              <Badge className={getSentimentColor(summary.overallSentiment)}>
                {summary.overallSentiment.toUpperCase()}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">Overall Sentiment</div>
          </div>
        </div>

        {/* Key Insights */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Key Insights
          </h3>
          <div className="space-y-2">
            {summary.keyInsights.map((insight, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <p className="text-sm flex-1">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
