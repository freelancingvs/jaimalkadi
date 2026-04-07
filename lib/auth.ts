import { cookies } from 'next/headers';

const SESSION_COOKIE = 'ssd_session';
const SESSION_VALUE = 'authenticated';

/**
 * Set the session cookie (call from login API route)
 */
export async function setSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Clear the session cookie (call from logout API route)
 */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Check if the user is authenticated (use in Server Components)
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}
