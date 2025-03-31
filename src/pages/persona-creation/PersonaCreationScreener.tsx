
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { createParticipant, getParticipantByEmail } from "@/services/supabase/supabaseService";
import { defaultFormValues } from "@/schemas/personaQuestionnaireSchema";

const PersonaCreationScreener = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isResearcher, setIsResearcher] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setEmailError("");

    // Basic validation for email
    if (!email) {
      setEmailError("Please enter your email address");
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Screener - Submitting with email:", email);
      
      // Check if the participant already exists
      const existingParticipant = await getParticipantByEmail(email);
      console.log("Screener - Existing participant check result:", existingParticipant);
      
      if (existingParticipant) {
        // Check which stage they completed last
        const participantId = existingParticipant.id;
        
        // Store the participant info in session storage
        sessionStorage.setItem("participant_id", participantId);
        sessionStorage.setItem("participant_email", email);
        
        console.log("Screener - Existing participant ID stored in session:", participantId);
        
        if (!existingParticipant.consent_accepted) {
          // They haven't completed the consent form yet
          console.log("Screener - Redirecting existing participant to consent form");
          toast({
            title: "Welcome back!",
            description: "Please complete the consent form to continue.",
          });
          navigate("/persona-creation/consent-form");
        } else if (!existingParticipant.questionnaire_data || 
                  Object.keys(existingParticipant.questionnaire_data).length === 0) {
          // They haven't completed the questionnaire yet
          console.log("Screener - Redirecting existing participant to questionnaire");
          toast({
            title: "Welcome back!",
            description: "Please complete the questionnaire to continue.",
          });
          navigate("/persona-creation/questionnaire");
        } else {
          // They've already completed everything
          console.log("Screener - Participant has already completed all steps");
          toast({
            title: "Thank you!",
            description: "You have already completed all parts of this research.",
          });
          navigate("/");
        }
      } else {
        // This is a new participant
        if (isResearcher) {
          toast({
            title: "Thank you for your interest!",
            description: "As a researcher, please contact our team to learn more about our platform.",
            duration: 5000,
          });
          setIsLoading(false);
          return;
        }
        
        // Create a new participant record
        console.log("Screener - Creating new participant with email:", email);
        const participant = await createParticipant({
          email,
          screener_passed: true,
          questionnaire_data: { ...defaultFormValues, email },
          interview_unlocked: false,
          interview_completed: false,
          consent_accepted: false // Add the missing field
        });
        
        if (participant && participant.id) {
          console.log("Screener - New participant created with ID:", participant.id);
          
          // Store the new participant ID in session storage
          sessionStorage.setItem("participant_id", participant.id);
          sessionStorage.setItem("participant_email", email);
          
          toast({
            title: "Screener Completed",
            description: "Thank you! Now let's proceed to the consent form.",
          });
          
          navigate("/persona-creation/consent-form");
        } else {
          throw new Error("Failed to create participant");
        }
      }
    } catch (error) {
      console.error("Error in screener submission:", error);
      toast({
        title: "Error",
        description: "There was a problem processing your submission. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Research Participant Screener</h1>
        <p className="text-gray-600">Please provide your information to participate in our research.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className={emailError ? "border-red-500" : ""}
          />
          {emailError && <p className="text-sm text-red-500">{emailError}</p>}
        </div>
        
        <div className="flex items-start space-x-2">
          <Checkbox 
            id="researcher" 
            checked={isResearcher}
            onCheckedChange={(checked) => setIsResearcher(checked === true)}
          />
          <label 
            htmlFor="researcher" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I am a researcher or industry professional interested in this platform
          </label>
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </form>
    </div>
  );
};

export default PersonaCreationScreener;
