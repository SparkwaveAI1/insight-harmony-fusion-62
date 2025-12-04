
import React, { useState, useRef, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/sections/Footer';
import Section from '@/components/ui-custom/Section';
import Card from '@/components/ui-custom/Card';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Route, 
  Book, 
  Layers, 
  User, 
  Coins, 
  BarChart, 
  ShoppingCart, 
  Search, 
  Wallet, 
  Calendar,
  Rocket,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const WhitePaper = () => {
  const [activeSection, setActiveSection] = useState('');
  const sectionRefs = {
    abstract: useRef(null),
    introduction: useRef(null),
    platform: useRef(null),
    persona: useRef(null),
    ownership: useRef(null),
    tokenomics: useRef(null),
    marketplace: useRef(null),
    research: useRef(null),
    treasury: useRef(null),
    roadmap: useRef(null),
    conclusion: useRef(null),
  };

  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId);
    sectionRefs[sectionId].current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace('section-', '');
            setActiveSection(id);
          }
        });
      },
      { rootMargin: "-20% 0px -80% 0px" }
    );

    Object.keys(sectionRefs).forEach((key) => {
      if (sectionRefs[key].current) {
        observer.observe(sectionRefs[key].current);
      }
    });

    return () => {
      Object.keys(sectionRefs).forEach((key) => {
        if (sectionRefs[key].current) {
          observer.unobserve(sectionRefs[key].current);
        }
      });
    };
  }, []);

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
            
            <div className="flex items-center mb-12">
              <div className="bg-primary/20 p-4 rounded-full mr-5">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">White Paper</h1>
                <p className="text-gray-400 mt-2">Version 1.5 • Last Updated December 2025</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {/* Sticky Navigation */}
              <div className="hidden lg:block">
                <div className="sticky top-28 p-6 bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700/50">
                  <h3 className="font-semibold text-lg mb-4">Contents</h3>
                  <ul className="space-y-2 text-sm">
                    {Object.keys(sectionRefs).map((key) => (
                      <li key={key}>
                        <button 
                          onClick={() => handleNavClick(key)} 
                          className={`flex items-center w-full text-left py-1 px-2 rounded-md transition-colors ${
                            activeSection === key 
                              ? "bg-primary/20 text-white font-medium" 
                              : "hover:bg-gray-700/50 text-gray-300"
                          }`}
                        >
                          {activeSection === key && <ChevronRight className="h-3 w-3 mr-1.5" />}
                          <span className={activeSection === key ? "ml-0" : "ml-4"}>
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3 prose prose-lg prose-invert prose-headings:font-bold prose-h2:text-2xl lg:prose-h2:text-3xl prose-h2:flex prose-h2:items-center prose-h2:gap-3 prose-h3:text-xl prose-h2:pb-3 prose-h2:border-b prose-h2:border-gray-700/70 prose-h2:mt-16 prose-p:text-gray-300 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:bg-gray-800 prose-code:text-gray-200 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                <div id="section-abstract" ref={sectionRefs.abstract} className="mb-16 p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-800/70 border border-gray-700/50">
                  <h1 className="text-4xl lg:text-5xl mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">PersonaAI Unified Whitepaper v1.5</h1>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-2xl lg:text-3xl m-0 p-0 border-0">Abstract</h2>
                  </div>
                  
                  <p className="mb-6">
                    PersonaAI is the first AI-driven qualitative research platform designed to simulate and study real human decision-making through dynamic digital personas.
                  </p>
                  <p className="mb-6">
                    PersonaAI now operates as an Insight Node inside the Virtuals Agent Commerce Protocol (ACP). Any agent, application, or human user in the Virtuals ecosystem can invoke PersonaAI to run qualitative simulations using our full persona engine. This establishes PersonaAI as a core part of the protocol's research layer, supplying structured human-like insight wherever it is needed.
                  </p>
                  <p className="mb-6">
                    The $PRSNA token powers the minting, ownership, trading, leasing, and incentivization of ERC-6551 Persona assets in an integrated Web2/Web3 research and commerce ecosystem.
                  </p>
                  <p className="mb-6">
                    PersonaAI enables a sustainable, scalable agent economy where users create, own, and monetize behavioral assets — aligning incentives across creators, researchers, and platform participants.
                  </p>
                  <p className="mb-6">
                    Website: <a href="https://personaresearch.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">PersonaResearch.ai</a>
                  </p>
                </div>
                
                <div id="section-introduction" ref={sectionRefs.introduction} className="scroll-mt-24 mb-16">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Book className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="m-0 p-0 border-0">Introduction</h2>
                  </div>
                  
                  <p className="mb-6">
                    Traditional market research is costly, slow, and limited by small, biased samples. PersonaAI introduces behaviorally realistic AI personas to dramatically expand research capabilities while lowering costs and timelines.
                  </p>
                  <p className="mb-6">
                    The platform includes an automated Insights Engine that runs conversational studies at scale, turning persona interactions into structured findings.
                  </p>
                  <p className="mb-6">
                    This engine is fully integrated with the Virtuals Agent Commerce Protocol (ACP), allowing any agent or application in the ecosystem to request qualitative research on demand. Through ACP, PersonaAI becomes a central component of the Virtuals research layer.
                  </p>
                  <p className="mb-6">
                    PersonaAI is built for Web2 accessibility and Web3 optional ownership:
                  </p>
                  <ul className="mb-6 list-disc list-inside">
                    <li>Web2 users can frictionlessly create and use personas.</li>
                    <li>Agents and human users can run automated research via Virtuals ACP and the PersonaAI Insights Engine.</li>
                    <li>Coming soon: AI personas as ERC-6551 NFTs— mint, own, and commercialize personas using $PRSNA.</li>
                  </ul>
                  <p className="mb-6">
                    PersonaAI is not a closed platform; it is a research economy.
                  </p>
                </div>
                
                <div id="section-platform" ref={sectionRefs.platform} className="scroll-mt-24 mb-16">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Layers className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="m-0 p-0 border-0">Platform Structure</h2>
                  </div>
                  
                  <Card className="overflow-hidden bg-gray-800/50 border-gray-700/50 mb-8">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-white font-semibold">Layer</TableHead>
                          <TableHead className="text-white font-semibold">Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="border-gray-700/50">
                          <TableCell className="font-medium">Persona Engine</TableCell>
                          <TableCell>Creates personas through structured human interviews or behavioral simulation.</TableCell>
                        </TableRow>
                        <TableRow className="border-gray-700/50">
                          <TableCell className="font-medium">Insights Engine</TableCell>
                          <TableCell>Automatically runs conversational studies at scale and converts persona responses into structured research outputs, including summaries, themes, contradictions, and behavioral signals.</TableCell>
                        </TableRow>
                        <TableRow className="border-gray-700/50">
                          <TableCell className="font-medium">PersonaAI Agent in Virtuals ACP</TableCell>
                          <TableCell>Acts as an insight node inside the Virtuals Agent Commerce Protocol, allowing any agent or application in the ecosystem to request qualitative research and receive structured results on demand.</TableCell>
                        </TableRow>
                        <TableRow className="border-gray-700/50">
                          <TableCell className="font-medium">ERC-6551 Integration (Q1 2026)</TableCell>
                          <TableCell>Enables personas to become on-chain ownable, tradable, rentable digital assets.</TableCell>
                        </TableRow>
                        <TableRow className="border-gray-700/50">
                          <TableCell className="font-medium">Marketplace (Q2 2026)</TableCell>
                          <TableCell>Facilitates the buying, selling, renting, and licensing of ERC-6551 personas.</TableCell>
                        </TableRow>
                        <TableRow className="border-gray-700/50">
                          <TableCell className="font-medium">Research Pool</TableCell>
                          <TableCell>Enables general access to personas while rewarding creators through royalties.</TableCell>
                        </TableRow>
                        <TableRow className="border-gray-700/50">
                          <TableCell className="font-medium">Treasury</TableCell>
                          <TableCell>Accumulates revenue to fund platform growth and economic sustainability.</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Card>
                </div>
                
                <div id="section-persona" ref={sectionRefs.persona} className="scroll-mt-24 mb-16">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="m-0 p-0 border-0">What Is a Persona?</h2>
                  </div>
                  
                  <p className="mb-6">
                    In PersonaAI, a "persona" is a structured behavioral model—built with over 151 traits covering demographics, personality, cognition, emotional triggers, and bias profiles.
                  </p>
                  <p className="mb-6">Each persona includes:</p>
                  <ul className="mb-6">
                    <li>A demographic and psychological profile</li>
                    <li>Contradictions and emergent behavior</li>
                    <li>Decision-making tendencies based on validated models</li>
                  </ul>
                  
                  <p className="italic mb-6">
                    These personas are not avatars—they are testable, probabilistic systems designed for research and agent deployment.
                  </p>
                  
                  <h3 className="text-xl font-bold mt-12 mb-6">Persona Realism Methodology</h3>
                  <p className="mb-6">
                    Every PersonaAI model is grounded in empirical psychological frameworks, including Big Five Personality Theory, Moral Foundations Theory, and Behavioral Economics models. Our personas are structured to demonstrate contradiction, incentive sensitivity, and emergent behavior — ensuring authentic decision modeling at scale.
                  </p>
                </div>
                
                <div id="section-ownership" ref={sectionRefs.ownership} className="scroll-mt-24 mb-16">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Coins className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="m-0 p-0 border-0">ERC-6551 Persona Ownership (coming Q1 2026)</h2>
                  </div>
                  
                  <p className="mb-6">
                    PersonaAI plans to implement ERC-6551 — the Token-Bound Account (TBA) standard — to transform personas into fully ownable, tradable, and programmable digital assets.
                  </p>
                  <p className="mb-6">
                    Each ERC-6551 persona will act as a smart wallet tied directly to its NFT identity, enabling:
                  </p>
                  <ul className="mb-6">
                    <li><strong>Ownership</strong>: Personas will be able to be bought, sold, leased, and licensed like any digital asset.</li>
                    <li><strong>Composability</strong>: Personas will be able to hold data, interact with protocols, and participate in research deployments.</li>
                    <li><strong>Provable Provenance</strong>: Every persona's creation, evolution, and history will be trackable on-chain.</li>
                    <li><strong>Agent Economy Integration</strong>: ERC-6551 personas will be able to function independently within the broader Virtuals Protocol agent commerce ecosystem for a broad range of use cases.</li>
                  </ul>
                  <p className="mb-6">
                    PersonaAI will ensure every minted persona is an active, evolving economic participant.
                  </p>
                  
                  <h3 className="text-xl font-bold mt-12 mb-6">Virtuals Protocol Integration</h3>
                  <p className="mb-6">
                    PersonaAI is fully integrated with the Virtuals Agent Commerce Protocol (ACP), allowing agents and users to run qualitative studies directly through ACP. This connection enables on-demand insight generation, research automation, and seamless deployment of PersonaAI's full persona engine inside the Virtuals ecosystem. ERC-6551 support will extend this interoperability even further once launched.
                  </p>
                </div>
                
                <div id="section-tokenomics" ref={sectionRefs.tokenomics} className="scroll-mt-24 mb-16">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Coins className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="m-0 p-0 border-0">$PRSNA Tokenomics</h2>
                  </div>
                  
                  <Card className="overflow-hidden bg-gray-800/50 border-gray-700/50 mb-8">
                    <Table>
                      <TableBody>
                        <TableRow className="border-gray-700/50">
                          <TableCell className="font-medium">Token Symbol</TableCell>
                          <TableCell>$PRSNA</TableCell>
                        </TableRow>
                        <TableRow className="border-gray-700/50">
                          <TableCell className="font-medium">Primary Utility</TableCell>
                          <TableCell>Minting ERC-6551 personas, marketplace transactions, research pool access, platform discounts.</TableCell>
                        </TableRow>
                        <TableRow className="border-gray-700/50">
                          <TableCell className="font-medium">Mint Fee</TableCell>
                          <TableCell>Small fee paid in $PRSNA to mint a persona to the blockchain.</TableCell>
                        </TableRow>
                        <TableRow className="border-gray-700/50">
                          <TableCell className="font-medium">Buybacks</TableCell>
                          <TableCell>20 percent of ACP revenue will be applied to purchasing $PRSNA token for the treasury.</TableCell>
                        </TableRow>
                        <TableRow className="border-gray-700/50">
                          <TableCell className="font-medium">Revenue Streams</TableCell>
                          <TableCell>Minting fees, marketplace fees, leasing commissions, research pool usage fees.</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Card>
                </div>
                
                
                <div id="section-roadmap" ref={sectionRefs.roadmap} className="scroll-mt-24 mb-16">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="m-0 p-0 border-0">Future Roadmap</h2>
                  </div>
                  
                  <Card className="overflow-hidden bg-gray-800/50 border-gray-700/50 mb-8">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-white font-semibold">Phase</TableHead>
                          <TableHead className="text-white font-semibold">Initiative</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="border-gray-700/50">
                          <TableCell className="font-medium">Complete during 2025</TableCell>
                          <TableCell>
                            <ul className="list-disc list-inside m-0 p-0">
                              <li>PersonaAI app with over 2500 AI personas</li>
                              <li>Insights Engine for automated research studies</li>
                              <li>Virtuals ACP integration</li>
                            </ul>
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-gray-700/50">
                          <TableCell className="font-medium">Phase 1</TableCell>
                          <TableCell>ERC-6551 minting (Q1 2026)</TableCell>
                        </TableRow>
                        <TableRow className="border-gray-700/50">
                          <TableCell className="font-medium">Phase 2</TableCell>
                          <TableCell>ERC-6551 Persona Marketplace (Q2 2026)</TableCell>
                        </TableRow>
                        <TableRow className="border-gray-700/50">
                          <TableCell className="font-medium">Phase 3</TableCell>
                          <TableCell>Expand persona fleet leasing, dynamic research pooling, and partner project integrations. (Q3 2026)</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Card>
                </div>
                
                <div id="section-conclusion" ref={sectionRefs.conclusion} className="scroll-mt-24 mb-20">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Rocket className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="m-0 p-0 border-0">Conclusion</h2>
                  </div>
                  
                  <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 mb-8">
                    <ul className="mb-0">
                      <li className="mb-2">PersonaAI is building the foundation for a real research economy powered by intelligent, behaviorally rich agents.</li>
                      <li className="mb-2">$PRSNA is the fuel for an evolving system of ownership, insight, and opportunity.</li>
                      <li>With careful economic design prioritizing sustainability, participation, and tokenholder alignment, PersonaAI positions itself at the forefront of the agent commerce revolution.</li>
                    </ul>
                  </div>
                  
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
            </div>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
};

export default WhitePaper;
