
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Info, Clock, Check, UserPlus } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import Section from '@/components/ui-custom/Section';
import Button from '@/components/ui-custom/Button';
import Card from '@/components/ui-custom/Card';
import Reveal from '@/components/ui-custom/Reveal';

const PersonaCreationLanding = () => {
  const navigate = useNavigate();
  
  const handleStartProcess = () => {
    navigate("/persona-creation/screener");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16">
          {/* Background - Changed to white/light gray gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-background -z-10" />
          
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <Reveal>
                <p className="inline-block mb-4 px-3 py-1 text-xs font-medium tracking-wider text-primary uppercase bg-primary/10 rounded-full">
                  Persona Creation Process
                </p>
              </Reveal>
              
              <Reveal delay={100} animation="blur-in">
                <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl font-plasmik text-balance">
                  Simulate Yourself. Use It or Share It.
                </h1>
                {/* Yellow accent underline */}
                <div className="w-32 h-1 bg-[#FFD600] mx-auto mb-6"></div>
              </Reveal>
              
              <Reveal delay={200}>
                <p className="mb-10 text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
                  Create a lifelike AI version of you—complete with personality traits, decision style, stress behavior, and voice.
                  Keep it for personal use, or contribute it to research and earn rewards. Every persona starts with who you really are.
                </p>
              </Reveal>
              
              <Reveal delay={300}>
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="group bg-[#FFD600] text-[#212121] hover:bg-[#FFD600]/90"
                  onClick={handleStartProcess}
                >
                  Begin Persona Creation
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Process Overview Section - Updated with new styling */}
        <Section className="bg-[#F9F9F9]">
          <div className="container px-4 mx-auto">
            <Reveal>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-3 font-plasmik inline-block">
                  The Persona Creation Process
                </h2>
                {/* Yellow accent underline */}
                <div className="w-32 h-1 bg-[#FFD600] mx-auto"></div>
              </div>
            </Reveal>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  icon: UserPlus,
                  title: "1. Eligibility",
                  description: "A brief screener to confirm you're eligible based on your location and other factors."
                },
                {
                  icon: Info,
                  title: "2. Questionnaire",
                  description: "Answer a set of questions about your background, mindset, and decision habits."
                },
                {
                  icon: Clock,
                  title: "3. Interview",
                  description: "Our AI will conduct an in-depth voice interview to gather essential data for building your persona."
                }
              ].map((step, index) => (
                <Reveal key={index} delay={index * 100}>
                  <Card className="p-6 bg-white border-l-4 border-l-[#FFD600] h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-[#F9F9F9] flex items-center justify-center">
                        <step.icon className="w-5 h-5 text-[#FFD600]" />
                      </div>
                      <h3 className="text-xl font-bold">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </Section>

        {/* Benefits Section - Updated with new styling */}
        <Section>
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <Reveal>
                <h2 className="text-3xl md:text-4xl font-bold mb-3 font-plasmik inline-block">
                  Benefits of AI Personas
                </h2>
                {/* Yellow accent underline */}
                <div className="w-32 h-1 bg-[#FFD600] mx-auto"></div>
              </Reveal>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                {
                  title: "Instant Insights",
                  description: "Get immediate feedback and insights without traditional research delays."
                },
                {
                  title: "Cost Effective",
                  description: "Eliminate the high costs of focus groups and traditional qualitative research."
                },
                {
                  title: "Always Available",
                  description: "Your AI Persona is available 24/7 for ongoing research and validation."
                },
                {
                  title: "Unbiased Responses",
                  description: "Receive consistent, unbiased feedback based on real human data patterns."
                }
              ].map((benefit, index) => (
                <Reveal key={index} delay={index * 100}>
                  <Card className="p-5 h-full bg-white">
                    <div className="mb-4 p-2 bg-[#F9F9F9] w-10 h-10 flex items-center justify-center rounded-full">
                      <Check className="h-5 w-5 text-[#FFD600]" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {benefit.description}
                    </p>
                  </Card>
                </Reveal>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Reveal delay={400}>
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="group bg-[#FFD600] text-[#212121] hover:bg-[#FFD600]/90"
                  onClick={handleStartProcess}
                >
                  Start Creating Your Persona
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Reveal>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
};

export default PersonaCreationLanding;
