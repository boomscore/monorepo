import { HttpLink, ApolloClient, InMemoryCache, from } from '@apollo/client';

// Create HTTP link
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
  credentials: 'include', // Include cookies for authentication
});

// Create Apollo Client factory function
function makeClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: httpLink,
    // Enable development tools in development
    connectToDevTools: process.env.NODE_ENV === 'development',
    // Configure for SSR
    ssrMode: typeof window === 'undefined',
  });
}

// Create client instance
let client: ApolloClient<any> | null = null;

// Get client function that works in both server and client environments
export function getClient() {
  // For server-side rendering, always create a new client
  if (typeof window === 'undefined') {
    return makeClient();
  }

  // For client-side, create client once and reuse
  if (!client) {
    client = makeClient();
  }

  return client;
}

// Export makeClient for provider
export { makeClient };
