
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ResearchModeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ResearchModeSelector = ({ open, onOpenChange }: ResearchModeSelectorProps) => {
  const navigate = useNavigate();

  const handleModeSelect = (mode: string) => {
    onOpenChange(false);
    navigate(`/research?mode=${mode}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Research Mode</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Button 
            onClick={() => handleModeSelect('focus-group')}
            className="w-full"
          >
            AI Focus Groups
          </Button>
          <Button 
            onClick={() => handleModeSelect('custom')}
            className="w-full"
            variant="outline"
          >
            Custom Research
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResearchModeSelector;
