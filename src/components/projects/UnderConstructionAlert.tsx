
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Construction } from "lucide-react";

const UnderConstructionAlert = () => {
  return (
    <Alert className="mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
      <Construction className="h-5 w-5 text-amber-500" />
      <AlertTitle className="text-amber-600">Under Construction</AlertTitle>
      <AlertDescription className="text-amber-600">
        This page is still under development and may not function correctly. We're working on it!
      </AlertDescription>
    </Alert>
  );
};

export default UnderConstructionAlert;
