
import Header from "@/components/layout/Header";
import Section from "@/components/ui-custom/Section";
import Reveal from "@/components/ui-custom/Reveal";
import Footer from "@/components/sections/Footer";
import Button from "@/components/ui-custom/Button";
import { Check, ArrowRight, Zap, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "@/components/ui-custom/Card";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type PlanType = {
  name: string;
  description: string;
  features: string[];
  priceMonthly: number | null;
  priceYearly: number | null;
  priceIdMonthly?: string;
  priceIdYearly?: string;
  popular?: boolean;
  contact?: boolean;
};

const CREDIT_PACKS: Record<string, PlanType> = {
  small: {
    name: "Starter Pack",
    description: "Perfect for trying out PersonaAI with your first research projects.",
    features: [
      "100 credits included",
      "Create 5-10 AI personas",
      "Run 10-20 research simulations",
      "Basic analytics dashboard",
      "Email support"
    ],
    priceMonthly: 10,
    priceYearly: null,
    priceIdMonthly: "CREDITS_100",
  },
  medium: {
    name: "Professional Pack",
    description: "Ideal for regular researchers and growing teams.",
    features: [
      "500 credits included",
      "Create 25-50 AI personas",
      "Run 50-100 research simulations", 
      "Advanced analytics dashboard",
      "Priority email support",
      "Export research data"
    ],
    priceMonthly: 45,
    priceYearly: null,
    priceIdMonthly: "CREDITS_500",
    popular: true,
  },
  large: {
    name: "Enterprise Pack",
    description: "For teams and organizations running extensive research.",
    features: [
      "1000 credits included",
      "Create 50-100 AI personas",
      "Run 100-200 research simulations",
      "Enterprise analytics dashboard",
      "Priority support",
      "Custom integrations",
      "Team collaboration tools"
    ],
    priceMonthly: 80,
    priceYearly: null,
    priceIdMonthly: "CREDITS_1000",
  },
};

const PricingTier = ({ 
  plan,
  onCheckout
}: { 
  plan: PlanType;
  onCheckout: (packType: string) => void;
}) => {
  const price = plan.contact ? "Custom" : plan.priceMonthly;
  const packType = plan.priceIdMonthly;

  return (
    <Card className={`p-8 flex flex-col h-full relative ${plan.popular ? 'border-primary border-2' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-full flex items-center gap-1">
            <Star className="h-4 w-4" />
            Most Popular
          </div>
        </div>
      )}
      
      <h3 className="text-2xl font-bold mb-2 font-plasmik">{plan.name}</h3>
      
      <div className="mb-4">
        {plan.contact ? (
          <span className="text-3xl font-bold">Custom</span>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">${price}</span>
            <span className="text-muted-foreground">one-time</span>
          </div>
        )}
      </div>
      
      <p className="text-muted-foreground mb-6">{plan.description}</p>
      
      <div className="space-y-3 mb-8 flex-grow">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-2">
            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </div>
      
      {plan.contact ? (
        <Link to="/contact">
          <Button className="w-full group" variant="outline">
            Contact Sales
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      ) : (
        <Button 
          className="w-full group" 
          variant={plan.popular ? "primary" : "outline"}
          onClick={() => packType && onCheckout(packType)}
          disabled={!packType}
        >
          Buy Credits
          <Zap className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      )}
    </Card>
  );
};

const Pricing = () => {

  const handleCheckout = async (packType: string) => {
    try {
      console.log('Starting checkout for pack type:', packType);
      
      const { data, error } = await supabase.functions.invoke('billing-checkout-credit-pack', {
        body: { 
          userId: (await supabase.auth.getUser()).data.user?.id,
          packType 
        }
      });

      console.log('Checkout response:', { data, error });

      if (error) throw error;

      if (data?.url) {
        console.log('Redirecting to Stripe:', data.url);
        // Use window.open to avoid potential blocking
        const stripeWindow = window.open(data.url, '_blank');
        if (!stripeWindow) {
          // Fallback if popup blocked
          window.location.href = data.url;
        }
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-accent/30 via-background to-background -z-10" />
          
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <Reveal>
                <p className="inline-block mb-4 px-3 py-1 text-xs font-medium tracking-wider text-primary uppercase bg-primary/10 rounded-full">
                  Pricing
                </p>
              </Reveal>
              
              <Reveal>
                <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl font-plasmik text-balance">
                  Credit Packs for PersonaAI
                </h1>
              </Reveal>
              
              <Reveal delay={200}>
                <p className="mb-10 text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
                  Purchase credits to power your AI persona creation and research simulations. Credits never expire and can be used for any PersonaAI features.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Pricing Tiers */}
        <Section>
          <div className="container px-4 mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <Reveal>
                <PricingTier
                  plan={CREDIT_PACKS.small}
                  onCheckout={handleCheckout}
                />
              </Reveal>
              
              <Reveal delay={200}>
                <PricingTier
                  plan={CREDIT_PACKS.medium}
                  onCheckout={handleCheckout}
                />
              </Reveal>
              
              <Reveal delay={400}>
                <PricingTier
                  plan={CREDIT_PACKS.large}
                  onCheckout={handleCheckout}
                />
              </Reveal>
            </div>
          </div>
        </Section>
        
        {/* FAQ Section */}
        <Section className="bg-muted/30">
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto">
              <Reveal>
                <h2 className="text-3xl font-bold mb-10 text-center font-plasmik">
                  Frequently Asked Questions
                </h2>
              </Reveal>
              
              <div className="space-y-6">
                <Reveal>
                  <div className="p-6 bg-background rounded-lg shadow-sm">
                    <h3 className="text-xl font-bold mb-2">How do credits work?</h3>
                    <p className="text-muted-foreground">Credits are used to power AI processing for persona creation and research simulations. Each feature has a clear credit cost, and credits never expire.</p>
                  </div>
                </Reveal>
                
                <Reveal delay={100}>
                  <div className="p-6 bg-background rounded-lg shadow-sm">
                    <h3 className="text-xl font-bold mb-2">Can I buy more credits later?</h3>
                    <p className="text-muted-foreground">Yes! You can purchase additional credit packs at any time. Your credits are cumulative and never expire.</p>
                  </div>
                </Reveal>
                
                <Reveal delay={200}>
                  <div className="p-6 bg-background rounded-lg shadow-sm">
                    <h3 className="text-xl font-bold mb-2">What payment methods do you accept?</h3>
                    <p className="text-muted-foreground">We accept all major credit cards through Stripe's secure payment processing.</p>
                  </div>
                </Reveal>
                
                <Reveal delay={300}>
                  <div className="p-6 bg-background rounded-lg shadow-sm">
                    <h3 className="text-xl font-bold mb-2">What kind of support is included?</h3>
                    <p className="text-muted-foreground">All credit packs include email support. Larger packs include priority support with faster response times.</p>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
