
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema, defaultFormValues } from "@/schemas/personaQuestionnaireSchema";

export const useQuestionnaireForm = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  return { form };
};
