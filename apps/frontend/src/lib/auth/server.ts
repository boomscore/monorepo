
import { cookies } from 'next/headers';
import type { MeResponse } from './client';

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';
const COOKIE_NAME = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'bs_token';

const ME_QUERY = `
  query Me {
    me {
      id
      email
      username
      firstName
      lastName
      avatar
    }
  }
`;

export async function getServerCurrentUser(): Promise<MeResponse | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: `${COOKIE_NAME}=${token}`,
    },
    body: JSON.stringify({
      query: ME_QUERY,
    }),
    cache: 'no-store',
  });

  if (!res.ok) return null;

  const { data } = await res.json();
  if (!data?.me) return null;

  return { user: data.me };
}
