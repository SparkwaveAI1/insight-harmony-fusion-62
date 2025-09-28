import React from 'react';
import { Coins } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCreditBalance } from '@/hooks/useCreditBalance';

interface CreditBalanceProps {
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  showIcon?: boolean;
}

export function CreditBalance({ variant = 'outline', size = 'default', showIcon = true }: CreditBalanceProps) {
  const { balance, isLoading } = useCreditBalance();

  if (isLoading) {
    return (
      <Badge variant={variant} className="animate-pulse">
        {showIcon && <Coins className="w-3 h-3 mr-1" />}
        Loading...
      </Badge>
    );
  }

  if (balance === null) {
    return (
      <Badge variant="destructive">
        {showIcon && <Coins className="w-3 h-3 mr-1" />}
        Error
      </Badge>
    );
  }

  const isLowCredits = balance < 5;

  return (
    <Badge 
      variant={isLowCredits ? 'destructive' : variant}
      className={size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : ''}
    >
      {showIcon && <Coins className="w-3 h-3 mr-1" />}
      Credits: {balance}
    </Badge>
  );
}