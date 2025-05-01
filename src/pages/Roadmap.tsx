
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import Section from '@/components/ui-custom/Section';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Roadmap = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Header />
      
      <main className="flex-grow pt-16">
        <Section className="bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="container px-4 mx-auto py-8">
            <div className="mb-8">
              <Link to="/prsna">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to $PRSNA
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center mb-12">
              <div className="bg-primary/20 p-3 rounded-full mr-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">Road Map</h1>
            </div>
            
            <div className="max-w-4xl mx-auto prose prose-invert prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h2:border-b prose-h2:pb-2 prose-h2:border-gray-700 prose-p:text-gray-300 prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
              <h1>Roadmap (2025–2026)</h1>
              
              <p>
                We're building PersonaAI in phased, functional layers. Each milestone unlocks a new capability 
                in simulation fidelity, data access, and user experience.
              </p>
              
              <div className="space-y-16 mt-12">
                <div className="relative border-l-2 border-primary pl-8 pb-2">
                  <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-primary transform -translate-x-1/2"></div>
                  <h2 className="border-0 pb-2 text-primary flex items-center">
                    <span className="bg-primary/20 text-primary px-3 py-1 rounded-md text-sm font-medium mr-3">✅ Complete</span>
                    Q1 2025 – Core Infrastructure
                  </h2>
                  <ul className="mt-4">
                    <li>Human Interviewer MVP launched</li>
                    <li>Trait architecture v1 formalized</li>
                    <li>First simulated personas deployed</li>
                  </ul>
                </div>
                
                <div className="relative border-l-2 border-blue-500 pl-8 pb-2">
                  <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-blue-500 transform -translate-x-1/2"></div>
                  <h2 className="border-0 pb-2 text-blue-500 flex items-center">
                    <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-md text-sm font-medium mr-3">🚧 In Progress</span>
                    Q2 2025 – Simulation Layer
                  </h2>
                  <ul className="mt-4">
                    <li>Multi-persona chat interface (1-on-1 and small group)</li>
                    <li>Researcher tools and scenario builder (beta)</li>
                    <li>Public dashboard for trait visualizations</li>
                    <li>Persona cloning and A/B variation toolkit</li>
                    <li>Interview-to-persona pipeline completed</li>
                  </ul>
                </div>
                
                <div className="relative border-l-2 border-gray-600 pl-8 pb-2">
                  <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-gray-600 transform -translate-x-1/2"></div>
                  <h2 className="border-0 pb-2 text-gray-400 flex items-center">
                    <span className="bg-gray-700 text-gray-400 px-3 py-1 rounded-md text-sm font-medium mr-3">🔜 Upcoming</span>
                    Q3 2025 – Licensing & Economic Engine
                  </h2>
                  <ul className="mt-4 text-gray-400">
                    <li>ERC-6551 deployment for personas</li>
                    <li>Begin $PRSNA staking integration</li>
                    <li>Royalties and licensing terms for paid simulations</li>
                    <li>Trait export API + CSV access for researchers</li>
                    <li>PersonaAI Agent launches in Virtuals ACP</li>
                  </ul>
                </div>
                
                <div className="relative border-l-2 border-gray-600 pl-8 pb-2">
                  <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-gray-600 transform -translate-x-1/2"></div>
                  <h2 className="border-0 pb-2 text-gray-400 flex items-center">
                    <span className="bg-gray-700 text-gray-400 px-3 py-1 rounded-md text-sm font-medium mr-3">🔮 Planned</span>
                    Q4 2025 – Virtual Integration & Scale
                  </h2>
                  <ul className="mt-4 text-gray-400">
                    <li>Full support for ACP-based agent negotiation</li>
                    <li>Town-hall simulation mode (up to 50 personas)</li>
                    <li>$PRSNA staking tiers and usage limits</li>
                    <li>First third-party research client projects (Vital Findings, etc.)</li>
                    <li>NFT-based identity snapshots for licensing, replay</li>
                  </ul>
                </div>
                
                <div className="relative border-l-2 border-gray-600 pl-8">
                  <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-gray-600 transform -translate-x-1/2"></div>
                  <h2 className="border-0 pb-2 text-gray-400 flex items-center">
                    <span className="bg-gray-700 text-gray-400 px-3 py-1 rounded-md text-sm font-medium mr-3">🔮 Planned</span>
                    2026+ – Strategic Expansion
                  </h2>
                  <ul className="mt-4 text-gray-400">
                    <li>Self-service onboarding for research firms</li>
                    <li>Longitudinal persona memory across interviews</li>
                    <li>Plugin SDK for custom behavior layers</li>
                    <li>Governance scenario simulator (for DAOs & beyond)</li>
                    <li>Open persona marketplace with contributor rewards</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
};

export default Roadmap;
