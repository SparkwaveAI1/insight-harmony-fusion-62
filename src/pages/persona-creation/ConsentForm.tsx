
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { updateParticipantConsentById } from "@/services/supabase/supabaseService";

const ConsentForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [participantId, setParticipantId] = useState<string | null>(null);

  useEffect(() => {
    // Get participant ID from session storage
    const id = sessionStorage.getItem("participant_id");
    console.log("ConsentForm - Participant ID from session:", id);
    
    if (!id) {
      toast({
        title: "Session Error",
        description: "Your session information is missing. Please start from the screener.",
        variant: "destructive",
      });
      navigate("/persona-creation/screener");
      return;
    }

    setParticipantId(id);
  }, [navigate, toast]);

  const handleConsent = async () => {
    console.log("handleConsent called - Consent checked:", consentChecked);
    
    if (!consentChecked) {
      toast({
        title: "Consent Required",
        description: "Please check the consent box to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!participantId) {
      console.error("No participant ID found when trying to submit consent");
      toast({
        title: "Session Error",
        description: "Your session information is missing. Please start from the screener.",
        variant: "destructive",
      });
      navigate("/persona-creation/screener");
      return;
    }

    setIsSubmitting(true);
    console.log("Saving consent for participant ID:", participantId);

    try {
      // Save consent status to Supabase using participant ID
      const updated = await updateParticipantConsentById(participantId, true);
      console.log("Consent update result:", updated);
      
      if (updated) {
        toast({
          title: "Consent Recorded",
          description: "Thank you for providing your consent. You will now proceed to the questionnaire.",
          duration: 5000,
        });
        
        console.log("Navigation to questionnaire initiated");
        // Force a clean navigation with replace to avoid history issues
        navigate("/persona-creation/questionnaire", { replace: true });
      } else {
        throw new Error("Failed to save consent information");
      }
    } catch (error) {
      console.error("Error saving consent information:", error);
      toast({
        title: "Submission Error",
        description: "There was an error recording your consent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = () => {
    // If they decline consent, take them back to the start
    sessionStorage.removeItem("participant_id");
    sessionStorage.removeItem("participant_email");
    navigate("/persona-creation/screener");
    
    toast({
      title: "Consent Declined",
      description: "You have declined to participate in this research. Thank you for your time.",
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Research Consent Form</h1>
        <p className="text-gray-600">Please review and provide your consent before proceeding.</p>
      </div>

      <div className="bg-muted/30 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Study Information</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Purpose</h3>
            <p className="text-gray-700">This research aims to understand user behaviors, preferences, and decision-making processes to develop accurate AI personas for product and service testing.</p>
          </div>
          
          <div>
            <h3 className="font-medium">Process</h3>
            <p className="text-gray-700">Participation involves completing a questionnaire and a conversational interview. The interview will be recorded for analysis purposes.</p>
          </div>
          
          <div>
            <h3 className="font-medium">Data Usage</h3>
            <p className="text-gray-700">Information collected will be used to create anonymized AI models that simulate user behaviors. Your personal identifiers will be removed from any published results.</p>
          </div>
          
          <div>
            <h3 className="font-medium">Rights</h3>
            <p className="text-gray-700">Participation is voluntary. You can withdraw at any time. You can request access to your data or ask for its deletion by contacting our research team.</p>
          </div>
        </div>
      </div>

      <div className="flex items-start space-x-2 mb-6">
        <Checkbox 
          id="consent" 
          checked={consentChecked}
          onCheckedChange={(checked) => setConsentChecked(checked === true)}
        />
        <label 
          htmlFor="consent" 
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I have read and understand the information above. I agree to participate in this research and allow my data to be used as described.
        </label>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleDecline}
          disabled={isSubmitting}
        >
          Decline
        </Button>
        <Button 
          onClick={handleConsent} 
          disabled={!consentChecked || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "I Consent"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ConsentForm;
