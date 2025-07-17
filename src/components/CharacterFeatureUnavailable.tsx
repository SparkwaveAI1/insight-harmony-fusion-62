
import { Link } from "react-router-dom";
import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";

const CharacterFeatureUnavailable = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 max-w-lg">
        <Construction className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
        <h1 className="text-3xl font-bold mb-4">Character Features Temporarily Unavailable</h1>
        <p className="text-muted-foreground mb-8">
          The character creation and management features are currently under maintenance. 
          Please check back later or explore our persona features instead.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link to="/dashboard">
              Go to Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/persona-viewer">
              View Personas
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CharacterFeatureUnavailable;
