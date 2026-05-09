'use client';

import { useEffect, useRef, useCallback } from 'react';

export function useSSE<T>(url: string, onMessage: (data: T) => void) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    const evtSource = new EventSource(url);

    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as T;
        onMessageRef.current(data);
      } catch (e) {
        console.error('SSE parse error:', e);
      }
    };

    evtSource.onerror = () => {
      evtSource.close();
      setTimeout(() => {
        // Reconnect handled by browser's EventSource
      }, 3000);
    };

    return () => evtSource.close();
  }, [url]);
}
