
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CloneFormValues } from "./cloneFormSchema";
import { Character } from "../../types/characterTraitTypes";
import { NonHumanoidCharacter } from "../../types/nonHumanoidTypes";

interface CloneCharacterFormContentProps {
  form: UseFormReturn<CloneFormValues>;
  onSubmit: (data: CloneFormValues) => Promise<boolean>;
  isSubmitting: boolean;
  character: Character | NonHumanoidCharacter;
}

export function CloneCharacterFormContent({
  form,
  onSubmit,
  isSubmitting,
  character
}: CloneCharacterFormContentProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const getCharacterTypeLabel = () => {
    if (character.character_type === 'historical') return 'Historical';
    if (character.character_type === 'multi_species' || 'species_type' in character) return 'Creative Entity';
    if (character.character_type === 'fictional') return 'Creative';
    return 'Character';
  };

  const getProcessDescription = () => {
    if (character.character_type === 'historical') {
      return 'This will create a new historical character using our research-based historical character creation process with your customizations.';
    }
    if (character.character_type === 'multi_species' || 'species_type' in character) {
      return 'This will create a new creative entity using our advanced creative character creation process with your customizations.';
    }
    if (character.character_type === 'fictional') {
      return 'This will create a new creative character using our comprehensive creative character creation process with your customizations.';
    }
    return 'This will create a new customized version of this character.';
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">Clone & Customize: {character.name}</h3>
            <Badge variant="secondary">{getCharacterTypeLabel()}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {getProcessDescription()}
          </p>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="name">New Character Name</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Enter the name for your customized character"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customization_notes">
            Customization Instructions <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="customization_notes"
            {...register("customization_notes")}
            placeholder={`Describe how you want to customize this ${getCharacterTypeLabel().toLowerCase()} character. Be specific about personality changes, background modifications, or trait adjustments you'd like to see...`}
            rows={5}
            disabled={isSubmitting}
          />
          {errors.customization_notes && (
            <p className="text-sm text-red-600">{errors.customization_notes.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {character.character_type === 'historical' && 
              'These instructions will guide how the historical character creation process adapts the original character while maintaining historical accuracy.'
            }
            {(character.character_type === 'multi_species' || 'species_type' in character) && 
              'These instructions will guide how the creative character creation process adapts the original entity with your desired modifications.'
            }
            {character.character_type === 'fictional' && 
              'These instructions will guide how the creative character creation process adapts the original character with your desired changes.'
            }
            {!['historical', 'multi_species', 'fictional'].includes(character.character_type) && 
              'These instructions will help guide how the cloned character differs from the original.'
            }
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating Customized Character..." : "Clone & Customize"}
        </Button>
      </div>
    </form>
  );
}
