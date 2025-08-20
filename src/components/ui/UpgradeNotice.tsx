import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const UpgradeNotice = () => {
  return (
    <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-800">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="font-medium">
        Currently upgrading the Persona system - August 20, 2025
      </AlertDescription>
    </Alert>
  );
};

export default UpgradeNotice;