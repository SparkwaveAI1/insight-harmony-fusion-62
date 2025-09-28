import React from 'react';
import { Coins } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCreditBalance } from '@/hooks/useCreditBalance';
import { cn } from '@/lib/utils';

interface CreditBalanceProps {
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  showIcon?: boolean;
  onDark?: boolean;
  className?: string;
}

export function CreditBalance({ variant = 'outline', size = 'default', showIcon = true, onDark = false, className }: CreditBalanceProps) {
  const { balance, isLoading } = useCreditBalance();

  if (isLoading) {
    return (
      <Badge 
        variant={variant} 
        className={cn("animate-pulse", onDark && "text-white border-white/30 bg-white/10", className)}
      >
        {showIcon && <Coins className="w-3 h-3 mr-1" />}
        Loading...
      </Badge>
    );
  }

  if (balance === null) {
    return (
      <Badge variant="destructive" className={cn(onDark && "text-white", className)}>
        {showIcon && <Coins className="w-3 h-3 mr-1" />}
        Error
      </Badge>
    );
  }

  const isLowCredits = balance < 5;

  return (
    <Badge 
      variant={isLowCredits ? 'destructive' : variant}
      className={cn(
        size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : '',
        onDark && !isLowCredits && "text-white border-white/30 bg-white/10",
        onDark && isLowCredits && "text-white",
        className
      )}
    >
      {showIcon && <Coins className="w-3 h-3 mr-1" />}
      Credits: {balance}
    </Badge>
  );
}