
import { BarChart3, Users, Folder, Activity, Loader2, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

export function DashboardContent() {
  const { activities, isLoading } = useRecentActivity();

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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions Card - Moved to the top */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Shortcuts to common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <Link to="/simulated-persona" className="flex items-center gap-4 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Create a New Persona</p>
                  <p className="text-sm text-muted-foreground">Generate a simulated persona for research</p>
                </div>
              </Link>

              <Link to="/collections" className="flex items-center gap-4 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Folder className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Manage Collections</p>
                  <p className="text-sm text-muted-foreground">Organize and review your persona collections</p>
                </div>
              </Link>

              <Link to="/my-personas" className="flex items-center gap-4 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Chat with a Persona</p>
                  <p className="text-sm text-muted-foreground">Interact with your simulated personas</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Card - Now below Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest persona interactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
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
