
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import Section from '@/components/ui-custom/Section';
import { ProjectCleanup } from '@/components/admin/ProjectCleanup';

const ProjectCleanupPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Section className="pt-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2 font-plasmik">Project Cleanup</h1>
              <p className="text-muted-foreground">
                Clean up empty research session projects
              </p>
            </div>
            <ProjectCleanup />
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectCleanupPage;
