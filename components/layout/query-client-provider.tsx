import { onlineManager, QueryClientProvider as Provider, QueryClient } from '@tanstack/react-query';
import * as Network from 'expo-network';
import { type PropsWithChildren } from 'react';

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

export function QueryClientProvider({ children }: PropsWithChildren) {
  onlineManager.setEventListener((setOnline) => {
    const eventSub = Network.addNetworkStateListener((state) => {
      setOnline(!!state.isConnected);
    });
    return eventSub.remove;
  });

  return <Provider client={qc}>{children}</Provider>;
}
