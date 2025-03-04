
import { ArrowRight, Rocket, Globe, TrendingUp, Link as LinkIcon } from "lucide-react";
import Header from "@/components/layout/Header";
import Section from "@/components/ui-custom/Section";
import Button from "@/components/ui-custom/Button";
import Reveal from "@/components/ui-custom/Reveal";
import Card from "@/components/ui-custom/Card";
import Footer from "@/components/sections/Footer";

const PRSNAEcosystem = () => {
  const sections = [
    {
      id: "tokenomics",
      title: "Tokenomics & Utility",
      description: "$PRSNA's role in funding AI research and data intelligence. How businesses and researchers use $PRSNA for access to insights.",
      icon: <TrendingUp className="h-6 w-6 text-primary" />,
    },
    {
      id: "staking",
      title: "Staking & Rewards",
      description: "Earn rewards by staking $PRSNA and supporting the ecosystem. Access exclusive AI research and governance participation.",
      icon: <Rocket className="h-6 w-6 text-primary" />,
    },
    {
      id: "intelligence",
      title: "Web3 Intelligence Tools",
      description: "AI-powered market sentiment tracking across DAOs, DeFi, and NFT projects. Community insights for crypto founders, investors, and builders.",
      icon: <Globe className="h-6 w-6 text-primary" />,
    },
    {
      id: "governance",
      title: "Governance & Future Features",
      description: "$PRSNA holders can vote on research priorities and ecosystem developments. Upcoming Web3-native features and integrations.",
      icon: <LinkIcon className="h-6 w-6 text-primary" />,
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <Section className="bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <Reveal>
                <div className="inline-flex items-center justify-center bg-primary/10 px-4 py-2 rounded-full mb-6">
                  <Rocket className="h-5 w-5 text-primary mr-2" />
                  <span className="text-sm font-medium text-primary">$PRSNA Web3</span>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 font-plasmik">
                  PersonaAI Web3: Staking, Research, and the $PRSNA Token.
                </h1>
              </Reveal>
              
              <Reveal delay={200}>
                <p className="text-muted-foreground text-pretty mb-10 max-w-2xl mx-auto">
                  The $PRSNA token powers AI-driven market research and qualitative intelligence. 
                  Participate in staking, explore tokenomics, and access Web3-powered insights.
                </p>
              </Reveal>
              
              <Reveal delay={300}>
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="group"
                >
                  Stake $PRSNA
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Reveal>
            </div>
          </div>
        </Section>

        {/* Key Sections */}
        <Section>
          <div className="container px-4 mx-auto">
            <div className="max-w-5xl mx-auto">
              <Reveal>
                <h2 className="text-3xl font-bold mb-10 text-center">
                  The $PRSNA Token Ecosystem
                </h2>
              </Reveal>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {sections.map((section, index) => (
                  <Reveal key={section.id} delay={100 * index}>
                    <Card className="h-full">
                      <div className="flex items-start mb-4">
                        <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 mr-4">
                          {section.icon}
                        </div>
                        <h3 className="text-xl font-bold">{section.title}</h3>
                      </div>
                      <p className="text-muted-foreground mb-6">{section.description}</p>
                      <a href={`#${section.id}-details`} className="inline-flex items-center text-primary font-medium">
                        Learn more
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Card>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Section>
        
        {/* Staking Dashboard Preview */}
        <Section className="bg-primary/5">
          <div className="container px-4 mx-auto">
            <div className="max-w-5xl mx-auto text-center">
              <Reveal>
                <h2 className="text-3xl font-bold mb-6">
                  Stake $PRSNA to Earn Rewards
                </h2>
              </Reveal>
              
              <Reveal delay={100}>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
                  Stake your $PRSNA tokens to earn rewards, access exclusive research insights, 
                  and participate in governance. The longer you stake, the greater your rewards.
                </p>
              </Reveal>
              
              <Reveal delay={200}>
                <div className="bg-white rounded-xl shadow-lg border border-primary/10 p-8 mb-8">
                  <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">Staking Dashboard Preview</p>
                  </div>
                </div>
              </Reveal>
              
              <Reveal delay={300}>
                <Button variant="primary" size="lg" className="group">
                  Connect Wallet
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

export default PRSNAEcosystem;
