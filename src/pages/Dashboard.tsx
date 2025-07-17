
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Search, BookOpen, FolderOpen, Plus } from 'lucide-react';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome to your PersonaAI workspace. Manage your personas, research projects, and collections.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Research Card */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Research
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Conduct studies and surveys with your personas to gather insights.
                  </p>
                  <Button asChild className="w-full">
                    <Link to="/research">
                      Start Research
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Personas Card */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Personas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create and manage behaviorally realistic personas for your research.
                  </p>
                  <div className="space-y-2">
                    <Button asChild className="w-full">
                      <Link to="/personas">
                        Manage Personas
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/personas/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Create New
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Collections Card */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-primary" />
                    Collections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Organize personas into collections for targeted research studies.
                  </p>
                  <Button asChild className="w-full">
                    <Link to="/collections">
                      View Collections
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Projects Card */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage research projects and track your studies over time.
                  </p>
                  <div className="space-y-2">
                    <Button asChild className="w-full">
                      <Link to="/projects">
                        View Projects
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/projects/create">
                        <Plus className="h-4 w-4 mr-2" />
                        New Project
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
