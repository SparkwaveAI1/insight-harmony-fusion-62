
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createProject, getUserProjects, Project, createProjectConversation, saveConversationMessages } from "@/services/collections";
import { Loader2, Plus, Save } from "lucide-react";
import { toast } from "sonner";

interface SaveConversationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: { role: "user" | "assistant"; content: string; persona_id?: string }[];
  personaIds: string[];
  defaultTitle?: string;
  onSaved: (conversationId: string, projectId: string) => void;
}

const SaveConversationModal = ({
  open,
  onOpenChange,
  messages,
  personaIds,
  defaultTitle = "",
  onSaved
}: SaveConversationModalProps) => {
  const [title, setTitle] = useState(defaultTitle || `Conversation ${new Date().toLocaleDateString()}`);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [showCreateProject, setShowCreateProject] = useState(false);

  useEffect(() => {
    if (open) {
      loadProjects();
    }
  }, [open]);

  const loadProjects = async () => {
    try {
      const projectsData = await getUserProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects");
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast.error("Project name is required");
      return;
    }

    try {
      setIsCreatingProject(true);
      const newProject = await createProject(newProjectName, newProjectDescription || null);
      
      if (newProject) {
        setProjects(prev => [newProject, ...prev]);
        setSelectedProjectId(newProject.id);
        setShowCreateProject(false);
        setNewProjectName("");
        setNewProjectDescription("");
        toast.success("Project created successfully");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Conversation title is required");
      return;
    }

    if (!selectedProjectId) {
      toast.error("Please select a project");
      return;
    }

    try {
      setIsLoading(true);

      // Create conversation in the selected project
      const conversation = await createProjectConversation(
        selectedProjectId,
        title,
        personaIds,
        []
      );

      if (!conversation) {
        throw new Error("Failed to create conversation");
      }

      // Save messages to the conversation
      const messagesSaved = await saveConversationMessages(conversation.id, messages);

      if (!messagesSaved) {
        throw new Error("Failed to save conversation messages");
      }

      toast.success("Conversation saved successfully");
      onSaved(conversation.id, selectedProjectId);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving conversation:", error);
      toast.error("Failed to save conversation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Save Conversation</DialogTitle>
          <DialogDescription>
            Save this conversation to a project for future reference.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Conversation Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter conversation title"
            />
          </div>

          <div className="grid gap-2">
            <Label>Project</Label>
            {!showCreateProject ? (
              <div className="flex gap-2">
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
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
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowCreateProject(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-3 border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Create New Project</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateProject(false)}
                  >
                    Cancel
                  </Button>
                </div>
                
                <Input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Project name"
                />
                
                <Textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Project description (optional)"
                  rows={2}
                />
                
                <Button
                  onClick={handleCreateProject}
                  disabled={isCreatingProject || !newProjectName.trim()}
                  className="w-full"
                >
                  {isCreatingProject && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Project
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading || !title.trim() || !selectedProjectId}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Save Conversation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveConversationModal;
