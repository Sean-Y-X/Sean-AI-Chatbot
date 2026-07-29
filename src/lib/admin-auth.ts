import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * The passcode is a single weak factor, so it should be long and random
 * (`openssl rand -base64 32`) rather than memorable — that removes any need
 * for rate limiting, which is awkward to do on serverless anyway.
 */
function getPasscode(): string | null {
  return process.env.ADMIN_PASSCODE || null;
}

export function isPasscodeConfigured(): boolean {
  return getPasscode() !== null;
}

/**
 * Compares via fixed-length digests: `timingSafeEqual` throws outright on
 * mismatched buffer lengths, which would leak the expected length.
 */
function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );
}

export function verifyPasscode(input: string): boolean {
  const passcode = getPasscode();
  return passcode === null ? false : safeEqual(input, passcode);
}

/**
 * The session key is derived from the passcode itself, so rotating
 * ADMIN_PASSCODE also invalidates every session that was signed with it.
 */
function sign(payload: string, passcode: string): string {
  return createHmac("sha256", passcode).update(payload).digest("hex");
}

/** Cookie carries a signed expiry, never the passcode itself. */
function createSessionToken(passcode: string): string {
  const expiresAt = String(Date.now() + SESSION_TTL_MS);
  return `${expiresAt}.${sign(expiresAt, passcode)}`;
}

function verifySessionToken(token: string | undefined): boolean {
  const passcode = getPasscode();
  if (!passcode || !token) {
    return false;
  }

  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature) {
    return false;
  }

  const expiry = Number(expiresAt);
  if (!Number.isFinite(expiry) || expiry < Date.now()) {
    return false;
  }

  return safeEqual(signature, sign(expiresAt, passcode));
}

export async function startAdminSession(passcode: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, createSessionToken(passcode), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function endAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

/**
 * For pages. Route handlers and server actions must call
 * `isAdminAuthenticated` themselves and fail closed — the layout guard does
 * not protect them.
 */
export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}
