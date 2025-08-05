import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { keycloakConfig } from "../config/keycloak";

interface DecodedToken {
  exp: number;
  iat: number;
  aud: string;
  iss: string;
  sub: string;
  preferred_username?: string;
  email?: string;
  realm_access?: {
    roles: string[];
  };
  [key: string]: any;
}

class KeycloakService {
  private jwksClient: jwksClient.JwksClient;
  private issuer: string;

  constructor() {
    const baseUrl = keycloakConfig.url.replace(/\/$/, "");
    const realm = keycloakConfig.realm;

    this.issuer = `${baseUrl}/realms/${realm}`;

    this.jwksClient = jwksClient({
      jwksUri: `${this.issuer}/protocol/openid-connect/certs`,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 600000,
    });
  }

  /**
   * Get signing key from Keycloak
   */
  private getKey = (header: any, callback: any) => {
    this.jwksClient.getSigningKey(header.kid, (err, key) => {
      if (err) {
        callback(err);
        return;
      }
      const signingKey = key?.getPublicKey();
      callback(null, signingKey);
    });
  };

  /**
   * Verify and decode JWT token
   */
  async verifyToken(token: string): Promise<DecodedToken> {
    const unverified = jwt.decode(token) as any;
    console.log("Token claims:", {
      aud: unverified?.aud,
      iss: unverified?.iss,
      exp: unverified?.exp,
      iat: unverified?.iat,
    });

    return new Promise((resolve, reject) => {
      const verifyOptions: jwt.VerifyOptions = {
        algorithms: ["RS256"],
        issuer: this.issuer,
      };

      if (unverified?.aud) {
        verifyOptions.audience = keycloakConfig.clientId;
      }

      jwt.verify(token, this.getKey, verifyOptions, (err, decoded) => {
        if (err) {
          console.error("JWT verification error:", err.message);
          reject(err);
          return;
        }

        const decodedToken = decoded as DecodedToken;

        if (
          decodedToken.exp &&
          decodedToken.exp < Math.floor(Date.now() / 1000)
        ) {
          reject(new Error("Token expired"));
          return;
        }

        resolve(decodedToken);
      });
    });
  }

  /**
   * Check if user has a specific role
   */
  hasRole(user: DecodedToken, role: string): boolean {
    const roles = user.realm_access?.roles || [];
    return roles.includes(role);
  }

  /**
   * Check if user is admin
   */
  isAdmin(user: DecodedToken): boolean {
    return this.hasRole(user, "bid-admin");
  }
}

export const keycloakService = new KeycloakService();
