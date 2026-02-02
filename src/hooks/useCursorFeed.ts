import { useCallback, useRef, useState } from "react";

type FetchPage<T> = (cursor?: string) => Promise<{ data: T[]; next_cursor: string | null }>;

export function useCursorFeed<T>(fetchPage: FetchPage<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const inflight = useRef(false);
  
  // Use a ref to always have access to the latest fetchPage
  // This fixes the stale closure issue when search query changes
  const fetchPageRef = useRef(fetchPage);
  fetchPageRef.current = fetchPage;

  const loadMore = useCallback(async (resetting = false) => {
    if (inflight.current || (!hasMore && !resetting)) return;
    inflight.current = true;
    try {
      // Use ref to always get the latest fetchPage function
      const res = await fetchPageRef.current(resetting ? undefined : cursor || undefined);
      setItems(prev => (resetting ? res.data : [...prev, ...res.data]));
      setCursor(res.next_cursor);
      setHasMore(Boolean(res.next_cursor));
    } finally {
      inflight.current = false;
    }
  }, [cursor, hasMore]);

  const reset = useCallback(async () => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
    // loadMore(true) will use the ref, so it gets the latest fetchPage
    inflight.current = false; // Reset inflight in case previous request was pending
    await loadMore(true);
  }, [loadMore]);

  return { items, hasMore, loadMore, reset, setItems };
}