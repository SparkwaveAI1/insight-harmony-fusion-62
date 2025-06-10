
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const NoSessionFound = () => {
  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-2">No Study Session Found</h2>
      <p className="text-muted-foreground mb-4">Please start a structured study session first.</p>
      <Link to="/research/setup/structured">
        <Button>Return to Study Setup</Button>
      </Link>
    </div>
  );
};
