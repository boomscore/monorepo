export function getInitials(user: {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  email: string;
}): string {
  const firstInitial = user.firstName?.[0];
  const lastInitial = user.lastName?.[0];

  if (firstInitial && lastInitial) {
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }

  if (firstInitial) {
    const secondChar = user.firstName?.[1] || firstInitial;
    return `${firstInitial}${secondChar}`.toUpperCase();
  }

  if (lastInitial) {
    const secondChar = user.lastName?.[1] || lastInitial;
    return `${lastInitial}${secondChar}`.toUpperCase();
  }

  if (user.username && user.username.length >= 2) {
    return user.username.slice(0, 2).toUpperCase();
  }

  if (user.username) {
    return user.username[0].repeat(2).toUpperCase();
  }

  if (user.email.length >= 2) {
    return user.email.slice(0, 2).toUpperCase();
  }

  return user.email[0].repeat(2).toUpperCase();
}

export function getDisplayName(user: {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  email: string;
}): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }

  if (user.firstName) {
    return user.firstName;
  }

  if (user.lastName) {
    return user.lastName;
  }

  if (user.username) {
    return user.username;
  }

  return user.email;
}
