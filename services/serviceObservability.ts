export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  nextOffset: number | null;
}

export const buildPaginationMeta = (
  totalCount: number,
  limit: number,
  offset: number
): PaginationMeta => {
  const normalizedTotal = Math.max(totalCount || 0, 0);
  const normalizedLimit = Math.max(limit || 1, 1);
  const normalizedOffset = Math.max(offset || 0, 0);
  const hasMore = normalizedOffset + normalizedLimit < normalizedTotal;

  return {
    total: normalizedTotal,
    limit: normalizedLimit,
    offset: normalizedOffset,
    hasMore,
    nextOffset: hasMore ? normalizedOffset + normalizedLimit : null,
  };
};

export const logServiceTiming = (
  operation: string,
  startAtMs: number,
  context?: Record<string, unknown>
) => {
  const durationMs = Date.now() - startAtMs;

  if (durationMs >= 400) {
    console.warn(`[service-timing] ${operation}`, {
      durationMs,
      ...(context || {}),
    });
  }

  return durationMs;
};
