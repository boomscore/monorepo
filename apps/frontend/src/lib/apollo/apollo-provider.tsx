'use client';

import { ReactNode } from 'react';
import { ApolloProvider as ApolloProviderBase } from '@apollo/client';
import { getClient } from './apollo-client';

interface ApolloProviderProps {
  children: ReactNode;
}

export function ApolloProvider({ children }: ApolloProviderProps) {
  return <ApolloProviderBase client={getClient()}>{children}</ApolloProviderBase>;
}
