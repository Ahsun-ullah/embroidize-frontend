'use client';

import { captureFirstTouch } from '@/lib/analytics/firstTouch';
import { useEffect } from 'react';

// Records the visitor's first traffic source once (see lib/analytics/firstTouch).
export default function FirstTouchCapture() {
  useEffect(() => {
    captureFirstTouch();
  }, []);
  return null;
}
