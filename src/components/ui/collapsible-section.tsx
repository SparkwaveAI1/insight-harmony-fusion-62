import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  open,
  onOpenChange,
  className
}: CollapsibleSectionProps) {
  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      defaultOpen={defaultOpen}
      className={cn("border rounded-lg", className)}
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors">
        <h3 className="text-lg font-semibold text-left">{title}</h3>
        <div className="text-muted-foreground">
          <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=closed]:rotate-0 data-[state=open]:rotate-180" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t">
        <div className="p-4">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}