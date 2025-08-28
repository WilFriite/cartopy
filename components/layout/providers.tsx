import { PropsWithChildren } from 'react';
import { DbProvider } from './db-provider';
import { QueryClientProvider } from './query-client-provider';
import { KeyboardProvider } from 'react-native-keyboard-controller';

export function Providers({ children }: PropsWithChildren) {
  return (
    <KeyboardProvider>
      <DbProvider>
        <QueryClientProvider>{children}</QueryClientProvider>
      </DbProvider>
    </KeyboardProvider>
  );
}
