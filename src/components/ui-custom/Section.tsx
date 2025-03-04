
import { cn } from "@/lib/utils";

interface SectionProps {
  className?: string;
  id?: string;
  children: React.ReactNode;
}

const Section = ({ className, id, children }: SectionProps) => {
  return (
    <section
      id={id}
      className={cn(
        "w-full py-16 md:py-24",
        className
      )}
    >
      {children}
    </section>
  );
};

export default Section;
