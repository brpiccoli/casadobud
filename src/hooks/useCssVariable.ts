import { useCallback, useSyncExternalStore } from 'react';

function subscribeToThemeChanges(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  return () => observer.disconnect();
}

export function useCssVariable(name: `--${string}`) {
  const readValue = useCallback(
    () => window.getComputedStyle(document.documentElement).getPropertyValue(name).trim(),
    [name],
  );

  return useSyncExternalStore(subscribeToThemeChanges, readValue);
}
