import { Response } from 'express';

type TimeUnit = 'ms' | 's' | 'm' | 'h' | 'd';

function parseDuration(input: string | undefined, fallbackMs: number): number {
  if (!input) return fallbackMs;
  const match = input.trim().match(/^(\d+)(ms|s|m|h|d)$/);
  if (!match) return fallbackMs;
  const value = Number(match[1]);
  const unit = match[2] as TimeUnit;
  const unitMs: Record<TimeUnit, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return value * unitMs[unit];
}

export type AuthCookieOptions = {
  name?: string;
  domain?: string;
};

export function setAuthCookie(res: Response, token: string, opts?: AuthCookieOptions): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = opts?.name || process.env.AUTH_COOKIE_NAME || 'bs_token';
  const cookieDomain = opts?.domain || process.env.AUTH_COOKIE_DOMAIN || undefined;
  const maxAge = parseDuration(process.env.JWT_EXPIRES_IN, 15 * 60 * 1000);
  const sameSiteEnv = (process.env.AUTH_COOKIE_SAMESITE || 'lax').toLowerCase();
  const sameSite = (['lax', 'strict', 'none'].includes(sameSiteEnv) ? sameSiteEnv : 'lax') as
    | 'lax'
    | 'strict'
    | 'none';

  res.cookie(cookieName, token, {
    httpOnly: true,
    sameSite,
    secure: isProduction,
    maxAge,
    path: '/',
    domain: cookieDomain,
  });
}

export function clearAuthCookie(res: Response, opts?: AuthCookieOptions): void {
  const cookieName = opts?.name || process.env.AUTH_COOKIE_NAME || 'bs_token';
  const cookieDomain = opts?.domain || process.env.AUTH_COOKIE_DOMAIN || undefined;
  res.clearCookie(cookieName, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    domain: cookieDomain,
  });
}
