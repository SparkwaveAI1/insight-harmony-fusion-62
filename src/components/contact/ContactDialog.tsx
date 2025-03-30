
import React, { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ContactForm from "./ContactForm";
import { User } from "lucide-react";

interface ContactDialogProps {
  triggerButton?: React.ReactNode;
  title?: string;
  formType?: "discovery" | "demo" | "contact" | "custom-persona";
  className?: string;
}

const ContactDialog = ({ 
  triggerButton, 
  title = "Get in Touch", 
  formType = "contact",
  className 
}: ContactDialogProps) => {
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
          <Button variant="primary" className={className}>
            <User className="mr-2 h-4 w-4" />
            Contact Us
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>
        <ContactForm formType={formType} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default ContactDialog;
