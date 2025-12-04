import { Link } from "react-router-dom";
import Reveal from "@/components/ui-custom/Reveal";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

const HeroSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Particle system
    const particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.02, // Nearly imperceptible speed
        vy: (Math.random() - 0.5) * 0.02,
        size: Math.random() * 1.5 + 0.5,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(100, 150, 255, 0.15)"; // Very faint blue
        ctx.fill();
      });

      // Draw faint connecting lines
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(100, 150, 255, ${0.03 * (1 - dist / 120)})`; // Very subtle
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  return (
    <div className="container px-4 mx-auto relative">
      {/* Subtle particle background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.6 }}
      />

      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16 relative z-10">
        <Reveal>
          <div className="inline-flex items-center justify-center bg-secondary/20 px-4 py-2 rounded-full mb-6">
            Web3 Intelligence
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-plasmik">
            Building the Future of On-Chain Behavioral Intelligence
          </h1>
        </Reveal>
        
        <Reveal delay={200}>
          <p className="text-muted-foreground text-pretty mb-6">
            PersonaAI is live inside the Virtuals Agent Commerce Protocol (ACP) on Base blockchain, providing on-demand qualitative insights from thousands of AI personas. $PRSNA fuels realistic human simulations and is set to become a fundamental component of Web3 research.
          </p>
        </Reveal>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.5s", animationFillMode: "both" }}>
          <a href="https://app.virtuals.io/acp" target="_blank" rel="noopener noreferrer">
            <Button 
              variant="default" 
              size="lg" 
              className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              Virtuals Butler
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </a>
          <Link to="/dashboard">
            <Button 
              variant="default" 
              size="lg" 
              className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              Go To App
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
