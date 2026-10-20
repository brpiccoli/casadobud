import { useCallback, useSyncExternalStore } from 'react';

import { budStore } from '@/features/bud/bud.instance';
import { getActiveSpec } from '@/features/bud/bud.store';

export function useBudThread(threadKey: string) {
  const getSnapshot = useCallback(() => budStore.getThread(threadKey), [threadKey]);
  const thread = useSyncExternalStore(budStore.subscribe, getSnapshot);
  const drafts = useSyncExternalStore(budStore.subscribe, () => budStore.getState().drafts);

  const getGraph = useCallback((graphId: string) => getActiveSpec(drafts[graphId]), [drafts]);

  return { thread, getGraph };
}
