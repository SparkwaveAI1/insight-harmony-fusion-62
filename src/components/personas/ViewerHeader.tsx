
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Button from "@/components/ui-custom/Button";

interface ViewerHeaderProps {
  isLoading: boolean;
}

const ViewerHeader = ({ isLoading }: ViewerHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <Button 
        variant="outline" 
        onClick={() => window.location.reload()}
        className="gap-2"
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </div>
  );
};

export default ViewerHeader;
