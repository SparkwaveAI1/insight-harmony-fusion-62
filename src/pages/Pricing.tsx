
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

const PLANS: Record<string, PlanType> = {
  starter: {
    name: "Starter",
    description: "Perfect for individuals and small teams getting started with AI research.",
    features: [
      "5 AI focus groups per month",
      "1 custom AI persona",
      "Basic analytics dashboard",
      "Email support"
    ],
    priceMonthly: 29,
    priceYearly: 290,
    priceIdMonthly: "price_starter_monthly",
    priceIdYearly: "price_starter_yearly",
  },
  pro: {
    name: "Professional",
    description: "Ideal for growing businesses and research teams.",
    features: [
      "15 AI focus groups per month",
      "3 custom AI personas",
      "Advanced analytics dashboard",
      "Priority email support",
      "API access",
      "Custom integrations"
    ],
    priceMonthly: 79,
    priceYearly: 790,
    priceIdMonthly: "price_pro_monthly",
    priceIdYearly: "price_pro_yearly",
    popular: true,
  },
  enterprise: {
    name: "Enterprise",
    description: "Tailored solutions for large teams and organizations.",
    features: [
      "Unlimited AI focus groups",
      "Unlimited custom AI personas",
      "Enterprise analytics dashboard",
      "Dedicated account manager",
      "Custom API integration",
      "SSO and advanced security features",
      "Priority support"
    ],
    priceMonthly: null,
    priceYearly: null,
    contact: true,
  },
};

const PricingTier = ({ 
  plan,
  isYearly,
  onCheckout
}: { 
  plan: PlanType;
  isYearly: boolean;
  onCheckout: (priceId: string) => void;
}) => {
  const price = plan.contact ? "Custom" : isYearly ? plan.priceYearly : plan.priceMonthly;
  const priceId = isYearly ? plan.priceIdYearly : plan.priceIdMonthly;
  const savings = plan.priceMonthly && plan.priceYearly ? 
    Math.round(((plan.priceMonthly * 12 - plan.priceYearly) / (plan.priceMonthly * 12)) * 100) : 0;

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
            <span className="text-muted-foreground">/{isYearly ? 'year' : 'month'}</span>
          </div>
        )}
        {isYearly && savings > 0 && (
          <div className="text-sm text-green-600 font-medium">
            Save {savings}% annually
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
          onClick={() => priceId && onCheckout(priceId)}
          disabled={!priceId}
        >
          Get Started
          <Zap className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      )}
    </Card>
  );
};

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  const handleCheckout = async (priceId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('billing-checkout-subscription', {
        body: { priceId }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
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
              
              <Reveal delay={100} animation="blur-in">
                <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl font-plasmik text-balance">
                  Choose the Plan That Works for You
                </h1>
              </Reveal>
              
              <Reveal delay={200}>
                <p className="mb-10 text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
                  From individual researchers to enterprise teams, we have flexible pricing options to scale with your needs.
                </p>
              </Reveal>

              {/* Billing Toggle */}
              <Reveal delay={300}>
                <div className="flex items-center justify-center gap-4 mb-8">
                  <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Monthly
                  </span>
                  <Switch
                    checked={isYearly}
                    onCheckedChange={setIsYearly}
                    className="data-[state=checked]:bg-primary"
                  />
                  <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Yearly
                  </span>
                  {isYearly && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Save up to 20%
                    </span>
                  )}
                </div>
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
                  plan={PLANS.starter}
                  isYearly={isYearly}
                  onCheckout={handleCheckout}
                />
              </Reveal>
              
              <Reveal delay={200}>
                <PricingTier
                  plan={PLANS.pro}
                  isYearly={isYearly}
                  onCheckout={handleCheckout}
                />
              </Reveal>
              
              <Reveal delay={400}>
                <PricingTier
                  plan={PLANS.enterprise}
                  isYearly={isYearly}
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
                    <h3 className="text-xl font-bold mb-2">Can I upgrade or downgrade my plan?</h3>
                    <p className="text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
                  </div>
                </Reveal>
                
                <Reveal delay={100}>
                  <div className="p-6 bg-background rounded-lg shadow-sm">
                    <h3 className="text-xl font-bold mb-2">Do you offer a free trial?</h3>
                    <p className="text-muted-foreground">We offer a 14-day free trial on all our plans. No credit card required to start your trial.</p>
                  </div>
                </Reveal>
                
                <Reveal delay={200}>
                  <div className="p-6 bg-background rounded-lg shadow-sm">
                    <h3 className="text-xl font-bold mb-2">What payment methods do you accept?</h3>
                    <p className="text-muted-foreground">We accept all major credit cards, PayPal, and for Enterprise customers, we also offer invoicing.</p>
                  </div>
                </Reveal>
                
                <Reveal delay={300}>
                  <div className="p-6 bg-background rounded-lg shadow-sm">
                    <h3 className="text-xl font-bold mb-2">What kind of support is included?</h3>
                    <p className="text-muted-foreground">Basic plans include email support with a 48-hour response time. Professional plans include priority email support with a 24-hour response time. Enterprise plans include dedicated account management and phone support.</p>
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
