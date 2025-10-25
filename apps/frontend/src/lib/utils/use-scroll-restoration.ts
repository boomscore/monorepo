import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';


export function useScrollRestoration<T extends HTMLElement = HTMLDivElement>(
  storageKey: string = 'scroll-position',
) {
  const scrollElementRef = useRef<T>(null);
  const pathname = usePathname();

  const saveScrollPosition = () => {
    if (scrollElementRef.current) {
      const scrollTop = scrollElementRef.current.scrollTop;
      sessionStorage.setItem(`${storageKey}-${pathname}`, scrollTop.toString());
    }
  };

  const restoreScrollPosition = () => {
    if (scrollElementRef.current) {
      const savedPosition = sessionStorage.getItem(`${storageKey}-${pathname}`);
      if (savedPosition) {
        setTimeout(() => {
          if (scrollElementRef.current) {
            scrollElementRef.current.scrollTop = parseInt(savedPosition, 10);
          }
        }, 0);
      }
    }
  };

  useEffect(() => {
    restoreScrollPosition();

    const handleBeforeUnload = () => {
      saveScrollPosition();
    };

    const handleScroll = () => {
      clearTimeout(window.scrollSaveTimeout);
      window.scrollSaveTimeout = setTimeout(() => {
        saveScrollPosition();
      }, 100);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    if (scrollElementRef.current) {
      scrollElementRef.current.addEventListener('scroll', handleScroll);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (scrollElementRef.current) {
        scrollElementRef.current.removeEventListener('scroll', handleScroll);
      }
      clearTimeout(window.scrollSaveTimeout);
    };
  }, [pathname, storageKey]);

  useEffect(() => {
    return () => {
      saveScrollPosition();
    };
  }, []);

  return {
    scrollElementRef,
    saveScrollPosition,
    restoreScrollPosition,
  };
}

]declare global {
  interface Window {
    scrollSaveTimeout: NodeJS.Timeout;
  }
}
