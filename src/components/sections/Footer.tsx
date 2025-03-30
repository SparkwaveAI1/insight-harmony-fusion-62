
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
              <img 
                src="/lovable-uploads/aec5484d-4b9b-4169-a74e-c3ceaf1a1d54.png" 
                alt="PersonaAI Logo" 
                className="h-10 w-10 object-contain mb-3"
              />
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
              <p className="text-sm text-muted-foreground mb-4 md:mb-0 order-1 md:order-2">
                Crafted with precision. Designed for insight.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
