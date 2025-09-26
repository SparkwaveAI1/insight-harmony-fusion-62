export type Cursor = { ts: string; id: string };

export function parseCursor(cursor?: string | null): Cursor | null {
  if (!cursor) return null;
  const [ts, id] = cursor.split("|");
  if (!ts || !id) return null;
  return { ts, id };
}

/**
 * Apply a stable (created_at DESC, id DESC) cursor.
 * Example: applyCursor(q, { cursor, createdCol: 'created_at', idCol: 'transaction_id' })
 */
export function applyCursor<T extends { or: (disj: string) => any }>(
  query: T,
  {
    cursor,
    createdCol = "created_at",
    idCol,
  }: { cursor: Cursor | null; createdCol?: string; idCol: string }
) {
  if (!cursor) return query;
  const { ts, id } = cursor;

  // Equivalent to: (created_at < ts) OR (created_at = ts AND id < cursorId)
  const disj =
    `${createdCol}.lt.${ts},and(${createdCol}.eq.${ts},${idCol}.lt.${id})`;
  return query.or(disj);
}