
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { generateUnlockCodeById, validateUnlockCodeById } from "@/services/supabase/supabaseService";

const UnlockInterview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [unlockCode, setUnlockCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [participantId, setParticipantId] = useState<string | null>(null);

  useEffect(() => {
    // Get participant ID from session storage
    const id = sessionStorage.getItem("participant_id");
    if (!id) {
      toast({
        title: "Session Error",
        description: "Your participant information is missing. Please start from the beginning.",
        variant: "destructive",
      });
      navigate("/persona-creation/screener");
      return;
    }
    setParticipantId(id);
  }, [navigate, toast]);

  const handleGenerateCode = async () => {
    if (!participantId) return;
    
    setIsSubmitting(true);
    try {
      const code = await generateUnlockCodeById(participantId);
      if (code) {
        toast({
          title: "Unlock Code Generated",
          description: `Your unlock code is: ${code}`,
          duration: 10000,
        });
      } else {
        throw new Error("Failed to generate unlock code");
      }
    } catch (error) {
      console.error("Error generating unlock code:", error);
      toast({
        title: "Error",
        description: "Failed to generate unlock code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlockInterview = async () => {
    if (!participantId || !unlockCode) return;
    
    setIsSubmitting(true);
    try {
      const isValid = await validateUnlockCodeById(participantId, unlockCode);
      if (isValid) {
        toast({
          title: "Interview Unlocked",
          description: "You can now proceed to the interview.",
        });
        navigate("/interview");
      } else {
        toast({
          title: "Invalid Code",
          description: "The unlock code you entered is incorrect. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error validating unlock code:", error);
      toast({
        title: "Error",
        description: "Failed to validate unlock code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Unlock Interview</h1>
        <p className="text-gray-600">
          Generate or enter an unlock code to access your interview.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Generate New Code</h2>
          <Button 
            onClick={handleGenerateCode}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Generate Unlock Code"
            )}
          </Button>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-2">Enter Unlock Code</h2>
          <div className="space-y-4">
            <Input
              placeholder="Enter your 6-digit code"
              value={unlockCode}
              onChange={(e) => setUnlockCode(e.target.value)}
              maxLength={6}
            />
            <Button 
              onClick={handleUnlockInterview}
              disabled={isSubmitting || unlockCode.length !== 6}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Unlock Interview"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnlockInterview;
