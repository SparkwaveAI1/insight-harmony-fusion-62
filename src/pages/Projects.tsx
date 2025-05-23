
import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import Section from "@/components/ui-custom/Section";
import UnderConstructionAlert from "@/components/projects/UnderConstructionAlert";
import ProjectsHeader from "@/components/projects/ProjectsHeader";
import ProjectsList from "@/components/projects/ProjectsList";
import CreateProjectDialog from "@/components/projects/CreateProjectDialog";
import useProjects from "@/hooks/projects/useProjects";

const Projects = () => {
  const {
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
  } = useProjects();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Section className="pt-24">
          <div className="container mx-auto px-4">
            <UnderConstructionAlert />
            <ProjectsHeader onCreateNewProject={() => setCreateDialogOpen(true)} />
            <ProjectsList 
              projects={projects} 
              isLoading={isLoading} 
              onDeleteProject={handleDeleteProject}
              formatDate={formatDate}
            />
          </div>
        </Section>
      </main>
      
      <CreateProjectDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        projectName={newProjectName}
        projectDescription={newProjectDescription}
        onProjectNameChange={(e) => setNewProjectName(e.target.value)}
        onProjectDescriptionChange={(e) => setNewProjectDescription(e.target.value)}
        onCreateProject={handleCreateProject}
      />
      
      <Footer />
    </div>
  );
};

export default Projects;
