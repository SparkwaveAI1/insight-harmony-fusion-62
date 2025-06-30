
import React from "react";
import { Link, LinkProps } from "react-router-dom";
import { cn } from "@/lib/utils";

// Define props for different component types
interface BaseButtonProps {
  variant?: "default" | "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "sm" | "default" | "lg" | "icon";
  className?: string;
  isLoading?: boolean;
}

// For normal button
interface ButtonAsButtonProps extends BaseButtonProps {
  as?: "button" | undefined;
  to?: never;
  href?: never;
  children: React.ReactNode;
}

// For Link component
interface ButtonAsLinkProps extends BaseButtonProps {
  as: typeof Link;
  to: string;
  href?: never;
  children: React.ReactNode;
}

// For anchor element
interface ButtonAsAnchorProps extends BaseButtonProps {
  as: "a";
  href: string;
  to?: never;
  children: React.ReactNode;
}

// Union type for all possible button props
type ButtonProps = ButtonAsButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement> | 
                  ButtonAsLinkProps & Omit<LinkProps, 'className' | 'to'> | 
                  ButtonAsAnchorProps & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'href'>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", children, as, to, href, isLoading, ...props }, ref) => {
    const styles = cn(
      "relative inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
      // Variants
      variant === "default" && "bg-primary text-white shadow hover:bg-primary/90 active:bg-primary/80",
      variant === "primary" && "bg-primary text-white shadow hover:bg-primary/90 active:bg-primary/80",
      variant === "secondary" && "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/90",
      variant === "outline" && "border border-input bg-transparent shadow-sm hover:bg-accent/10 hover:text-accent-foreground active:bg-accent/20",
      variant === "ghost" && "hover:bg-muted hover:text-muted-foreground active:bg-muted/80",
      variant === "link" && "text-primary underline-offset-4 hover:underline",
      // Sizes
      size === "default" && "h-9 px-5 py-2 text-sm",
      size === "sm" && "h-8 rounded-md px-3 text-xs",
      size === "lg" && "h-10 rounded-md px-8 text-base",
      size === "icon" && "h-9 w-9",
      className
    );
    
    // Loading spinner component
    const LoadingSpinner = () => (
      <svg
        className="animate-spin h-4 w-4 mr-2"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    );
    
    // Render as Link component
    if (as === Link && to) {
      return (
        <Link 
          to={to} 
          className={styles}
          {...props as Omit<LinkProps, 'className' | 'to'>}
        >
          {isLoading && <LoadingSpinner />}
          {children}
        </Link>
      );
    }

    // Render as anchor element
    if (as === "a" && href) {
      return (
        <a 
          href={href} 
          className={styles}
          {...props as React.AnchorHTMLAttributes<HTMLAnchorElement>}
        >
          {isLoading && <LoadingSpinner />}
          {children}
        </a>
      );
    }
    
    // Default button rendering
    return (
      <button
        className={styles}
        ref={ref}
        disabled={isLoading || (props as React.ButtonHTMLAttributes<HTMLButtonElement>).disabled}
        {...props as React.ButtonHTMLAttributes<HTMLButtonElement>}
      >
        {isLoading && <LoadingSpinner />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
