
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormSchema, formSchema, defaultFormValues } from "@/schemas/personaQuestionnaireSchema";

export const useQuestionnaireForm = () => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  return { form };
};
