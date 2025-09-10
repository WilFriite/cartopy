import { PropsWithChildren } from 'react';
import { DbProvider } from './db-provider';
import { QueryClientProvider } from './query-client-provider';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QuickActionSetup } from './quick-action-setup';

export function Providers({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <DbProvider>
          <QueryClientProvider>
            <QuickActionSetup />
            {children}
          </QueryClientProvider>
        </DbProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
