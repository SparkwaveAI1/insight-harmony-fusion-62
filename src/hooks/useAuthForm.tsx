
import { useState } from "react";
import { z } from "zod";

// Validation schemas
const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[0-9]/, "Password must include at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must include at least one symbol");

export function useAuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateEmail = () => {
    try {
      emailSchema.parse(email);
      setErrors((prev) => ({ ...prev, email: undefined }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, email: error.errors[0].message }));
      }
      return false;
    }
  };

  const validatePassword = () => {
    try {
      passwordSchema.parse(password);
      setErrors((prev) => ({ ...prev, password: undefined }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, password: error.errors[0].message }));
      }
      return false;
    }
  };

  const validateForm = () => {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    return isEmailValid && isPasswordValid;
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    errors,
    validateEmail,
    validatePassword,
    validateForm,
  };
}
