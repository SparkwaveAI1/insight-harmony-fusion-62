
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { SurveyReport } from './SurveyReportGenerator';

interface ReportExportProps {
  report: SurveyReport;
  surveyName: string;
  questions: string[];
}

export const ReportExport: React.FC<ReportExportProps> = ({ report, surveyName, questions }) => {
  const generateMarkdownReport = () => {
    let markdown = `# Research Report: ${surveyName}\n\n`;
    markdown += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
    
    // Executive Summary
    markdown += `## Executive Summary\n\n`;
    markdown += `- **Total Personas Surveyed:** ${report.executiveSummary.totalPersonas}\n`;
    markdown += `- **Completion Rate:** ${report.executiveSummary.completionRate}%\n`;
    markdown += `- **Average Response Length:** ${report.executiveSummary.averageResponseLength} characters\n`;
    markdown += `- **Overall Sentiment:** ${report.executiveSummary.overallSentiment}\n\n`;
    
    markdown += `### Key Insights\n\n`;
    report.executiveSummary.keyInsights.forEach((insight, index) => {
      markdown += `${index + 1}. ${insight}\n`;
    });
    markdown += '\n';
    
    // Question Analysis
    markdown += `## Question Analysis\n\n`;
    report.questionAnalyses.forEach((analysis) => {
      markdown += `### Question ${analysis.questionIndex + 1}\n`;
      markdown += `**Question:** ${analysis.questionText}\n\n`;
      
      markdown += `**Key Themes:**\n`;
      analysis.themes.forEach(theme => {
        markdown += `- ${theme}\n`;
      });
      markdown += '\n';
      
      markdown += `**Response Metrics:**\n`;
      markdown += `- Engagement Score: ${analysis.responseMetrics.engagementScore}%\n`;
      markdown += `- Average Response Length: ${analysis.responseMetrics.averageLength} characters\n\n`;
      
      markdown += `**Sentiment Distribution:**\n`;
      markdown += `- Positive: ${analysis.sentimentDistribution.positive}%\n`;
      markdown += `- Neutral: ${analysis.sentimentDistribution.neutral}%\n`;
      markdown += `- Negative: ${analysis.sentimentDistribution.negative}%\n\n`;
      
      if (analysis.notableQuotes.length > 0) {
        markdown += `**Notable Responses:**\n\n`;
        analysis.notableQuotes.forEach((quote) => {
          markdown += `> "${quote.text}"\n> — ${quote.personaName}\n\n`;
        });
      }
      
      markdown += '---\n\n';
    });
    
    // Persona Insights
    markdown += `## Individual Persona Insights\n\n`;
    report.personaInsights.forEach((insight) => {
      markdown += `### ${insight.personaName}\n`;
      markdown += `**Engagement Level:** ${insight.engagementLevel.toUpperCase()}\n\n`;
      markdown += `${insight.responsesSummary}\n\n`;
      markdown += `**Key Characteristics:**\n`;
      insight.keyCharacteristics.forEach(char => {
        markdown += `- ${char}\n`;
      });
      markdown += '\n';
    });
    
    // Cross-Persona Analysis
    markdown += `## Cross-Persona Analysis\n\n`;
    markdown += `### Consensus Questions\n`;
    if (report.crossPersonaComparison.consensusQuestions.length > 0) {
      markdown += `Questions where personas showed similar response patterns: `;
      markdown += report.crossPersonaComparison.consensusQuestions.map(q => `Q${q + 1}`).join(', ');
      markdown += '\n\n';
    } else {
      markdown += 'No clear consensus identified across questions.\n\n';
    }
    
    markdown += `### Polarizing Questions\n`;
    if (report.crossPersonaComparison.polarizingQuestions.length > 0) {
      markdown += `Questions that generated diverse responses: `;
      markdown += report.crossPersonaComparison.polarizingQuestions.map(q => `Q${q + 1}`).join(', ');
      markdown += '\n\n';
    } else {
      markdown += 'No significant polarization detected across questions.\n\n';
    }
    
    markdown += `### Unique Perspectives\n`;
    report.crossPersonaComparison.uniquePerspectives.forEach(perspective => {
      markdown += `- ${perspective}\n`;
    });
    
    return markdown;
  };

  const exportReport = () => {
    try {
      const markdownContent = generateMarkdownReport();
      const blob = new Blob([markdownContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `research-report-${surveyName.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Research report exported successfully!');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  return (
    <Button onClick={exportReport} className="flex items-center gap-2">
      <Download className="w-4 h-4" />
      Export Report
    </Button>
  );
};
