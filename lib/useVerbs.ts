'use client';

import { useEffect, useState } from 'react';
import type { VerbEntry } from '@/lib/types';

type VerbsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; verbs: VerbEntry[] };

export function useVerbs() {
  const [state, setState] = useState<VerbsState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/data/verbs.json', { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load verbs.json (${res.status})`);
        const data = (await res.json()) as VerbEntry[];
        if (!Array.isArray(data) || data.length === 0) throw new Error('verbs.json is empty or invalid');
        if (!cancelled) setState({ status: 'ready', verbs: data });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        if (!cancelled) setState({ status: 'error', message });
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
