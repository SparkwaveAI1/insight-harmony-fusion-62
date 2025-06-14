
import React, { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FeedbackForm from "./FeedbackForm";
import { MessageSquare } from "lucide-react";

interface FeedbackDialogProps {
  triggerButton?: React.ReactNode;
  title?: string;
  className?: string;
}

const FeedbackDialog = ({ 
  triggerButton, 
  title = "Share Your Feedback",
  className 
}: FeedbackDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    // Close the dialog after successful form submission
    setTimeout(() => {
      setOpen(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="default" className={className}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Share Feedback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>
        <FeedbackForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
