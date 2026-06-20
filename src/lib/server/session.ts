import crypto from 'node:crypto';
import { SESSION_SECRET } from '$env/static/private';
import type { MockUser } from './mock-auth';

function hmac(data: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('hex');
}

export function signSession(user: MockUser): string {
  const payload = Buffer.from(JSON.stringify(user)).toString('base64url');
  return `${payload}.${hmac(payload)}`;
}

export function verifySession(cookie: string): MockUser | null {
  const dot = cookie.lastIndexOf('.');
  if (dot === -1) return null;
  const payload = cookie.slice(0, dot);
  const sig = cookie.slice(dot + 1);
  const expected = hmac(payload);
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) {
      return null;
    }
  } catch {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as MockUser;
  } catch {
    return null;
  }
}
