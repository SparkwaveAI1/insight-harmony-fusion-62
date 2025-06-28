
import { Link } from "react-router-dom";
import { BarChart3, Users, MessageSquare, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui-custom/Card";
import Section from "@/components/ui-custom/Section";

const DashboardContent = () => {
  return (
    <div className="space-y-8">
      <Section>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to PersonaAI</h1>
          <p className="text-lg text-muted-foreground">
            Your AI-powered research and character creation platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-md transition-shadow">
            <Link to="/persona-viewer">
              <div className="text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">View Personas</h3>
                <p className="text-muted-foreground mb-4">
                  Browse and manage your AI personas
                </p>
              </div>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow">
            <Link to="/research">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Research</h3>
                <p className="text-muted-foreground mb-4">
                  Conduct AI-powered research sessions
                </p>
              </div>
            </Link>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow">
            <Link to="/characters-home">
              <div className="text-center">
                <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Characters</h3>
                <p className="text-muted-foreground mb-4">
                  Create and manage AI characters
                </p>
              </div>
            </Link>
          </Card>
        </div>
      </Section>

      <Section>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild>
              <Link to="/characters/create/historical">
                <Clock className="h-4 w-4 mr-2" />
                Create Historical Character
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/characters/create/creative">
                <Sparkles className="h-4 w-4 mr-2" />
                Create Creative Character
              </Link>
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default DashboardContent;
