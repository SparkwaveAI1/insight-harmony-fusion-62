import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { checkUserCredits } from '@/utils/creditCheck';

export function useCreditBalance() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshBalance = async () => {
    if (!user) {
      setBalance(null);
      setIsLoading(false);
      return;
    }

    try {
      const { currentBalance } = await checkUserCredits(user.id, 0);
      setBalance(currentBalance);
    } catch (error) {
      console.error('Error fetching credit balance:', error);
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshBalance();
  }, [user]);

  return {
    balance,
    isLoading,
    refreshBalance
  };
}