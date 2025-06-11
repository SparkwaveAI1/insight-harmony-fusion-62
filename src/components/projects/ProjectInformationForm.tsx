
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { updateProject } from '@/services/collections';
import { Project } from '@/services/collections/types';
import { toast } from 'sonner';

interface ProjectInformationFormProps {
  project: Project;
  onProjectUpdate: (updatedProject: Project) => void;
}

interface FormData {
  information: string;
  research_objectives: string;
  methodology: string;
}

const ProjectInformationForm: React.FC<ProjectInformationFormProps> = ({
  project,
  onProjectUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      information: project.information || '',
      research_objectives: project.research_objectives || '',
      methodology: project.methodology || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const updatedProject = await updateProject(project.id, {
        information: data.information || null,
        research_objectives: data.research_objectives || null,
        methodology: data.methodology || null,
      });

      if (updatedProject) {
        onProjectUpdate(updatedProject);
        setIsEditing(false);
        toast.success('Project information updated');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Project Information</CardTitle>
        {!isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="information">Project Description</Label>
            <Textarea
              id="information"
              {...register('information')}
              placeholder="Describe the overall project, its purpose, and context..."
              rows={4}
              disabled={!isEditing}
              className={!isEditing ? 'bg-gray-50' : ''}
            />
          </div>

          <div>
            <Label htmlFor="research_objectives">Research Objectives</Label>
            <Textarea
              id="research_objectives"
              {...register('research_objectives')}
              placeholder="Define what you want to learn or accomplish with this research..."
              rows={3}
              disabled={!isEditing}
              className={!isEditing ? 'bg-gray-50' : ''}
            />
          </div>

          <div>
            <Label htmlFor="methodology">Methodology</Label>
            <Textarea
              id="methodology"
              {...register('methodology')}
              placeholder="Outline your research approach, methods, and process..."
              rows={3}
              disabled={!isEditing}
              className={!isEditing ? 'bg-gray-50' : ''}
            />
          </div>

          {isEditing && (
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ProjectInformationForm;
