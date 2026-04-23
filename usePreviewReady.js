import { useState, useCallback } from 'react';

/**
 * Returns true if the error is a Base44 "preview not available yet" platform error.
 */
export function isPreviewNotReady(error) {
  if (!error) return false;
  const msg = (error?.message || error?.detail || JSON.stringify(error) || '').toLowerCase();
  return (
    msg.includes('preview not available') ||
    msg.includes('preview not available yet') ||
    msg.includes('httpexception') && msg.includes('preview')
  );
}

/**
 * Hook that wraps an async operation with retry logic for preview-not-ready errors.
 *
 * Usage:
 *   const { run, previewPending, retrying } = usePreviewReady();
 *   await run(() => base44.integrations.Core.SendEmail(...));
 */
export function usePreviewReady(maxRetries = 5, intervalMs = 3000) {
  const [previewPending, setPreviewPending] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const run = useCallback(async (fn) => {
    let attempts = 0;
    while (attempts <= maxRetries) {
      try {
        const result = await fn();
        setPreviewPending(false);
        setRetrying(false);
        return result;
      } catch (err) {
        if (isPreviewNotReady(err)) {
          attempts++;
          setPreviewPending(true);
          if (attempts <= maxRetries) {
            setRetrying(true);
            await new Promise((res) => setTimeout(res, intervalMs));
          } else {
            setRetrying(false);
            throw new Error('The preview is still being generated. Please wait a moment and try again.');
          }
        } else {
          setPreviewPending(false);
          setRetrying(false);
          throw err;
        }
      }
    }
  }, [maxRetries, intervalMs]);

  return { run, previewPending, retrying };
}