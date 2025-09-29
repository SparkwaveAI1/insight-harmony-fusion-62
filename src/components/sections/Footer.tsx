
import Reveal from "../ui-custom/Reveal";
import { Twitter, Linkedin, MessageCircle } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="about" className="bg-secondary/50 py-12 md:py-16">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col items-center">
          <Reveal className="max-w-xl mx-auto text-center">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-white shadow-sm overflow-hidden mb-3 h-10 w-10 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/928af4dd-ec22-412b-98e0-57d4f08eb4b2.png" 
                  alt="PersonaAI Logo" 
                  className="h-10 w-10 object-contain"
                />
              </div>
              <a href="#" className="inline-block text-xl font-medium mb-4">
                Persona<span className="text-primary">AI</span>
              </a>
              <p className="text-muted-foreground mb-6">
                Transforming qualitative data into strategic insights through elegant design and powerful analysis.
              </p>
              <div className="flex justify-center space-x-6 mb-8">
                <a 
                  href="https://x.com/PersonaAI_agent" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">Twitter/X</span>
                  <Twitter className="h-6 w-6" />
                </a>
                <a 
                  href="https://www.linkedin.com/in/scott-johnson-1b76535/" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">LinkedIn</span>
                  <Linkedin className="h-6 w-6" />
                </a>
                <a 
                  href="https://t.me/personaAIportal" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">Telegram</span>
                  <MessageCircle className="h-6 w-6" />
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="border-t w-full mt-6 pt-6 flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-muted-foreground order-2 md:order-1">
                © {currentYear} PersonaAI. All rights reserved.
              </p>
              <div className="flex items-center gap-6 mb-4 md:mb-0 order-1 md:order-2">
                <a href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </a>
                <p className="text-sm text-muted-foreground">
                  Crafted with precision. Designed for insight.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
