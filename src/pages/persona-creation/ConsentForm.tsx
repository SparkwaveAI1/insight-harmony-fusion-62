
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/sections/Footer";
import Button from "@/components/ui-custom/Button";
import Card from "@/components/ui-custom/Card";
import Reveal from "@/components/ui-custom/Reveal";

const ConsentForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const handleConsent = () => {
    setIsSubmitting(true);
    
    try {
      navigate("/persona-creation/questionnaire");
    } catch (error) {
      console.error("Error in consent submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="relative pt-24 pb-16">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/30 via-background to-background -z-10" />
          
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto">
              <Reveal>
                <h1 className="text-3xl md:text-4xl font-bold mb-6 font-plasmik text-center">
                  Consent to Participate in the Persona Interview Process
                </h1>
                <p className="text-sm text-muted-foreground text-center mb-8">
                  Last updated: {currentDate}
                  <br />Contact: info@sparkwave-ai.com
                </p>
              </Reveal>
              
              <Reveal delay={100}>
                <Card className="p-6 md:p-8 mb-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-lg mb-2">1. Purpose of Participation</h3>
                      <p className="text-muted-foreground">
                        You understand that your responses will be used to create a simulated AI persona that reflects your background, perspective, and experiences. These personas are used for qualitative research, behavioral modeling, and strategic insight generation within the PersonaAI platform.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-2">2. Voluntary Participation</h3>
                      <p className="text-muted-foreground">
                        Your participation is entirely voluntary. You may choose to withdraw at any time prior to submission. You may also request deletion of your submitted data after the interview has been completed by contacting:
                        <br />📧 info@sparkwave-ai.com
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-2">3. Use of Your Responses</h3>
                      <p className="text-muted-foreground">
                        Your responses may be used to develop anonymized personas, behavioral profiles, or qualitative insights.
                        <br />These outputs may be shared with third parties (e.g., clients or research partners) in non-identifiable form.
                        <br />Your personal identity will not be disclosed or made public.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-2">4. Token Incentives</h3>
                      <p className="text-muted-foreground">
                        If you provide an Ethereum wallet address, you may be eligible to receive $PRSNA tokens as a participation reward. Providing a wallet address is optional and not required to complete the interview.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-2">5. Data Handling</h3>
                      <p className="text-muted-foreground">
                        You confirm that you have read and agree to the Privacy Policy governing the collection, use, and storage of your data.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-2">6. Age Requirement</h3>
                      <p className="text-muted-foreground">
                        You confirm that you are 18 years of age or older, and legally eligible to participate in this research.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-2">7. No Financial or Legal Advice</h3>
                      <p className="text-muted-foreground">
                        The Persona Interview process is for research and development purposes only. Nothing in this process constitutes legal, financial, or investment advice.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-2">8. Consent</h3>
                      <p className="text-muted-foreground">
                        By clicking "I Agree" or proceeding with the interview, you consent to the collection and use of your data as described above and in the Privacy Policy.
                      </p>
                    </div>
                  </div>
                </Card>
              </Reveal>
              
              <Reveal delay={200}>
                <div className="flex justify-center">
                  <Button 
                    onClick={handleConsent}
                    variant="primary"
                    className="group"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Processing..."
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        I Agree
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ConsentForm;
