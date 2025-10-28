import { gql } from '@apollo/client';
import { getClient } from '../apollo';

export type SignInInput = {
  email: string;
  password: string;
};

export type SignUpInput = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatar?: string;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken?: string;
  message?: string;
};

export type MeResponse = { user: AuthUser };

const ME_QUERY = gql`
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

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        email
        username
        firstName
        lastName
      }
      accessToken
      message
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($input: CreateUserInput!) {
    register(input: $input) {
      user {
        id
        email
        username
        firstName
        lastName
      }
      accessToken
      message
    }
  }
`;

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($firstName: String, $lastName: String) {
    updateProfile(firstName: $firstName, lastName: $lastName) {
      id
      email
      username
      firstName
      lastName
      avatar
    }
  }
`;

export async function getCurrentUser(): Promise<MeResponse> {
  const client = getClient();
  const { data } = await client.query<{ me: AuthUser | null }>({
    query: ME_QUERY,
    fetchPolicy: 'network-only', // Always fetch fresh
  });
  if (!data.me) throw new Error('Not authenticated');
  return { user: data.me };
}

export async function signInWithEmailPassword(input: SignInInput): Promise<AuthResponse> {
  const client = getClient();
  const { data } = await client.mutate<{ login: AuthResponse }>({
    mutation: LOGIN_MUTATION,
    variables: { input },
  });
  if (!data?.login) throw new Error('Login failed');
  return data.login;
}

export async function registerWithEmailPassword(input: SignUpInput): Promise<AuthResponse> {
  const client = getClient();
  const { data } = await client.mutate<{ register: AuthResponse }>({
    mutation: REGISTER_MUTATION,
    variables: { input },
  });
  if (!data?.register) throw new Error('Registration failed');
  return data.register;
}

export async function logout(): Promise<{ success: boolean }> {
  const client = getClient();
  const { data } = await client.mutate<{ logout: boolean }>({
    mutation: LOGOUT_MUTATION,
  });
  return { success: data?.logout ?? false };
}

export type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
};

export async function updateProfile(input: UpdateProfileInput): Promise<AuthUser> {
  const client = getClient();
  const { data } = await client.mutate<{ updateProfile: AuthUser }>({
    mutation: UPDATE_PROFILE_MUTATION,
    variables: input,
  });
  if (!data?.updateProfile) throw new Error('Update failed');
  return data.updateProfile;
}
