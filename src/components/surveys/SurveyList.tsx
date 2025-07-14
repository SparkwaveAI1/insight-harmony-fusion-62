import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Play, Trash2, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SurveyExecution } from './SurveyExecution';

interface Survey {
  id: string;
  name: string;
  description: string | null;
  questions: any; // This will be a JSON array from the database
  created_at: string;
  session_count?: number;
}

interface SurveyListProps {
  personaId: string;
  onEdit: (survey: Survey) => void;
}

export const SurveyList: React.FC<SurveyListProps> = ({ personaId, onEdit }) => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [executingSurvey, setExecutingSurvey] = useState<Survey | null>(null);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('surveys')
        .select(`
          *,
          survey_sessions!inner(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const surveysWithCounts = data?.map(survey => ({
        ...survey,
        questions: Array.isArray(survey.questions) ? survey.questions : [],
        session_count: survey.survey_sessions?.length || 0
      })) || [];

      setSurveys(surveysWithCounts);
    } catch (error) {
      console.error('Error loading surveys:', error);
      toast.error('Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };

  const deleteSurvey = async (surveyId: string) => {
    if (!confirm('Are you sure you want to delete this survey?')) return;

    try {
      const { error } = await supabase
        .from('surveys')
        .delete()
        .eq('id', surveyId);

      if (error) throw error;

      toast.success('Survey deleted successfully');
      loadSurveys();
    } catch (error) {
      console.error('Error deleting survey:', error);
      toast.error('Failed to delete survey');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Loading surveys...</p>
        </CardContent>
      </Card>
    );
  }

  if (executingSurvey) {
    return (
      <SurveyExecution
        survey={executingSurvey}
        personaId={personaId}
        onComplete={() => {
          setExecutingSurvey(null);
          loadSurveys();
        }}
      />
    );
  }

  if (surveys.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            No surveys created yet. Create your first survey to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Your Surveys</h3>
      {surveys.map((survey) => (
        <Card key={survey.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{survey.name}</CardTitle>
                {survey.description && (
                  <p className="text-sm text-muted-foreground">
                    {survey.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExecutingSurvey(survey)}
                  className="flex items-center gap-2"
                >
                  <Play size={16} />
                  Run Survey
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(survey)}
                  className="flex items-center gap-2"
                >
                  <Edit size={16} />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteSurvey(survey.id)}
                  className="flex items-center gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 size={16} />
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <FileText size={16} />
                {survey.questions.length} questions
              </div>
              <Badge variant="secondary">
                {survey.session_count} sessions completed
              </Badge>
              <span>
                Created {new Date(survey.created_at).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};