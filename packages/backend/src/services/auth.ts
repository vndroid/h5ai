import { createHash } from 'node:crypto';
import type { FastifyRequest } from 'fastify';
import { config } from '../config.js';

const SESSION_KEY = '__h5ai_admin__';

/** Hash a password with SHA-512 (same algorithm as original PHP backend) */
export function hashPassword(password: string): string {
  return createHash('sha512').update(password).digest('hex');
}

export function isAdmin(request: FastifyRequest): boolean {
  return ((request.session as unknown) as Record<string, unknown>)[SESSION_KEY] === true;
}

export function login(request: FastifyRequest, password: string): boolean {
  const hash = hashPassword(password);
  if (hash === config.options.passhash) {
    ((request.session as unknown) as Record<string, unknown>)[SESSION_KEY] = true;
    return true;
  }
  return false;
}

export function logout(request: FastifyRequest): void {
  delete ((request.session as unknown) as Record<string, unknown>)[SESSION_KEY];
}
