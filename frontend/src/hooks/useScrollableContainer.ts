import { useRef } from 'react';

/**
 * Hook to provide a ref for scrollable containers.
 * Previously handled manual scrolling, but now relies on native scrolling
 * and CSS overscroll-behavior: contain for better performance and compatibility.
 */
export function useScrollableContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  return containerRef;
}
