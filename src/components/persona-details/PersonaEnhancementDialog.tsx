import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import { Persona } from "@/services/persona/types";
import { PersonaValidationResult } from "@/services/persona/validation/personaValidation";
import { enhancePersona, EnhancementOptions } from "@/services/persona/enhancePersona";
import { toast } from "sonner";

interface PersonaEnhancementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persona: Persona;
  validationResult: PersonaValidationResult;
  onPersonaUpdated: (updatedPersona: Persona) => void;
}

export default function PersonaEnhancementDialog({
  open,
  onOpenChange,
  persona,
  validationResult,
  onPersonaUpdated
}: PersonaEnhancementDialogProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [options, setOptions] = useState<EnhancementOptions>({
    enhanceEmotionalTriggers: !validationResult.completeness.hasEmotionalTriggers,
    enhanceInterviewResponses: !validationResult.completeness.hasInterviewResponses,
    enhanceTraitProfile: !validationResult.completeness.hasRealTraits,
    enhanceMetadata: !validationResult.completeness.hasMetadata
  });

  const handleEnhance = async () => {
    if (!Object.values(options).some(Boolean)) {
      toast.error("Please select at least one enhancement option");
      return;
    }

    setIsEnhancing(true);
    
    try {
      const result = await enhancePersona(persona.persona_id, options);
      
      if (result.success && result.persona) {
        toast.success(`Enhanced ${persona.name} successfully!`);
        if (result.enhancementLog && result.enhancementLog.length > 0) {
          console.log('Enhancement completed:', result.enhancementLog);
        }
        onPersonaUpdated(result.persona);
        onOpenChange(false);
      } else {
        toast.error(result.error || "Enhancement failed");
      }
    } catch (error) {
      console.error('Enhancement error:', error);
      toast.error("An unexpected error occurred during enhancement");
    } finally {
      setIsEnhancing(false);
    }
  };

  const toggleOption = (key: keyof EnhancementOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const enhancementItems = [
    {
      key: 'enhanceEmotionalTriggers' as keyof EnhancementOptions,
      label: 'Emotional Triggers',
      description: 'Generate positive and negative emotional triggers',
      complete: validationResult.completeness.hasEmotionalTriggers,
      recommended: !validationResult.completeness.hasEmotionalTriggers
    },
    {
      key: 'enhanceInterviewResponses' as keyof EnhancementOptions,
      label: 'Interview Responses',
      description: 'Generate comprehensive interview responses',
      complete: validationResult.completeness.hasInterviewResponses,
      recommended: !validationResult.completeness.hasInterviewResponses
    },
    {
      key: 'enhanceTraitProfile' as keyof EnhancementOptions,
      label: 'Trait Profile',
      description: 'Regenerate psychological trait measurements',
      complete: validationResult.completeness.hasRealTraits,
      recommended: !validationResult.completeness.hasRealTraits
    },
    {
      key: 'enhanceMetadata' as keyof EnhancementOptions,
      label: 'Metadata',
      description: 'Fill in missing demographic information',
      complete: validationResult.completeness.hasMetadata,
      recommended: !validationResult.completeness.hasMetadata
    }
  ];

  const selectedCount = Object.values(options).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Enhance Persona
          </DialogTitle>
          <DialogDescription>
            Improve "{persona.name}" by filling in missing trait information using AI generation.
            This will preserve existing data while adding missing components.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4">
            {enhancementItems.map((item) => (
              <div
                key={item.key}
                className="flex items-start space-x-3 p-4 rounded-lg border bg-card"
              >
                <Checkbox
                  id={item.key}
                  checked={options[item.key] || false}
                  onCheckedChange={() => toggleOption(item.key)}
                  disabled={isEnhancing}
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={item.key}
                      className="text-sm font-medium cursor-pointer flex items-center gap-2"
                    >
                      {item.label}
                      {item.complete ? (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Missing
                        </Badge>
                      )}
                    </label>
                    {item.recommended && (
                      <Badge variant="default" className="text-xs">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {selectedCount > 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <p className="text-sm text-primary font-medium">
                {selectedCount} enhancement{selectedCount !== 1 ? 's' : ''} selected
              </p>
              <p className="text-xs text-primary/80 mt-1">
                This will generate missing information while preserving existing data.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isEnhancing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEnhance}
            disabled={isEnhancing || selectedCount === 0}
          >
            {isEnhancing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enhancing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Enhance Persona
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}