import { FastifyRequest } from "fastify";

export interface KeycloakUser {
  sub: string;
  email?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: {
    [key: string]: {
      roles: string[];
    };
  };
}

export function getUser(request: FastifyRequest): KeycloakUser | null {
  if (!request.user) {
    return null;
  }
  return request.user as KeycloakUser;
}

export function getUserId(request: FastifyRequest): string | null {
  const user = getUser(request);
  return user?.sub || null;
}

export function hasRole(
  request: FastifyRequest,
  role: string,
  clientId?: string
): boolean {
  const user = getUser(request);
  if (!user) return false;

  if (user.realm_access?.roles.includes(role)) {
    return true;
  }

  if (clientId && user.resource_access?.[clientId]?.roles.includes(role)) {
    return true;
  }

  return false;
}
