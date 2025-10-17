import { useCallback, useRef } from 'react';

interface UseInfiniteScrollProps {
  loadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  isLoadingMore: boolean;
}

interface UseInfiniteScrollReturn {
  lastElementRef: (node: HTMLDivElement | null) => void;
}

export function useInfiniteScroll({
  loadMore,
  hasMore,
  loading,
  isLoadingMore,
}: UseInfiniteScrollProps): UseInfiniteScrollReturn {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || isLoadingMore) return;

      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(entries => {
        const isIntersecting = entries[0].isIntersecting;

        if (isIntersecting && hasMore) {
          loadMore();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, isLoadingMore, hasMore, loadMore],
  );

  return {
    lastElementRef,
  };
}
