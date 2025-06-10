import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getUserProjects, createProject, Project } from '@/services/collections';
import { Loader2, Plus, FolderPlus, Target, FileText, Presentation, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

export interface OutputGoal {
  deliverable_type: 'summary_report' | 'insights_dashboard' | 'presentation' | 'raw_data' | 'recommendations';
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface OutputGoalsData {
  primary_goals: string[];
  deliverables: OutputGoal[];
  timeline: string;
  stakeholders: string[];
  project_id: string | null;
}

interface DefineOutputGoalsProps {
  onGoalsDefined: (goals: OutputGoalsData) => void;
}

export const DefineOutputGoals: React.FC<DefineOutputGoalsProps> = ({ onGoalsDefined }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  
  // Output goals form state
  const [primaryGoals, setPrimaryGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [deliverables, setDeliverables] = useState<OutputGoal[]>([]);
  const [timeline, setTimeline] = useState("");
  const [stakeholders, setStakeholders] = useState<string[]>([]);
  const [newStakeholder, setNewStakeholder] = useState("");

  React.useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    const userProjects = await getUserProjects();
    setProjects(userProjects);
    setIsLoading(false);
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast.error("Project name is required");
      return;
    }

    setIsLoading(true);
    const project = await createProject(newProjectName, newProjectDescription || null);
    
    if (project) {
      await loadProjects();
      setSelectedProjectId(project.id);
      setShowCreateProject(false);
      setNewProjectName("");
      setNewProjectDescription("");
      toast.success("Project created successfully");
    }
    
    setIsLoading(false);
  };

  const addPrimaryGoal = () => {
    if (newGoal.trim() && !primaryGoals.includes(newGoal.trim())) {
      setPrimaryGoals([...primaryGoals, newGoal.trim()]);
      setNewGoal("");
    }
  };

  const removePrimaryGoal = (goalToRemove: string) => {
    setPrimaryGoals(primaryGoals.filter(goal => goal !== goalToRemove));
  };

  const addStakeholder = () => {
    if (newStakeholder.trim() && !stakeholders.includes(newStakeholder.trim())) {
      setStakeholders([...stakeholders, newStakeholder.trim()]);
      setNewStakeholder("");
    }
  };

  const removeStakeholder = (stakeholderToRemove: string) => {
    setStakeholders(stakeholders.filter(stakeholder => stakeholder !== stakeholderToRemove));
  };

  const toggleDeliverable = (type: OutputGoal['deliverable_type'], checked: boolean) => {
    if (checked) {
      const newDeliverable: OutputGoal = {
        deliverable_type: type,
        description: getDeliverableDescription(type),
        priority: 'medium'
      };
      setDeliverables([...deliverables, newDeliverable]);
    } else {
      setDeliverables(deliverables.filter(d => d.deliverable_type !== type));
    }
  };

  const getDeliverableDescription = (type: OutputGoal['deliverable_type']): string => {
    const descriptions = {
      summary_report: "Comprehensive summary of findings and insights",
      insights_dashboard: "Interactive dashboard with key metrics and visualizations", 
      presentation: "Presentation slides for stakeholder communication",
      raw_data: "Raw conversation data and transcripts",
      recommendations: "Actionable recommendations based on research findings"
    };
    return descriptions[type];
  };

  const getDeliverableIcon = (type: OutputGoal['deliverable_type']) => {
    const icons = {
      summary_report: <FileText className="h-4 w-4" />,
      insights_dashboard: <BarChart3 className="h-4 w-4" />,
      presentation: <Presentation className="h-4 w-4" />,
      raw_data: <FileText className="h-4 w-4" />,
      recommendations: <Target className="h-4 w-4" />
    };
    return icons[type];
  };

  const handleSubmit = () => {
    if (primaryGoals.length === 0) {
      toast.error("Please add at least one primary goal");
      return;
    }

    if (deliverables.length === 0) {
      toast.error("Please select at least one deliverable");
      return;
    }

    const outputGoalsData: OutputGoalsData = {
      primary_goals: primaryGoals,
      deliverables,
      timeline: timeline || "Not specified",
      stakeholders,
      project_id: selectedProjectId || null
    };

    onGoalsDefined(outputGoalsData);
  };

  const deliverableTypes: { type: OutputGoal['deliverable_type']; label: string }[] = [
    { type: 'summary_report', label: 'Summary Report' },
    { type: 'insights_dashboard', label: 'Insights Dashboard' },
    { type: 'presentation', label: 'Presentation' },
    { type: 'raw_data', label: 'Raw Data' },
    { type: 'recommendations', label: 'Recommendations' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Define Output Goals</h2>
        <p className="text-muted-foreground">
          What do you want to achieve with this research study?
        </p>
      </div>

      {/* Project Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Project Association</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project">Associate with Project (Optional)</Label>
            <div className="flex gap-2">
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={isLoading}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setShowCreateProject(true)}
                disabled={isLoading}
                title="Create new project"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Primary Goals */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Primary Research Goals</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a research goal (e.g., Understand user pain points)"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addPrimaryGoal()}
            />
            <Button onClick={addPrimaryGoal} disabled={!newGoal.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {primaryGoals.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {primaryGoals.map((goal, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {goal}
                  <button
                    onClick={() => removePrimaryGoal(goal)}
                    className="ml-2 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Deliverables */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Expected Deliverables</h3>
        <div className="space-y-3">
          {deliverableTypes.map(({ type, label }) => (
            <div key={type} className="flex items-start space-x-3">
              <Checkbox
                id={type}
                checked={deliverables.some(d => d.deliverable_type === type)}
                onCheckedChange={(checked) => toggleDeliverable(type, checked as boolean)}
              />
              <div className="flex-1">
                <label htmlFor={type} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  {getDeliverableIcon(type)}
                  {label}
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  {getDeliverableDescription(type)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Timeline and Stakeholders */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Timeline</h3>
          <Select value={timeline} onValueChange={setTimeline}>
            <SelectTrigger>
              <SelectValue placeholder="Select timeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-week">1 Week</SelectItem>
              <SelectItem value="2-weeks">2 Weeks</SelectItem>
              <SelectItem value="1-month">1 Month</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
            </SelectContent>
          </Select>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Stakeholders</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Add stakeholder"
                value={newStakeholder}
                onChange={(e) => setNewStakeholder(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addStakeholder()}
              />
              <Button onClick={addStakeholder} size="sm" disabled={!newStakeholder.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {stakeholders.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {stakeholders.map((stakeholder, index) => (
                  <Badge key={index} variant="outline" className="px-2 py-1">
                    {stakeholder}
                    <button
                      onClick={() => removeStakeholder(stakeholder)}
                      className="ml-2 text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <Button 
          onClick={handleSubmit}
          disabled={primaryGoals.length === 0 || deliverables.length === 0}
          className="px-8"
        >
          <Target className="h-4 w-4 mr-2" />
          Define Output Goals
        </Button>
      </div>

      {/* Create Project Dialog */}
      <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="new-project-name">Project Name</Label>
              <Input
                id="new-project-name"
                placeholder="Enter project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-project-description">Description (Optional)</Label>
              <Textarea
                id="new-project-description"
                placeholder="Enter project description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={() => setShowCreateProject(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleCreateProject} 
                className="flex-1"
                disabled={isLoading || !newProjectName.trim()}
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FolderPlus className="h-4 w-4 mr-2" />}
                Create Project
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
