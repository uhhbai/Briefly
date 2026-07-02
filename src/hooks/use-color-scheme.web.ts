import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(subscribeToHydration, getClientSnapshot, getServerSnapshot);
  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}

function subscribeToHydration(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const id = window.setTimeout(onStoreChange, 0);
  return () => window.clearTimeout(id);
}

function getClientSnapshot() {
  return typeof window !== 'undefined';
}

function getServerSnapshot() {
  return false;
}
