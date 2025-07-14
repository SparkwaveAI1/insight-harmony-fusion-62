import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';
import { SurveyBuilder } from './SurveyBuilder';
import { SurveyList } from './SurveyList';
import { CSVImportDialog } from './CSVImportDialog';

interface SurveyManagementProps {
  personaId: string;
  isOwner: boolean;
}

export const SurveyManagement: React.FC<SurveyManagementProps> = ({ personaId, isOwner }) => {
  const [showBuilder, setShowBuilder] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<any>(null);

  if (!isOwner) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">
            Only the persona owner can manage surveys.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (showBuilder) {
    return (
      <SurveyBuilder
        personaId={personaId}
        survey={editingSurvey}
        onSave={() => {
          setShowBuilder(false);
          setEditingSurvey(null);
        }}
        onCancel={() => {
          setShowBuilder(false);
          setEditingSurvey(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Survey Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              onClick={() => setShowBuilder(true)}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Create New Survey
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowCSVImport(true)}
              className="flex items-center gap-2"
            >
              <Upload size={16} />
              Import CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <SurveyList 
        personaId={personaId}
        onEdit={(survey) => {
          setEditingSurvey(survey);
          setShowBuilder(true);
        }}
      />

      <CSVImportDialog
        open={showCSVImport}
        onClose={() => setShowCSVImport(false)}
        personaId={personaId}
      />
    </div>
  );
};