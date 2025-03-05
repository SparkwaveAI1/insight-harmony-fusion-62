
import { useState } from "react";
import { 
  ArrowRight, 
  Rocket, 
  Globe, 
  TrendingUp, 
  Link as LinkIcon, 
  Wallet, 
  LockIcon, 
  Bot, 
  Users, 
  ChevronRight,
  Plus,
  BarChart3,
  Lightbulb
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Section from "@/components/ui-custom/Section";
import Button from "@/components/ui-custom/Button";
import Reveal from "@/components/ui-custom/Reveal";
import Card from "@/components/ui-custom/Card";
import Footer from "@/components/sections/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PRSNAEcosystem = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stakeAmount, setStakeAmount] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{role: "user" | "assistant", content: string}[]>([
    {role: "assistant", content: "Hello! I'm your PersonaAI agent. How can I help with your research today?"}
  ]);
  
  const mockBalance = "1,245.00";
  const mockStaked = "750.00";
  const mockAPY = "12.5%";
  const mockRewards = "22.43";
  const mockStakingTier = "Silver";
  
  const connectWallet = () => {
    // In a real implementation, this would connect to a wallet provider
    setIsWalletConnected(true);
  };
  
  const disconnectWallet = () => {
    setIsWalletConnected(false);
  };
  
  const handleStakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock staking logic
    if (stakeAmount && !isNaN(Number(stakeAmount))) {
      alert(`Successfully staked ${stakeAmount} $PRSNA tokens!`);
      setStakeAmount("");
    } else {
      alert("Please enter a valid amount to stake");
    }
  };
  
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    // Add user message to chat
    const newChatHistory = [
      ...chatHistory,
      {role: "user", content: chatMessage}
    ];
    setChatHistory(newChatHistory);
    
    // Mock AI response
    setTimeout(() => {
      setChatHistory([
        ...newChatHistory,
        {role: "assistant", content: "Thank you for your message. Our AI assistant is processing your research query. In a complete implementation, I would provide you with qualitative insights based on your question."}
      ]);
    }, 1000);
    
    setChatMessage("");
  };
  
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
      icon: <LockIcon className="h-6 w-6 text-primary" />,
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
                {!isWalletConnected ? (
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="group"
                    onClick={connectWallet}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="group"
                      onClick={disconnectWallet}
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Disconnect Wallet
                    </Button>
                    <Button 
                      variant="primary" 
                      size="lg" 
                      className="group"
                      onClick={() => setActiveTab("staking")}
                    >
                      <LockIcon className="w-4 h-4 mr-2" />
                      Stake $PRSNA
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                )}
              </Reveal>
            </div>
          </div>
        </Section>

        {/* Web3 Dashboard Section */}
        <Section className="bg-white">
          <div className="container px-4 mx-auto">
            <div className="max-w-5xl mx-auto">
              {isWalletConnected ? (
                <>
                  <Reveal>
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
                      <div>
                        <h2 className="text-2xl font-bold">$PRSNA Dashboard</h2>
                        <p className="text-muted-foreground">
                          Manage your tokens and access AI research tools
                        </p>
                      </div>
                      <div className="mt-4 sm:mt-0 px-4 py-2 bg-primary/5 rounded-lg flex items-center">
                        <Wallet className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm font-medium truncate max-w-[150px]">
                          wallet...x123
                        </span>
                      </div>
                    </div>
                  </Reveal>
                  
                  <Reveal delay={100}>
                    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="mb-10">
                      <TabsList className="grid grid-cols-4 mb-8">
                        <TabsTrigger value="dashboard">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Dashboard</span>
                        </TabsTrigger>
                        <TabsTrigger value="staking">
                          <LockIcon className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Staking</span>
                        </TabsTrigger>
                        <TabsTrigger value="research">
                          <Lightbulb className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Research</span>
                        </TabsTrigger>
                        <TabsTrigger value="ai-agent">
                          <Bot className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">AI Agent</span>
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="dashboard" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <Card className="p-4">
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">$PRSNA Balance</h3>
                            <p className="text-2xl font-bold">{mockBalance}</p>
                          </Card>
                          <Card className="p-4">
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Staked $PRSNA</h3>
                            <p className="text-2xl font-bold">{mockStaked}</p>
                          </Card>
                          <Card className="p-4">
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Current APY</h3>
                            <p className="text-2xl font-bold text-primary">{mockAPY}</p>
                          </Card>
                          <Card className="p-4">
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Rewards</h3>
                            <p className="text-2xl font-bold text-primary">{mockRewards}</p>
                          </Card>
                        </div>
                        
                        <Card className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Research Access</h3>
                            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                              {mockStakingTier} Tier
                            </div>
                          </div>
                          <p className="text-muted-foreground mb-4">
                            Your current staking position grants you access to:
                          </p>
                          <ul className="space-y-2">
                            <li className="flex items-start">
                              <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                              <span>AI Focus Group participation (up to 3 per month)</span>
                            </li>
                            <li className="flex items-start">
                              <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                              <span>Unlimited access to the AI Persona Interviewer</span>
                            </li>
                            <li className="flex items-start">
                              <ChevronRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                              <span>Weekly market sentiment reports</span>
                            </li>
                          </ul>
                          <div className="mt-6">
                            <Button>
                              <Plus className="h-4 w-4 mr-2" />
                              Stake more for Gold Tier
                            </Button>
                          </div>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="staking" className="space-y-6">
                        <Card className="p-6">
                          <h3 className="text-xl font-semibold mb-4">Stake $PRSNA Tokens</h3>
                          <p className="text-muted-foreground mb-6">
                            Stake your tokens to earn rewards and gain access to advanced research features.
                            The longer you stake, the higher your rewards.
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <Card className="p-4 border-2 hover:border-primary cursor-pointer transition-all">
                              <h4 className="font-semibold mb-2">30 Days</h4>
                              <p className="text-primary text-lg font-bold mb-1">8% APY</p>
                              <p className="text-xs text-muted-foreground">Bronze Tier Access</p>
                            </Card>
                            <Card className="p-4 border-2 border-primary cursor-pointer transition-all bg-primary/5">
                              <div className="absolute -top-2 right-4 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                                Popular
                              </div>
                              <h4 className="font-semibold mb-2">90 Days</h4>
                              <p className="text-primary text-lg font-bold mb-1">12.5% APY</p>
                              <p className="text-xs text-muted-foreground">Silver Tier Access</p>
                            </Card>
                            <Card className="p-4 border-2 hover:border-primary cursor-pointer transition-all">
                              <h4 className="font-semibold mb-2">180 Days</h4>
                              <p className="text-primary text-lg font-bold mb-1">18% APY</p>
                              <p className="text-xs text-muted-foreground">Gold Tier Access</p>
                            </Card>
                          </div>
                          
                          <form onSubmit={handleStakeSubmit} className="space-y-4">
                            <div>
                              <Label htmlFor="stake-amount">Amount to Stake</Label>
                              <div className="relative mt-1">
                                <Input
                                  id="stake-amount"
                                  type="number"
                                  placeholder="0.00"
                                  value={stakeAmount}
                                  onChange={(e) => setStakeAmount(e.target.value)}
                                  className="pl-3 pr-20"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                  <span className="text-muted-foreground">$PRSNA</span>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Available: {mockBalance} $PRSNA
                              </p>
                            </div>
                            
                            <div className="flex gap-4">
                              <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setStakeAmount((parseFloat(mockBalance.replace(/,/g, '')) / 4).toString())}
                              >
                                25%
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setStakeAmount((parseFloat(mockBalance.replace(/,/g, '')) / 2).toString())}
                              >
                                50%
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setStakeAmount(mockBalance.replace(/,/g, ''))}
                              >
                                Max
                              </Button>
                            </div>
                            
                            <Button type="submit" className="w-full">
                              Stake Tokens
                            </Button>
                          </form>
                        </Card>
                        
                        <Card className="p-6">
                          <h3 className="text-xl font-semibold mb-4">Your Staking Positions</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b">
                                  <th className="py-2 text-left">Amount</th>
                                  <th className="py-2 text-left">Lock Period</th>
                                  <th className="py-2 text-left">APY</th>
                                  <th className="py-2 text-left">Rewards</th>
                                  <th className="py-2 text-left">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b">
                                  <td className="py-3">750 $PRSNA</td>
                                  <td className="py-3">90 Days</td>
                                  <td className="py-3 text-primary">12.5%</td>
                                  <td className="py-3">22.43 $PRSNA</td>
                                  <td className="py-3">
                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                      Active
                                    </span>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="research" className="space-y-6">
                        <Card className="p-6">
                          <h3 className="text-xl font-semibold mb-4">Research Tools Access</h3>
                          <p className="text-muted-foreground mb-6">
                            Access AI-powered research tools and insights with your $PRSNA tokens.
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="p-4 border hover:border-primary hover:shadow-md transition-all">
                              <div className="flex items-start mb-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                  <Bot className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-semibold">AI Persona Interviewer</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Conduct 1:1 interviews with custom AI personas
                                  </p>
                                </div>
                              </div>
                              <Link to="/persona-ai-interviewer">
                                <Button>Launch Tool</Button>
                              </Link>
                            </Card>
                            
                            <Card className="p-4 border hover:border-primary hover:shadow-md transition-all">
                              <div className="flex items-start mb-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                  <Users className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-semibold">AI Focus Groups</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Run moderated discussions with diverse AI personas
                                  </p>
                                </div>
                              </div>
                              <Link to="/ai-focus-groups">
                                <Button>Launch Tool</Button>
                              </Link>
                            </Card>
                            
                            <Card className="p-4 border hover:border-primary hover:shadow-md transition-all">
                              <div className="flex items-start mb-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                  <Globe className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-semibold">Web3 Sentiment Analysis</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Track market sentiment across DAOs and DeFi projects
                                  </p>
                                </div>
                              </div>
                              <Button variant="outline">
                                Coming Soon
                              </Button>
                            </Card>
                            
                            <Card className="p-4 border hover:border-primary hover:shadow-md transition-all">
                              <div className="flex items-start mb-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                  <TrendingUp className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-semibold">Community Insights</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Discover what crypto communities are talking about
                                  </p>
                                </div>
                              </div>
                              <Button variant="outline">
                                Stake More to Unlock
                              </Button>
                            </Card>
                          </div>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="ai-agent" className="space-y-6">
                        <Card className="p-6">
                          <h3 className="text-xl font-semibold mb-4">
                            PersonaAI Research Assistant
                          </h3>
                          <p className="text-muted-foreground mb-6">
                            Chat with our AI agent to get research insights and help with qualitative analysis.
                          </p>
                          
                          <div className="bg-muted/40 rounded-lg p-4 h-[300px] mb-4 overflow-y-auto flex flex-col space-y-3">
                            {chatHistory.map((message, index) => (
                              <div 
                                key={index} 
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                              >
                                <div 
                                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                                    message.role === "user" 
                                      ? "bg-primary text-white" 
                                      : "bg-muted"
                                  }`}
                                >
                                  {message.content}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <form onSubmit={sendMessage} className="flex gap-3">
                            <Input
                              value={chatMessage}
                              onChange={(e) => setChatMessage(e.target.value)}
                              placeholder="Ask about market research, sentiment analysis, or qualitative data..."
                              className="flex-1"
                            />
                            <Button type="submit">Send</Button>
                          </form>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </Reveal>
                </>
              ) : (
                <>
                  <Reveal>
                    <h2 className="text-3xl font-bold mb-6 text-center">
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
                </>
              )}
            </div>
          </div>
        </Section>
        
        {/* Staking Dashboard Preview (shown when wallet not connected) */}
        {!isWalletConnected && (
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
                    <img 
                      src="/lovable-uploads/723fa150-405c-4fa6-aa1f-33398c934182.png" 
                      alt="Staking Dashboard Preview" 
                      className="rounded-lg w-full h-auto max-h-[400px] object-cover object-top"
                    />
                  </div>
                </Reveal>
                
                <Reveal delay={300}>
                  <Button variant="primary" size="lg" className="group" onClick={connectWallet}>
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Reveal>
              </div>
            </div>
          </Section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PRSNAEcosystem;
