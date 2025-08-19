import { PropsWithChildren } from 'react';
import { DbProvider } from './db-provider';

export function Providers({ children }: PropsWithChildren) {
  return <DbProvider>{children}</DbProvider>;
}
