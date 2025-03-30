
import React from "react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
  open,
  onOpenChange,
}: FormSectionWrapperProps) => {
  return (
    <Card className={cn("mb-6", className)}>
      <Collapsible open={open} onOpenChange={onOpenChange}>
        <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-2">
          <h3 className="text-lg font-medium">{title}</h3>
          <div className="text-sm text-muted-foreground">
            {open ? "Hide" : "Show"}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-4 pt-2">
          {children}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default FormSectionWrapper;
