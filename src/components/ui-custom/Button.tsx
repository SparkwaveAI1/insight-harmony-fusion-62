
import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "sm" | "default" | "lg" | "icon";
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", children, ...props }, ref) => {
    return (
      <button
        className={cn(
          "relative inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          // Variants
          variant === "primary" && "bg-[#33C3F0] text-white shadow hover:bg-[#1EAEDB] active:bg-[#0FA0CE]",
          variant === "secondary" && "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/90",
          variant === "outline" && "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
          variant === "ghost" && "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
          variant === "link" && "text-[#33C3F0] underline-offset-4 hover:underline",
          // Sizes
          size === "default" && "h-9 px-5 py-2 text-sm",
          size === "sm" && "h-8 rounded-md px-3 text-xs",
          size === "lg" && "h-10 rounded-md px-8 text-base",
          size === "icon" && "h-9 w-9",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
        {variant === "primary" && (
          <span className="absolute inset-0 rounded-md bg-[#FF9933]/10 opacity-0 transition-opacity hover:opacity-100"></span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
