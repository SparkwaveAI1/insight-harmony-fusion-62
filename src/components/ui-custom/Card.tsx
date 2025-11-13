
import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  glass?: boolean;
  children: React.ReactNode;
}

const Card = ({ className, glass = false, children }: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 sm:p-6 shadow-sm transition-all w-full max-w-full",
        glass && "glass-card border-0",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
