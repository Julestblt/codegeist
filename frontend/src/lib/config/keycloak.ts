import Keycloak from 'keycloak-js';

const keycloakConfig = {
	url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8081',
	realm: import.meta.env.VITE_KEYCLOAK_REALM || 'bid',
	clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'codegeist-frontend'
};

const keycloak = new Keycloak(keycloakConfig);

export { keycloak, keycloakConfig };
