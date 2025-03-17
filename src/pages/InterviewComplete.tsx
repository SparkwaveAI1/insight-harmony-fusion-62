
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Check, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";

interface InterviewCompleteProps {}

const InterviewComplete: React.FC<InterviewCompleteProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { responses, sessionId, completedAt } = location.state || {
    responses: {},
    sessionId: null,
    completedAt: new Date().toISOString()
  };
  
  const responseCount = Object.keys(responses).length;
  const formattedDate = new Date(completedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const downloadTranscript = () => {
    // Format the responses into a readable text format
    const transcriptLines = [
      `PersonaAI Interview Transcript`,
      `Session ID: ${sessionId}`,
      `Completed: ${formattedDate}`,
      ``,
      `Responses:`,
      ``
    ];
    
    Object.entries(responses).forEach(([questionIndex, response]) => {
      const questionNumber = parseInt(questionIndex) + 1;
      const question = INTERVIEW_QUESTIONS[parseInt(questionIndex)];
      
      transcriptLines.push(`Question ${questionNumber}: ${question}`);
      transcriptLines.push(`Response: ${response}`);
      transcriptLines.push(``);
    });
    
    const transcriptText = transcriptLines.join('\n');
    
    // Create a Blob and download it
    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-transcript-${sessionId || Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-16">
        <div className="container max-w-2xl mx-auto px-4">
          <div className="bg-card rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-primary" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Interview Complete!</h1>
            
            <p className="text-muted-foreground mb-8">
              Thank you for participating in the PersonaAI voice interview. Your responses have been
              recorded successfully and will be used to build your persona.
            </p>
            
            <div className="bg-muted/30 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold mb-4">Interview Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Session ID:</span>
                  <span className="font-mono text-sm">{sessionId || "Unknown"}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed:</span>
                  <span>{formattedDate}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Questions Answered:</span>
                  <span>{responseCount} of 10</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={downloadTranscript}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Transcript
              </Button>
              
              <Button 
                className="w-full"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Sample interview questions (same as in VoiceInterviewSession)
const INTERVIEW_QUESTIONS = [
  "Tell me about yourself and what interests you most about participating in this research?",
  "What topics or issues are you most passionate about in today's world?",
  "How do you typically form opinions on complex social or political issues?",
  "Describe a time when you changed your mind about an important topic. What influenced your perspective?",
  "What sources of information do you trust the most and why?",
  "How do you feel technology has impacted how people communicate and share ideas?",
  "What do you think are the biggest challenges facing society today?",
  "How would you describe your decision-making process when faced with difficult choices?",
  "What experiences have shaped your worldview the most?",
  "Is there anything else you'd like to share about your perspectives or experiences?"
];

export default InterviewComplete;
