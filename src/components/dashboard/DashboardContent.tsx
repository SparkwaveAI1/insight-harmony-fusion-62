
import { useState, useEffect } from "react";
import { BarChart3, Users, Folder, Activity, Loader2, MessageSquare, ArrowRight, Sparkles, Target, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { getUserProjectsWithCount, getUserCollectionsWithCount } from "@/services/collections";

export function DashboardContent() {
  const { activities, isLoading: activitiesLoading } = useRecentActivity();
  const [projects, setProjects] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load projects and collections
        const projectsData = await getUserProjectsWithCount();
        const collectionsData = await getUserCollectionsWithCount();
        
        setProjects(projectsData.slice(0, 3)); // Display top 3
        setCollections(collectionsData.slice(0, 3)); // Display top 3
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Mapping of activity types to their respective icons
  const activityIcons = {
    Users: Users,
    Folder: Folder,
    BarChart3: BarChart3
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 font-plasmik">Dashboard</h1>
        <div className="w-32 h-1 bg-accent mb-6"></div>
        <p className="text-muted-foreground mb-8 max-w-3xl">
          Welcome to your PersonaAI dashboard. View your insights, manage your personas, and explore your research data.
        </p>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Launch Your Research</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Primary Action - Create Persona */}
          <Link to="/simulated-persona" className="group block h-full">
            <Card className="relative overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover-scale h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
              <CardContent className="p-6 relative h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <div className="opacity-50 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    Create a Persona
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Create a behavioral-realistic AI persona in under 5 minutes. Chat with your persona immediately.
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Secondary Action - Manage Projects */}
          <Link to="/projects" className="group block h-full">
            <Card className="hover:shadow-md transition-all duration-300 hover-scale border hover:border-accent/50 h-full">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-blue-600/30 transition-all duration-300">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                    Organize Your Research Hub
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Manage projects, track insights, and organize your persona collections in one place.
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Tertiary Action - Chat with Personas */}
          <Link to="/my-personas" className="group block h-full">
            <Card className="hover:shadow-md transition-all duration-300 hover-scale border hover:border-green-500/50 h-full">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center group-hover:from-green-500/30 group-hover:to-green-600/30 transition-all duration-300">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-green-600 transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-green-600 transition-colors">
                    Start Your Research
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Jump into conversations with your existing personas. Get instant insights and feedback.
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Projects Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Projects</CardTitle>
              <CardDescription>Research projects you're working on</CardDescription>
            </div>
            <Link to="/projects">
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-6">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
                <span className="ml-2">Loading projects...</span>
              </div>
            ) : projects.length > 0 ? (
              <div className="space-y-3">
                {projects.map(project => (
                  <Link key={project.id} to={`/projects/${project.id}`}>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <Folder className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {project.conversation_count} conversation{project.conversation_count !== 1 && 's'}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
                
                <Link to="/projects/new">
                  <div className="flex items-center justify-center p-3 border border-dashed rounded-lg hover:bg-accent/20 cursor-pointer transition-colors">
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Activity className="h-4 w-4 mr-2" />
                      Create New Project
                    </div>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p className="mb-4">No projects created yet</p>
                <Button asChild>
                  <Link to="/projects">Create Your First Project</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest persona interactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activitiesLoading ? (
              <div className="flex justify-center items-center py-6">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
                <span className="ml-2">Loading activities...</span>
              </div>
            ) : activities.length > 0 ? (
              activities.map((activity) => {
                const IconComponent = activityIcons[activity.iconName];
                return (
                  <div key={activity.id} className="flex items-center gap-4 border-b last:border-0 pb-4 last:pb-0">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                    <div className="ml-auto text-sm text-muted-foreground">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No recent activities found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
