
import { Link } from "react-router-dom";
import Reveal from "@/components/ui-custom/Reveal";
import RewardsIllustration from "./RewardsIllustration";
import ContactForm from "@/components/contact/ContactForm";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Search, Users, Briefcase, TestTube, Lightbulb } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="container px-4 mx-auto">
      <div className="flex flex-col lg:flex-row gap-12 items-center mb-16">
        {/* Left side - Text Content */}
        <div className="w-full lg:w-1/2">
          <Reveal>
            <div className="inline-flex items-center justify-center bg-secondary/20 px-4 py-2 rounded-full mb-6">
              🚧 Web3 Intelligence
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-plasmik">
              Building the Future of On-Chain Behavioral Intelligence
            </h1>
          </Reveal>
          
          <Reveal delay={200}>
            <p className="text-gray-300 text-pretty mb-6">
              PersonaAI is live inside the Virtuals Agent Commerce Protocol (ACP) on Base blockchain, providing on-demand qualitative insights from thousands of AI personas. $PRSNA fuels realistic human simulations and is set to become a fundamental component of Web3 research.
            </p>
          </Reveal>

          <Reveal delay={250}>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="https://app.virtuals.io/acp" target="_blank" rel="noopener noreferrer">
                <Button 
                  variant="default" 
                  size="lg" 
                  className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Virtuals Butler
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
              <Link to="/dashboard">
                <Button 
                  variant="default" 
                  size="lg" 
                  className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Go To App
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
        
        {/* Right side - Rewards Illustration */}
        <RewardsIllustration />
      </div>

      {/* Separator */}
      <Reveal delay={280}>
        <div className="mb-12">
          <Separator className="bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
        </div>
      </Reveal>

      {/* Persona Pioneer Program Section */}
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Left side - Pioneer Program Content */}
        <div>
          <Reveal delay={300}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-plasmik text-blue-400">
              Persona Pioneer Program
            </h2>
            <p className="text-xl text-gray-300 mb-6">
              Help shape the future of AI-based research. Earn from the start.
            </p>
          </Reveal>

          <Reveal delay={350}>
            <p className="text-gray-300 mb-8">
              PersonaAI is in early access—and we're inviting researchers, builders, and curious minds to join our Pioneer Program.
            </p>
            <p className="text-gray-300 mb-8">
              This is more than beta testing. Pioneers will be the first to explore the power of behaviorally rich AI personas, and you'll be rewarded for real contributions.
            </p>
          </Reveal>

          <Reveal delay={400}>
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <Search className="mr-3 h-6 w-6 text-blue-400" />
                What You'll Do
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Users className="mr-3 h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <strong>Create Personas</strong> — Generate structured behavioral models using demographic + trait inputs
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="mr-3 h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <strong>Run Conversations</strong> — Conduct 1-on-1 chats and focus groups to explore opinions, contradictions, and decisions
                  </div>
                </div>
                <div className="flex items-start">
                  <Briefcase className="mr-3 h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <strong>Build Projects</strong> — Upload research docs, define hypotheses, and use personas to simulate reactions
                  </div>
                </div>
                <div className="flex items-start">
                  <TestTube className="mr-3 h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <strong>Test Use Cases</strong> — From incentive modeling to UX feedback to message framing
                  </div>
                </div>
                <div className="flex items-start">
                  <Lightbulb className="mr-3 h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <strong>Invent New Ones</strong> — We're especially interested in creative applications of simulated behavior
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={450}>
            <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-400/30 rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-4 text-yellow-400">
                🪙 4,000,000 $PRSNA Rewards Pool
              </h3>
              <p className="text-gray-300 mb-4">Rewards will be distributed based on:</p>
              <ul className="space-y-2 text-gray-300 mb-6">
                <li>• Depth of exploration</li>
                <li>• Quality of feedback</li>
                <li>• Use case originality</li>
                <li>• Practical insights surfaced</li>
              </ul>
              <p className="text-gray-300 text-sm">
                You don't need to be an expert in AI or research—we're looking for sharp thinking, creative testing, and signal we can build on.
              </p>
            </div>
          </Reveal>

          <Reveal delay={500}>
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-400/30 rounded-lg p-6 mt-6">
              <h3 className="text-2xl font-bold mb-4 text-pink-400">
                📢 Spread the Word. Get Rewarded.
              </h3>
              <p className="text-gray-300 mb-4">
                If you're active on Twitter, Farcaster, or other platforms, we're also rewarding:
              </p>
              <ul className="space-y-2 text-gray-300 mb-4">
                <li>• Threads that explain the Persona Pioneer Program</li>
                <li>• Walkthroughs of your experiments</li>
                <li>• Use case examples or research highlights</li>
                <li>• Tweets that spark curiosity about $PRSNA and AI-based research</li>
              </ul>
              <p className="text-gray-300 text-sm font-medium">
                The more signal you bring to the network, the more you'll be recognized.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Right side - Contact Form */}
        <div>
          <Reveal delay={550}>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-center">Join the Pioneer Program</h3>
              <ContactForm 
                formType="custom-persona"
                onSuccess={() => {
                  // Handle success if needed
                }}
              />
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
