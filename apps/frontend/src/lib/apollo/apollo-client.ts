import { HttpLink, ApolloClient, InMemoryCache, from } from '@apollo/client';

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
  credentials: 'include', // Include cookies for authentication
});

function makeClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: httpLink,
    connectToDevTools: process.env.NODE_ENV === 'development',
    ssrMode: typeof window === 'undefined',
  });
}

let client: ApolloClient<any> | null = null;

export function getClient() {
  if (typeof window === 'undefined') {
    return makeClient();
  }

  if (!client) {
    client = makeClient();
  }

  return client;
}

export { makeClient };
