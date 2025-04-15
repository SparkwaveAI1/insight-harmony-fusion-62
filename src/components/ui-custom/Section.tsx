
import { cn } from "@/lib/utils";

interface SectionProps {
  className?: string;
  id?: string;
  children: React.ReactNode;
  highlight?: boolean;
  reducedPadding?: boolean;
  pattern?: 'dots' | 'grid' | 'none';
}

const Section = ({ 
  className, 
  id, 
  children, 
  highlight = false,
  reducedPadding = false,
  pattern = 'none'
}: SectionProps) => {
  return (
    <section
      id={id}
      className={cn(
        reducedPadding ? "w-full py-8 md:py-12" : "w-full py-16 md:py-24",
        "relative",
        // Softer gradient that fades to white more quickly
        "bg-gradient-to-b from-accent/20 via-background to-background",
        // Subtle divider between sections
        "border-b border-primary/5",
        // Background patterns
        pattern === 'dots' && "before:absolute before:inset-0 before:bg-[radial-gradient(circle,_theme(colors.primary/2)_1px,_transparent_1px)] before:bg-[size:24px_24px] before:opacity-30 before:-z-10",
        pattern === 'grid' && "before:absolute before:inset-0 before:bg-[linear-gradient(theme(colors.primary/5)_1px,_transparent_1px),_linear-gradient(90deg,_theme(colors.primary/5)_1px,_transparent_1px)] before:bg-[size:32px_32px] before:opacity-30 before:-z-10",
        highlight && "relative before:absolute before:inset-0 before:bg-primary/5 before:skew-y-3 before:-z-10",
        className
      )}
    >
      {children}
    </section>
  );
};

export default Section;
