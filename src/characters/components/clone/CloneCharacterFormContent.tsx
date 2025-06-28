
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CloneFormValues } from "./cloneFormSchema";

interface CloneCharacterFormContentProps {
  form: UseFormReturn<CloneFormValues>;
  onSubmit: (data: CloneFormValues) => Promise<boolean>;
  isSubmitting: boolean;
  characterName: string;
}

export function CloneCharacterFormContent({
  form,
  onSubmit,
  isSubmitting,
  characterName
}: CloneCharacterFormContentProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Clone Character: {characterName}</h3>
          <p className="text-sm text-muted-foreground">
            Create a customized version of this character with your own modifications.
          </p>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="name">New Character Name</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Enter the name for your cloned character"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customization_notes">
            Customization Notes (Optional)
          </Label>
          <Textarea
            id="customization_notes"
            {...register("customization_notes")}
            placeholder="Describe any specific changes or customizations you'd like to make to this character..."
            rows={4}
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground">
            These notes will help guide how the cloned character differs from the original.
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
          {isSubmitting ? "Cloning Character..." : "Clone Character"}
        </Button>
      </div>
    </form>
  );
}
