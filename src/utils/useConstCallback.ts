import { useEffect, useRef } from "react";

export default function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
): T {
  const callbackRef = useRef<T>(callback);
  useEffect(() => {
    callbackRef.current = callback;
  });

  const wrapperRef = useRef<T | null>(null);
  if (!wrapperRef.current) {
    wrapperRef.current = ((...args: any[]) => {
      return callbackRef.current(...args);
    }) as unknown as T;
  }

  return wrapperRef.current;
}
