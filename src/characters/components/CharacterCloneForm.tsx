
import React from "react";
import { Character } from "../types/characterTraitTypes";
import { NonHumanoidCharacter } from "../types/nonHumanoidTypes";
import { CloneCharacterFormContent } from "./clone/CloneCharacterFormContent";
import { useCharacterClone } from "./clone/useCharacterClone";

interface CharacterCloneFormProps {
  character: Character | NonHumanoidCharacter;
}

export default function CharacterCloneForm({ character }: CharacterCloneFormProps) {
  const { form, onSubmit, isSubmitting } = useCharacterClone(character);

  return (
    <CloneCharacterFormContent
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      character={character}
    />
  );
}
