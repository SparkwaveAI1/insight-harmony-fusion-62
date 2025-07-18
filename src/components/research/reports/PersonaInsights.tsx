
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { SurveyReport } from './SurveyReportGenerator';

interface PersonaInsightsProps {
  insights: SurveyReport['personaInsights'];
  comparison: SurveyReport['crossPersonaComparison'];
}

export const PersonaInsights: React.FC<PersonaInsightsProps> = ({ insights, comparison }) => {
  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Individual Persona Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Individual Persona Insights
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.personaId} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{insight.personaName}</h3>
                <Badge className={getEngagementColor(insight.engagementLevel)}>
                  {insight.engagementLevel.toUpperCase()} ENGAGEMENT
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">{insight.responsesSummary}</p>
              
              <div>
                <h4 className="font-medium mb-2 text-sm">Key Characteristics</h4>
                <div className="flex flex-wrap gap-2">
                  {insight.keyCharacteristics.map((characteristic, index) => (
                    <Badge key={index} variant="outline">
                      {characteristic}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Cross-Persona Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Cross-Persona Analysis
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Consensus Questions
              </h4>
              <p className="text-sm text-muted-foreground">
                Questions where personas showed similar response patterns
              </p>
              <div className="flex flex-wrap gap-1">
                {comparison.consensusQuestions.map((qIndex) => (
                  <Badge key={qIndex} className="bg-green-100 text-green-800">
                    Q{qIndex + 1}
                  </Badge>
                ))}
                {comparison.consensusQuestions.length === 0 && (
                  <span className="text-sm text-muted-foreground">No clear consensus identified</span>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                Polarizing Questions
              </h4>
              <p className="text-sm text-muted-foreground">
                Questions that generated diverse or conflicting responses
              </p>
              <div className="flex flex-wrap gap-1">
                {comparison.polarizingQuestions.map((qIndex) => (
                  <Badge key={qIndex} className="bg-orange-100 text-orange-800">
                    Q{qIndex + 1}
                  </Badge>
                ))}
                {comparison.polarizingQuestions.length === 0 && (
                  <span className="text-sm text-muted-foreground">No significant polarization detected</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Unique Perspectives</h4>
            <div className="space-y-2">
              {comparison.uniquePerspectives.map((perspective, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm">{perspective}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
