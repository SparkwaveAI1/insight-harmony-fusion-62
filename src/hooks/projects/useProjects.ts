
import { useState, useEffect, useCallback } from "react";
import { getUserProjectsWithCount, createProject, deleteProject, ProjectWithConversationCount } from "@/services/collections";
import { format } from "date-fns";

export const useProjects = () => {
  const [projects, setProjects] = useState<ProjectWithConversationCount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    const data = await getUserProjectsWithCount();
    setProjects(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    const project = await createProject(newProjectName, newProjectDescription || null);
    if (project) {
      setCreateDialogOpen(false);
      setNewProjectName('');
      setNewProjectDescription('');
      loadProjects();
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm("Are you sure you want to delete this project? This will also delete all conversations in this project.")) {
      const deleted = await deleteProject(id);
      if (deleted) {
        loadProjects();
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return {
    projects,
    isLoading,
    createDialogOpen,
    setCreateDialogOpen,
    newProjectName,
    setNewProjectName,
    newProjectDescription,
    setNewProjectDescription,
    handleCreateProject,
    handleDeleteProject,
    formatDate
  };
};

export default useProjects;
