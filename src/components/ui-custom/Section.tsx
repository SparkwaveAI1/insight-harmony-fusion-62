
import { cn } from "@/lib/utils";

interface SectionProps {
  className?: string;
  id?: string;
  children: React.ReactNode;
  highlight?: boolean;
}

const Section = ({ className, id, children, highlight = false }: SectionProps) => {
  return (
    <section
      id={id}
      className={cn(
        "w-full py-16 md:py-24",
        highlight && "relative before:absolute before:inset-0 before:bg-primary/5 before:skew-y-3 before:-z-10",
        className
      )}
    >
      {children}
    </section>
  );
};

export default Section;
