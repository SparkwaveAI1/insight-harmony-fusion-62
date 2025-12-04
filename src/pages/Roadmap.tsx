
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import Section from '@/components/ui-custom/Section';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Card from '@/components/ui-custom/Card';

const Roadmap = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Header />
      
      <main className="flex-grow pt-16">
        <Section className="bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="container px-4 mx-auto py-12">
            <div className="mb-10">
              <Link to="/prsna">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to $PRSNA
                </Button>
              </Link>
            </div>
            
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">$PRSNA Roadmap</h1>
              <p className="text-xl text-gray-300">
                We're building PersonaAI in phased, functional layers. Each milestone unlocks a new capability in simulation fidelity, data access, and user experience.
              </p>
            </div>
            
            <div className="grid gap-8">
              {/* Complete */}
              <Card className="border border-green-500/30 bg-gray-800/50">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-500/20 rounded-full">
                    <Check className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-green-400 font-medium">Complete</span>
                      <span className="text-gray-400">Q1 2025</span>
                    </div>
                    <h3 className="text-xl font-bold mb-4">Core Infrastructure</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>Human Interviewer MVP launched</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>Trait architecture v1 formalized</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>First simulated personas deployed</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Complete Q2 2025 */}
              <Card className="border border-green-500/30 bg-gray-800/50">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-500/20 rounded-full">
                    <Check className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-green-400 font-medium">Complete</span>
                      <span className="text-gray-400">Q2 2025</span>
                    </div>
                    <h3 className="text-xl font-bold mb-4">Simulation Layer</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>Multi-persona chat interface (1-on-1 and small group)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>Researcher tools and scenario builder (beta)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>Public dashboard for trait visualizations</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>Persona cloning and A/B variation toolkit</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Complete Q3 2025 */}
              <Card className="border border-green-500/30 bg-gray-800/50">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-500/20 rounded-full">
                    <Check className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-green-400 font-medium">Complete</span>
                      <span className="text-gray-400">Q3 2025</span>
                    </div>
                    <h3 className="text-xl font-bold mb-4">Licensing & Economic Engine</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>Trait architecture v2 formalized</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>Insights Engine complete (automated researcher)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>Minimum Viable Product (MVP) goes live</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>Trait export API + CSV access for researchers</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>PersonaAI Agent launches in Virtuals ACP</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Complete Q4 2025 */}
              <Card className="border border-green-500/30 bg-gray-800/50">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-500/20 rounded-full">
                    <Check className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-green-400 font-medium">Complete</span>
                      <span className="text-gray-400">Q4 2025</span>
                    </div>
                    <h3 className="text-xl font-bold mb-4">Virtual Integration & Scale</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>2500+ AI personas created (and continuing to scale)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>Web2 and Web3 partner projects</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span>Integration into Virtuals Agent Commerce Protocol (ACP)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Planned Q1 2026 */}
              <Card className="border border-purple-500/30 bg-gray-800/50">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-500/20 rounded-full">
                    <Clock className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-purple-400 font-medium">Planned</span>
                      <span className="text-gray-400">Q1 2026</span>
                    </div>
                    <h3 className="text-xl font-bold mb-4">ERC-6551 and Strategic Expansion</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="text-purple-400">🔮</span>
                        <span>Increased focus on user onboarding and revenue growth</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-purple-400">🔮</span>
                        <span>Expanded agent-to-agent use cases within Virtuals ACP</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-purple-400">🔮</span>
                        <span>Mint personas as ERC-6551 NFTs</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-purple-400">🔮</span>
                        <span>Longitudinal persona memory across interviews</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Planned Q2 2026 */}
              <Card className="border border-indigo-500/30 bg-gray-800/50">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-indigo-500/20 rounded-full">
                    <Clock className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-indigo-400 font-medium">Planned</span>
                      <span className="text-gray-400">Q2 2026</span>
                    </div>
                    <h3 className="text-xl font-bold mb-4">Marketplace and Revenue Growth</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="text-indigo-400">🔮</span>
                        <span>NFT-based identity snapshots for licensing, replay</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-indigo-400">🔮</span>
                        <span>Plugin SDK for custom behavior layers</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-indigo-400">🔮</span>
                        <span>Open persona marketplace with contributor rewards</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-indigo-400">🔮</span>
                        <span>Role-play functionality for training (e.g., customer service, sales)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-indigo-400">🔮</span>
                        <span>Autonomous earner use cases (personas as passive income)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Roadmap;
