
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MessageCircle, Quote, TrendingUp, Tag } from 'lucide-react';
import { SurveyReport } from './SurveyReportGenerator';

interface QuestionAnalysisProps {
  analyses: SurveyReport['questionAnalyses'];
}

export const QuestionAnalysis: React.FC<QuestionAnalysisProps> = ({ analyses }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Question Analysis
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {analyses.map((analysis) => (
          <div key={analysis.questionIndex} className="border rounded-lg p-4 space-y-4">
            <div>
              <h3 className="font-semibold mb-1">
                Question {analysis.questionIndex + 1}
              </h3>
              <p className="text-sm text-muted-foreground">{analysis.questionText}</p>
            </div>

            {/* Themes */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Key Themes
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.themes.map((theme, index) => (
                  <Badge key={index} variant="secondary">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Response Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Engagement Score</span>
                  <span>{analysis.responseMetrics.engagementScore}%</span>
                </div>
                <Progress value={analysis.responseMetrics.engagementScore} className="h-2" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Average Response</div>
                <div className="font-medium">{analysis.responseMetrics.averageLength} characters</div>
              </div>
            </div>

            {/* Sentiment Distribution */}
            <div>
              <h4 className="font-medium mb-2">Sentiment Distribution</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-12 text-xs">Positive</div>
                  <Progress value={analysis.sentimentDistribution.positive} className="flex-1 h-2" />
                  <div className="w-8 text-xs">{analysis.sentimentDistribution.positive}%</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 text-xs">Neutral</div>
                  <Progress value={analysis.sentimentDistribution.neutral} className="flex-1 h-2" />
                  <div className="w-8 text-xs">{analysis.sentimentDistribution.neutral}%</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 text-xs">Negative</div>
                  <Progress value={analysis.sentimentDistribution.negative} className="flex-1 h-2" />
                  <div className="w-8 text-xs">{analysis.sentimentDistribution.negative}%</div>
                </div>
              </div>
            </div>

            {/* Notable Quotes */}
            {analysis.notableQuotes.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Quote className="w-4 h-4" />
                  Notable Responses
                </h4>
                <div className="space-y-2">
                  {analysis.notableQuotes.map((quote, index) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-4 py-2 bg-gray-50">
                      <p className="text-sm italic">"{quote.text}"</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        — {quote.personaName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
