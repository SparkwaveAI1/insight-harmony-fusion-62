
import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import Section from '@/components/ui-custom/Section';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WhitePaper = () => {
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
            
            <div className="flex items-center mb-16">
              <div className="bg-primary/20 p-4 rounded-full mr-5">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">White Paper</h1>
            </div>
            
            <div className="max-w-4xl mx-auto prose prose-lg prose-invert prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h2:border-b prose-h2:pb-3 prose-h2:border-gray-700 prose-h2:mt-16 prose-p:text-gray-300 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:bg-gray-800 prose-code:text-gray-200 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
              <h1 className="text-5xl mb-8">PersonaAI Unified Whitepaper v1.4</h1>
              
              <h2 className="text-3xl mb-8">Abstract</h2>
              <p>
                PersonaAI is the first AI-driven qualitative research platform designed to simulate and study real human decision-making through dynamic digital personas.
              </p>
              <p>
                The $PRSNA token powers the minting, ownership, trading, leasing, and incentivization of ERC-6551 Persona assets in an integrated Web2/Web3 research and commerce ecosystem.
              </p>
              <p>
                PersonaAI enables a sustainable, scalable agent economy where users create, own, and monetize behavioral assets — aligning incentives across creators, researchers, and platform participants.
              </p>
              <p>
                Website: <a href="https://personaresearch.ai" target="_blank" rel="noopener noreferrer">PersonaResearch.ai</a>
              </p>
              
              <h2 className="text-3xl mb-8">Introduction</h2>
              <p>
                Traditional market research is costly, slow, and limited by small, biased samples. PersonaAI introduces behaviorally realistic AI personas to dramatically expand research capabilities while lowering costs and timelines.
              </p>
              <p>
                PersonaAI is built for Web2 accessibility and Web3 optional ownership:
              </p>
              <ul>
                <li>Web2 users can frictionlessly create and use personas.</li>
                <li>Web3 users can mint, own, and commercialize personas using $PRSNA.</li>
              </ul>
              <p>
                PersonaAI is not a closed platform; it is a research economy.
              </p>
              
              <h2 className="text-3xl mb-8">Platform Structure</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800/50 rounded-xl border border-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 border-b border-gray-700 text-left font-semibold">Layer</th>
                      <th className="px-6 py-4 border-b border-gray-700 text-left font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-6 py-4 border-b border-gray-700">Persona Engine</td>
                      <td className="px-6 py-4 border-b border-gray-700">Creates personas through structured human interviews or behavioral simulation.</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 border-b border-gray-700">ERC-6551 Integration</td>
                      <td className="px-6 py-4 border-b border-gray-700">Enables personas to become on-chain ownable, tradable, rentable digital assets.</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 border-b border-gray-700">Marketplace</td>
                      <td className="px-6 py-4 border-b border-gray-700">Facilitates the buying, selling, renting, and licensing of ERC-6551 personas.</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 border-b border-gray-700">Research Pool</td>
                      <td className="px-6 py-4 border-b border-gray-700">Enables general access to personas while rewarding creators through royalties.</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 border-b border-gray-700">Treasury</td>
                      <td className="px-6 py-4 border-b border-gray-700">Accumulates revenue to fund platform growth and economic sustainability.</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 border-b border-gray-700">Staking Module</td>
                      <td className="px-6 py-4 border-b border-gray-700">Rewards $PRSNA holders with fixed yield and dynamic revenue share.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <h2 className="text-3xl mb-8 mt-12">What Is a Persona?</h2>
              <p>
                In PersonaAI, a "persona" is a structured behavioral model—built either from a real interview or generated using our trait engine.
              </p>
              <p>Each persona includes:</p>
              <ul>
                <li>A demographic and psychological profile</li>
                <li>Contradictions and emergent behavior</li>
                <li>Decision-making tendencies based on validated models</li>
              </ul>
              
              <p>Types of personas:</p>
              <ul>
                <li><strong>Human-Derived</strong>: Created via real interviews</li>
                <li><strong>Simulated</strong>: Generated by our internal modeling engine</li>
                <li><strong>Prompted</strong>: Created from user text input, with internal trait inference</li>
              </ul>
              
              <p className="italic">
                These personas are not avatars—they are testable, probabilistic systems designed for research and agent deployment.
              </p>
              
              <h2 className="text-3xl mb-8">Persona Realism Methodology</h2>
              <p>
                Every PersonaAI model is grounded in empirical psychological frameworks, including Big Five Personality Theory, Moral Foundations Theory, and Behavioral Economics models. Our personas are structured to demonstrate contradiction, incentive sensitivity, and emergent behavior — ensuring authentic decision modeling at scale.
              </p>
              
              <h2 className="text-3xl mb-8">ERC-6551 Persona Ownership</h2>
              <p>
                PersonaAI implements ERC-6551 — the Token-Bound Account (TBA) standard — to transform personas into fully ownable, tradable, and programmable digital assets.
              </p>
              <p>
                Each ERC-6551 persona acts as a smart wallet tied directly to its NFT identity, enabling:
              </p>
              <ul>
                <li><strong>Ownership</strong>: Personas can be bought, sold, leased, and licensed like any digital asset.</li>
                <li><strong>Composability</strong>: Personas can hold data, interact with protocols, and participate in research deployments.</li>
                <li><strong>Provable Provenance</strong>: Every persona's creation, evolution, and history can be tracked on-chain.</li>
                <li><strong>Agent Economy Integration</strong>: ERC-6551 personas can function independently within the broader Virtuals Protocol agent commerce ecosystem.</li>
              </ul>
              <p>
                PersonaAI ensures every minted persona is an active, evolving economic participant.
              </p>
              
              <h2 className="text-3xl mb-8">Virtuals Protocol Integration</h2>
              <p>
                ERC-6551 personas created within PersonaAI will be fully interoperable with the Agent Commerce Protocol (ACP) inside Virtuals, enabling agent deployment, negotiation, and autonomous action across broader Web3 ecosystems.
              </p>
              
              <h2 className="text-3xl mb-8">$PRSNA Tokenomics</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800/50 rounded-xl border border-gray-700 mb-12">
                  <tbody>
                    <tr>
                      <td className="px-6 py-4 border-b border-gray-700 font-semibold">Token Symbol</td>
                      <td className="px-6 py-4 border-b border-gray-700">$PRSNA</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 border-b border-gray-700 font-semibold">Primary Utility</td>
                      <td className="px-6 py-4 border-b border-gray-700">Minting ERC-6551 personas, marketplace transactions, research pool access, staking, platform discounts.</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 border-b border-gray-700 font-semibold">Mint Fee</td>
                      <td className="px-6 py-4 border-b border-gray-700">Small fee paid in $PRSNA to mint a persona to the blockchain.</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 border-b border-gray-700 font-semibold">Revenue Streams</td>
                      <td className="px-6 py-4 border-b border-gray-700">Minting fees, marketplace fees, leasing commissions, research pool usage fees.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <h2 className="text-3xl mb-8">Staking Model</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800/50 rounded-xl border border-gray-700 mb-12">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 border-b border-gray-700 text-left font-semibold">Feature</th>
                      <th className="px-6 py-4 border-b border-gray-700 text-left font-semibold">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-6 py-4 border-b border-gray-700">Base Rewards</td>
                      <td className="px-6 py-4 border-b border-gray-700">7% APR, paid in $PRSNA.</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 border-b border-gray-700">Revenue Sharing</td>
                      <td className="px-6 py-4 border-b border-gray-700">20% of platform-wide on-chain revenue distributed to stakers.</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 border-b border-gray-700">Cooldown Period</td>
                      <td className="px-6 py-4 border-b border-gray-700">7-day unstake cooldown; no forced long-term lockups.</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 border-b border-gray-700">Benefits</td>
                      <td className="px-6 py-4 border-b border-gray-700">Platform discounts, early access opportunities, future partner project eligibility.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <p className="mb-2">
                Staking $PRSNA supports the platform while earning meaningful participation rewards.
              </p>
              <p className="mb-8">
                <strong>Timing</strong>: Implementation of staking during Q2 2025.
              </p>
              
              <h2 className="text-3xl mb-8">How $PRSNA Holders Earn</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800/50 rounded-xl border border-gray-700 mb-12">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 border-b border-gray-700 text-left font-semibold">Method</th>
                      <th className="px-6 py-4 border-b border-gray-700 text-left font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-6 py-4 border-b border-gray-700">Staking Rewards</td>
                      <td className="px-6 py-4 border-b border-gray-700">Earn 7% APR + 20% of on-chain platform revenue.</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 border-b border-gray-700">Platform Discounts</td>
                      <td className="px-6 py-4 border-b border-gray-700">Reduced fees when using $PRSNA for transactions.</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 border-b border-gray-700">Early Access</td>
                      <td className="px-6 py-4 border-b border-gray-700">Eligibility for early participation in partner projects, agent collectives, and research opportunities.</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 border-b border-gray-700">Token Growth Exposure</td>
                      <td className="px-6 py-4 border-b border-gray-700">Benefit from ecosystem expansion, Treasury growth, and token scarcity mechanisms over time.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <p className="mb-8">
                PersonaAI aligns platform success with tokenholder participation incentives.
              </p>
              
              <h2 className="text-3xl mb-8">Marketplace Mechanics</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800/50 rounded-xl border border-gray-700 mb-12">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 border-b border-gray-700 text-left font-semibold">Activity</th>
                      <th className="px-6 py-4 border-b border-gray-700 text-left font-semibold">Role of $PRSNA</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-6 py-4 border-b border-gray-700">Buy/Sell Personas</td>
                      <td className="px-6 py-4 border-b border-gray-700">Marketplace transactions use $PRSNA (with discounts) or USDC/ETH (with standard fees).</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 border-b border-gray-700">Rent Personas</td>
                      <td className="px-6 py-4 border-b border-gray-700">Leasing personas or fleets requires $PRSNA.</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 border-b border-gray-700">Fee Collection</td>
                      <td className="px-6 py-4 border-b border-gray-700">20% of platform revenue flows to stakers; 80% grows the Treasury.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <p className="mb-8">
                PersonaAI positions personas as productive, value-generating research and commerce assets.
              </p>
              
              <h2 className="text-3xl mb-8">Research Pool</h2>
              <p>
                The Research Pool allows both human-derived and synthetic personas to be available for general research access:
              </p>
              <ul>
                <li>Researchers pay a usage fee (in $PRSNA).</li>
                <li>Persona creators receive royalty rewards based on usage.</li>
                <li>Treasury and stakers continue to receive their revenue share allocation.</li>
              </ul>
              
              <p className="font-medium mt-4">
                Royalty Mechanism Statement:
              </p>
              <blockquote className="border-l-4 border-primary pl-4 italic my-4">
                "Research Pool royalty systems will be designed to prioritize sustainable ecosystem growth, platform health, and tokenholder value appreciation."
              </blockquote>
              <p>
                Final royalty payment mechanisms (split percentages, currencies, and schedules) will be finalized and optimized over time to ensure alignment with these principles.
              </p>
              
              <h2 className="text-3xl mb-8">Treasury Strategy</h2>
              <ul>
                <li>Treasury receives 80% of on-chain platform revenue after royalty and token management actions.</li>
                <li>Supports platform sustainability, liquidity provision, growth initiatives, and strategic buybacks if needed.</li>
                <li>Ensures PersonaAI remains independent and scalable without reliance on external capital.</li>
              </ul>
              
              <h2 className="text-3xl mb-8">Future Roadmap</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800/50 rounded-xl border border-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 border-b border-gray-700 text-left font-semibold">Phase</th>
                      <th className="px-6 py-4 border-b border-gray-700 text-left font-semibold">Initiative</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-6 py-4 border-b border-gray-700">Phase 1</td>
                      <td className="px-6 py-4 border-b border-gray-700">Launch marketplace, staking, and ERC-6551 minting. (Q2 2025)</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 border-b border-gray-700">Phase 2</td>
                      <td className="px-6 py-4 border-b border-gray-700">Expand persona fleet leasing, dynamic research pooling, and partner project integrations. Begin agent development for full Agent Commerce Protocol (ACP) integration. (Q3 2025)</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 border-b border-gray-700">Phase 3</td>
                      <td className="px-6 py-4 border-b border-gray-700">Expand marketplace and research network globally. Focus on revenue growth. (Q4 2025)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <h2 className="text-3xl mb-8 mt-12">Conclusion</h2>
              <ul>
                <li>PersonaAI is building the foundation for a real research economy powered by intelligent, behaviorally rich agents.</li>
                <li>$PRSNA is the fuel for an evolving system of ownership, insight, and opportunity.</li>
                <li>With careful economic design prioritizing sustainability, participation, and tokenholder alignment, PersonaAI positions itself at the forefront of the agent commerce revolution.</li>
              </ul>
              
              <div className="flex justify-center mt-16 mb-10">
                <Link to="/prsna/roadmap">
                  <Button size="lg" className="flex items-center gap-2">
                    <Route className="h-5 w-5" />
                    View Our Road Map
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
};

export default WhitePaper;
