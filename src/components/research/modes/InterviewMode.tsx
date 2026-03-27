import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, User, FileText, Sparkles, Loader2, X } from 'lucide-react';
import { getAllPersonas } from '@/services/persona';
import { Persona } from '@/services/persona/types';
import PersonaChatInterface from '@/components/persona-chat/PersonaChatInterface';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InterviewModeProps {
  onBack: () => void;
}

interface InsightResult {
  executive_summary?: {
    key_findings?: string;
    actionable_insights?: string;
    research_objective_fulfillment?: string;
  };
  thematic_analysis?: {
    primary_themes?: Array<{ theme_name?: string; description?: string; supporting_quotes?: string[] }>;
  };
}

const InterviewMode: React.FC<InterviewModeProps> = ({ onBack }) => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Report state
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportNotes, setReportNotes] = useState('');
  const [reportResult, setReportResult] = useState<InsightResult | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    const loadPersonas = async () => {
      try {
        const allPersonas = await getAllPersonas();
        setPersonas(allPersonas);
      } catch (error) {
        console.error('Error loading personas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPersonas();
  }, []);

  const generateInterviewReport = async () => {
    if (!reportNotes.trim() || !selectedPersona) return;
    setIsGeneratingReport(true);
    try {
      const lines = reportNotes.split('\n').filter((l) => l.trim());
      const responses = lines.map((line, i) => ({
        persona_id: selectedPersona.persona_id,
        question_index: i,
        question_text: `Response ${i + 1}`,
        response_text: line.trim(),
      }));

      const { data, error } = await supabase.functions.invoke('compile-research-insights', {
        body: {
          direct_input: {
            responses,
            personas: [{ persona_id: selectedPersona.persona_id, name: selectedPersona.name }],
            questions: lines.map((_, i) => `Response ${i + 1}`),
            study_name: `Interview: ${selectedPersona.name}`,
            study_description: '1-on-1 research interview',
          },
        },
      });

      if (error) throw error;
      setReportResult(data as InsightResult);
      setShowReportDialog(false);
      setReportNotes('');
      toast.success('Interview insights generated!');
    } catch (err) {
      console.error('Report generation error:', err);
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (selectedPersona) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedPersona(null);
              setReportResult(null);
              setReportNotes('');
            }}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Change Persona
          </Button>
          <h2 className="text-2xl font-bold">1-on-1 Interview with {selectedPersona.name}</h2>
          <p className="text-muted-foreground">Research conversation mode</p>
        </div>

        <PersonaChatInterface personaId={selectedPersona.persona_id} />

        {/* Generate Report Button */}
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={() => setShowReportDialog(true)}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Generate Interview Report
          </Button>
        </div>

        {/* Report Dialog */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Generate Interview Insights</DialogTitle>
              <DialogDescription>
                Paste key responses from the interview above, one per line or as a summary. The AI will analyze and generate structured insights.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                placeholder="Paste interview responses here, one per line..."
                rows={8}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Each line will be treated as a separate response for analysis.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReportDialog(false)} disabled={isGeneratingReport}>
                Cancel
              </Button>
              <Button
                onClick={generateInterviewReport}
                disabled={isGeneratingReport || !reportNotes.trim()}
                className="gap-2"
              >
                {isGeneratingReport ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Insights
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Report Results */}
        {reportResult && (
          <Card className="mt-6 border-primary/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Interview Insights
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReportResult(null)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {reportResult.executive_summary?.key_findings && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Key Findings</h4>
                  <p className="text-sm text-muted-foreground">{reportResult.executive_summary.key_findings}</p>
                </div>
              )}
              {reportResult.executive_summary?.actionable_insights && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Actionable Insights</h4>
                  <p className="text-sm text-muted-foreground">{reportResult.executive_summary.actionable_insights}</p>
                </div>
              )}
              {reportResult.thematic_analysis?.primary_themes && reportResult.thematic_analysis.primary_themes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Primary Themes</h4>
                  <ul className="space-y-2">
                    {reportResult.thematic_analysis.primary_themes.map((theme, i) => (
                      <li key={i} className="text-sm">
                        <span className="font-medium">{theme.theme_name}: </span>
                        <span className="text-muted-foreground">{theme.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Research Modes
        </Button>
        <h2 className="text-2xl font-bold mb-2">1-on-1 Interview</h2>
        <p className="text-muted-foreground">Select a persona for your research interview</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personas.map((persona) => (
            <Card key={persona.persona_id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  {persona.profile_image_url ? (
                    <img
                      src={persona.profile_image_url}
                      alt={persona.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{persona.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {persona.metadata?.occupation || 'Persona'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {persona.description || 'Ready for research interview'}
                </p>
                <Button
                  onClick={() => setSelectedPersona(persona)}
                  className="w-full"
                  size="sm"
                >
                  Start Interview
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewMode;
