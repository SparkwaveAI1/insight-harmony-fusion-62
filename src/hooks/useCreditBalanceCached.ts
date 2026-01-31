/**
 * Cached Credit Balance Hook
 * 
 * Uses React Query for caching credit balance with 1 minute cache.
 * Replaces manual refresh logic with automatic background updates.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { checkUserCredits } from '@/utils/creditCheck';
import { queryKeys, CACHE_TIMES, STALE_TIMES, invalidateCreditsQuery } from '@/lib/queryClient';

interface CreditBalanceResult {
  balance: number | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refreshBalance: () => void;
}

/**
 * Fetch credit balance for a user
 */
async function fetchCreditBalance(userId: string): Promise<number> {
  const { currentBalance } = await checkUserCredits(userId, 0);
  return currentBalance;
}

/**
 * Hook to get user's credit balance with caching
 * 
 * Cache behavior:
 * - Data cached for 1 minute
 * - Stale after 30 seconds (will refetch in background)
 * - Optimistic updates on credit usage
 */
export function useCreditBalanceCached(): CreditBalanceResult {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const queryKey = user?.id ? queryKeys.user.credits(user.id) : ['credits', 'anonymous'];
  
  const {
    data: balance,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey,
    queryFn: () => fetchCreditBalance(user!.id),
    enabled: !!user?.id,
    staleTime: STALE_TIMES.CREDITS,
    gcTime: CACHE_TIMES.CREDITS,
    // Keep previous data while refetching
    placeholderData: (previousData) => previousData,
  });

  const refreshBalance = () => {
    if (user?.id) {
      invalidateCreditsQuery(queryClient, user.id);
    }
  };

  return {
    balance: balance ?? null,
    isLoading,
    isError,
    error: error as Error | null,
    refreshBalance,
  };
}

/**
 * Hook to optimistically update credit balance
 * Returns a function to deduct credits optimistically
 */
export function useOptimisticCreditUpdate() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  /**
   * Optimistically deduct credits and invalidate cache
   */
  const deductCredits = (amount: number) => {
    if (!user?.id) return;
    
    const queryKey = queryKeys.user.credits(user.id);
    
    // Optimistically update the cache
    queryClient.setQueryData<number>(queryKey, (old) => {
      if (old === undefined) return old;
      return Math.max(0, old - amount);
    });
    
    // Invalidate to refetch actual balance from server
    // This runs in background after the optimistic update
    setTimeout(() => {
      invalidateCreditsQuery(queryClient, user.id);
    }, 2000);
  };
  
  return { deductCredits };
}

// Re-export the original hook for backward compatibility
export { useCreditBalance } from './useCreditBalance';
