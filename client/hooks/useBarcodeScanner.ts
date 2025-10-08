import { useState, useEffect, useCallback } from 'react';

interface BarcodeScannerOptions {
  timeout?: number; // Time in ms to wait before considering input as separate (default: 100ms)
  minLength?: number; // Minimum length of barcode before triggering (default: 3)
}

export const useBarcodeScanner = (
  onScan: (code: string) => void,
  options: BarcodeScannerOptions = {}
) => {
  const { timeout = 100, minLength = 3 } = options;
  const [buffer, setBuffer] = useState<string>('');
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const clearBuffer = useCallback(() => {
    setBuffer('');
    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }
  }, [timer]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Clear any existing timer
    if (timer) {
      clearTimeout(timer);
    }

    // Handle the Enter key which usually ends a barcode scan
    if (event.key === 'Enter') {
      if (buffer.length >= minLength) {
        onScan(buffer);
      }
      clearBuffer();
      return;
    }

    // Ignore modifier keys and special keys
    if (
      event.key.length === 1 ||  // Printable character
      (event.key >= '0' && event.key <= '9') ||  // Number keys (in case of numpad)
      event.key === 'Tab'  // Some scanners send Tab instead of Enter
    ) {
      const newBuffer = buffer + event.key;
      setBuffer(newBuffer);

      // Set a new timer to clear the buffer if no input is received within the timeout
      const newTimer = setTimeout(() => {
        if (newBuffer.length >= minLength) {
          onScan(newBuffer);
        }
        clearBuffer();
      }, timeout);

      setTimer(newTimer);
    } else if (event.key === 'Tab') {
      // Handle Tab as a scanner finish signal
      if (buffer.length >= minLength) {
        onScan(buffer);
      }
      clearBuffer();
    }
  }, [buffer, onScan, clearBuffer, timer, timeout, minLength]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [handleKeyDown, timer]);

  return { buffer, clearBuffer };
};