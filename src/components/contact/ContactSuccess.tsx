
import React from "react";
import { CheckCircle } from "lucide-react";

interface ContactSuccessProps {
  formType?: "discovery" | "demo" | "contact" | "custom-persona" | "prsna-feedback";
}

const ContactSuccess = ({ formType = "contact" }: ContactSuccessProps) => {
  const getSuccessMessage = () => {
    switch (formType) {
      case "discovery":
        return "We'll be in touch soon to schedule your discovery call!";
      case "demo":
        return "We'll contact you shortly to arrange your demo!";
      case "custom-persona":
        return "We'll reach out to discuss your custom persona project!";
      case "prsna-feedback":
        return "Thank you for your feedback about $PRSNA and PersonaAI!";
      default:
        return "We'll get back to you as soon as possible!";
    }
  };

  return (
    <div className="text-center space-y-4 py-6">
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Message Sent Successfully!
        </h3>
        <p className="text-gray-600">
          {getSuccessMessage()}
        </p>
      </div>
    </div>
  );
};

export default ContactSuccess;
