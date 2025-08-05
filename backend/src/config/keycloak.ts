const keycloakConfig = {
  url: process.env.KEYCLOAK_URL || "http://localhost:8081",
  realm: process.env.KEYCLOAK_REALM || "bid",
  clientId: process.env.KEYCLOAK_CLIENT_ID || "fastapi-client",
  clientSecret:
    process.env.KEYCLOAK_CLIENT_SECRET || "IGADCWxthAJWwZQcGY0PCobrYTDbIGcp",
};

export { keycloakConfig };
