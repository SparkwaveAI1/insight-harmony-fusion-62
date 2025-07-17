
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createProject, getUserProjects, Project, createConversation, saveConversationMessages } from "@/services/collections";
import { Loader2, Plus, Save } from "lucide-react";
import { toast } from "sonner";

interface SaveCharacterConversationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messages: { role: "user" | "assistant"; content: string; character_id?: string }[];
  characterIds: string[];
  defaultTitle?: string;
  onSaved: (conversationId: string, projectId: string) => void;
}

const SaveCharacterConversationModal = ({
  open,
  onOpenChange,
  messages,
  characterIds,
  defaultTitle = "",
  onSaved
}: SaveCharacterConversationModalProps) => {
  const [title, setTitle] = useState(defaultTitle || `Character Chat ${new Date().toLocaleDateString()}`);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [tags, setTags] = useState<string>("");

  // Load user's projects
  useEffect(() => {
    if (open) {
      loadProjects();
    }
  }, [open]);

  const loadProjects = async () => {
    setIsLoading(true);
    const userProjects = await getUserProjects();
    setProjects(userProjects);
    
    // Set default project if available
    if (userProjects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(userProjects[0].id);
    }
    
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
      loadProjects();
      setSelectedProjectId(project.id);
      setIsCreatingProject(false);
      setNewProjectName("");
      setNewProjectDescription("");
    }
    
    setIsLoading(false);
  };

  const handleSaveConversation = async () => {
    if (!selectedProjectId) {
      toast.error("Please select or create a project");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a conversation title");
      return;
    }

    setIsLoading(true);
    
    try {
      // Create the conversation with character IDs
      const tagsArray = tags.trim() ? tags.split(",").map(tag => tag.trim()) : [];
      const conversation = await createConversation(
        selectedProjectId, 
        title,
        characterIds,
        tagsArray
      );
      
      if (conversation) {
        // Save the messages with proper character_id mapping
        const formattedMessages = messages.map(message => ({
          role: message.role,
          content: message.content,
          persona_id: message.character_id || null // Map character_id to persona_id for storage compatibility
        }));
        
        const saved = await saveConversationMessages(conversation.id, formattedMessages);
        
        if (saved) {
          toast.success("Character conversation saved successfully");
          onSaved(conversation.id, selectedProjectId);
          onOpenChange(false);
        }
      }
    } catch (error) {
      console.error("Error saving character conversation:", error);
      toast.error("Failed to save character conversation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Character Conversation</DialogTitle>
          <DialogDescription>
            Save this character conversation to review later or share with your team.
          </DialogDescription>
        </DialogHeader>
        
        {isCreatingProject ? (
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
            
            <div className="flex gap-2">
              <Button onClick={() => setIsCreatingProject(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleCreateProject} 
                className="flex-1"
                disabled={isLoading || !newProjectName.trim()}
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Create Project
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Conversation Title</Label>
              <Input
                id="title"
                placeholder="Enter a title for this character conversation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project">Select Project</Label>
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
                  onClick={() => setIsCreatingProject(true)}
                  disabled={isLoading}
                  title="Create new project"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (Optional, comma-separated)</Label>
              <Input
                id="tags"
                placeholder="character-chat, historical, analysis"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
            
            <DialogFooter className="sm:justify-start">
              <Button
                type="submit"
                onClick={handleSaveConversation}
                disabled={isLoading || !selectedProjectId || !title.trim()}
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Character Conversation
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SaveCharacterConversationModal;
