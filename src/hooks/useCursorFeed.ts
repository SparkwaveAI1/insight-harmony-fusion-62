import { useCallback, useRef, useState } from "react";

type FetchPage<T> = (cursor?: string) => Promise<{ data: T[]; next_cursor: string | null }>;

export function useCursorFeed<T>(fetchPage: FetchPage<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const inflight = useRef(false);

  const loadMore = useCallback(async (resetting = false) => {
    if (inflight.current || (!hasMore && !resetting)) return;
    inflight.current = true;
    try {
      const res = await fetchPage(resetting ? undefined : cursor || undefined);
      setItems(prev => (resetting ? res.data : [...prev, ...res.data]));
      setCursor(res.next_cursor);
      setHasMore(Boolean(res.next_cursor));
    } finally {
      inflight.current = false;
    }
  }, [cursor, hasMore, fetchPage]);

  const reset = useCallback(async () => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
    await loadMore(true);
  }, [loadMore]);

  return { items, hasMore, loadMore, reset, setItems };
}