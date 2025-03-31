
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const useQuestionnaireSession = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [participantEmail, setParticipantEmail] = useState<string | null>(null);
  const [participantIdentifier, setParticipantIdentifier] = useState<string | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem("participant_id");
    const email = sessionStorage.getItem("participant_email");
    const identifier = sessionStorage.getItem("participant_identifier");
    
    if (!id || !email) {
      toast({
        title: "Session Error",
        description: "Your session information is missing. Please start from the screener.",
        variant: "destructive",
      });
      navigate("/persona-creation/screener");
      return;
    }

    setParticipantId(id);
    setParticipantEmail(email);
    setParticipantIdentifier(identifier);
  }, [navigate, toast]);

  return {
    participantId,
    participantEmail,
    participantIdentifier
  };
};
