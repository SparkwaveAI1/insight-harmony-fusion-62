
import React from "react";
import { cn } from "@/lib/utils";
import Card from "@/components/ui-custom/Card";

interface FormSectionWrapperProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const FormSectionWrapper = ({
  title,
  children,
  className,
}: FormSectionWrapperProps) => {
  return (
    <Card className={cn("mb-6", className)}>
      <div className="px-4 py-2">
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      <div className="px-4 pb-4 pt-2">
        {children}
      </div>
    </Card>
  );
};

export default FormSectionWrapper;
