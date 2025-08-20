import { PropsWithChildren } from 'react';
import { DbProvider } from './db-provider';
import { QueryClientProvider } from './query-client-provider';

export function Providers({ children }: PropsWithChildren) {
  return (
    <DbProvider>
      <QueryClientProvider>{children}</QueryClientProvider>
    </DbProvider>
  );
}
