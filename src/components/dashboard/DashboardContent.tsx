
import { BarChart3, Users, Folder, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 font-plasmik">Dashboard</h1>
        <div className="w-32 h-1 bg-accent mb-6"></div>
        <p className="text-muted-foreground mb-8 max-w-3xl">
          Welcome to your PersonaAI dashboard. View your insights, manage your personas, and explore your research data.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Personas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">+2 from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Collections</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground mt-1">+1 from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Data Points</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,293</div>
            <p className="text-xs text-muted-foreground mt-1">+189 from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Research Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground mt-1">+5 from last week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest persona interactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 border-b pb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Persona interview completed</p>
                <p className="text-sm text-muted-foreground">You interviewed "Jamie, 34, Marketing Manager"</p>
              </div>
              <div className="ml-auto text-sm text-muted-foreground">2h ago</div>
            </div>

            <div className="flex items-center gap-4 border-b pb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Folder className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">New collection created</p>
                <p className="text-sm text-muted-foreground">You created "Product Feedback - Q2"</p>
              </div>
              <div className="ml-auto text-sm text-muted-foreground">Yesterday</div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Insight generated</p>
                <p className="text-sm text-muted-foreground">New insights for "Millennial Shopping Habits"</p>
              </div>
              <div className="ml-auto text-sm text-muted-foreground">3 days ago</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Shortcuts to common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-4 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Create a New Persona</p>
                  <p className="text-sm text-muted-foreground">Generate a simulated persona for research</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Folder className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Manage Collections</p>
                  <p className="text-sm text-muted-foreground">Organize and review your persona collections</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Start a Research Project</p>
                  <p className="text-sm text-muted-foreground">Begin a new research interview or focus group</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
