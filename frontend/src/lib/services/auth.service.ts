import { keycloak } from '$lib/config/keycloak';
import { browser } from '$app/environment';
import Cookies from 'js-cookie';

const TOKEN_COOKIE_NAME = 'keycloak_token';

class AuthService {
	private initialized = false;
	private initPromise: Promise<void> | null = null;
	private isLoggingIn = false;

	async init() {
		if (!browser) return;

		if (this.initialized) return;

		if (this.initPromise) {
			return this.initPromise;
		}

		this.initPromise = this._doInit();
		await this.initPromise;
	}

	private async _doInit() {
		try {
			const token = this.getTokenFromCookie();
			console.log('Token récupéré depuis le cookie:', token ? 'présent' : 'absent');
			console.log('Configuration Keycloak:', {
				url: keycloak.authServerUrl,
				realm: keycloak.realm,
				clientId: keycloak.clientId
			});

			await keycloak.init({
				onLoad: 'login-required',
				token: token || undefined,
				checkLoginIframe: false,
				enableLogging: true
			});

			console.log('Keycloak initialisé, authentifié:', keycloak.authenticated);
			console.log('Token Keycloak:', keycloak.token ? 'présent' : 'absent');

			if (!keycloak.authenticated) {
				console.log('Pas authentifié - raison potentielle:', keycloak.loginRequired);
			}

			if (keycloak.authenticated && keycloak.token) {
				this.saveTokenToCookie(keycloak.token);
			}

			this.initialized = true;
		} catch (error) {
			console.error("Erreur lors de l'initialisation de Keycloak:", error);
			console.error("Détails de l'erreur:", {
				message: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
				keycloakError: (error as { error?: string })?.error,
				keycloakErrorDescription: (error as { error_description?: string })?.error_description
			});
			this.removeTokenFromCookie();
			this.initialized = false;
			await this.login();
		}
	}

	async login() {
		if (!browser || this.isLoggingIn) return;

		this.isLoggingIn = true;
		try {
			console.log('Début de la connexion Keycloak...');
			await keycloak.login({
				redirectUri: window.location.origin
			});
		} catch (error) {
			console.error('Erreur lors de la connexion:', error);
		} finally {
			this.isLoggingIn = false;
		}
	}

	async logout() {
		if (!browser) return;

		try {
			this.removeTokenFromCookie();
			await keycloak.logout({
				redirectUri: window.location.origin
			});
		} catch (error) {
			console.error('Erreur lors de la déconnexion:', error);
		}
	}

	getToken(): string | undefined {
		if (!browser || !keycloak.authenticated) {
			console.log(
				'Pas de token disponible - browser:',
				browser,
				'authenticated:',
				keycloak.authenticated
			);
			return undefined;
		}
		console.log('Token disponible:', keycloak.token ? 'oui' : 'non');
		return keycloak.token;
	}

	isAuthenticated(): boolean {
		if (!browser) return false;
		return keycloak.authenticated || false;
	}

	private saveTokenToCookie(token: string) {
		if (!browser) return;

		try {
			Cookies.set(TOKEN_COOKIE_NAME, token, {
				expires: 1,
				path: '/',
				secure: window.location.protocol === 'https:',
				sameSite: 'strict'
			});
			console.log('Token sauvegardé dans le cookie');
		} catch (error) {
			console.error('Erreur lors de la sauvegarde du token:', error);
		}
	}

	private getTokenFromCookie(): string | null {
		if (!browser) return null;

		try {
			const token = Cookies.get(TOKEN_COOKIE_NAME) || null;
			console.log('Token récupéré du cookie:', token ? 'présent' : 'absent');
			return token;
		} catch (error) {
			console.error('Erreur lors de la récupération du token:', error);
			return null;
		}
	}

	private removeTokenFromCookie() {
		if (!browser) return;

		try {
			Cookies.remove(TOKEN_COOKIE_NAME, { path: '/' });
			console.log('Token supprimé du cookie');
		} catch (error) {
			console.error('Erreur lors de la suppression du token:', error);
		}
	}

	async refreshToken() {
		if (!browser || !keycloak.authenticated) return false;

		try {
			const refreshed = await keycloak.updateToken(30);
			if (refreshed && keycloak.token) {
				this.saveTokenToCookie(keycloak.token);
			}
			return refreshed;
		} catch (error) {
			console.error('Erreur lors du rafraîchissement du token:', error);
			this.removeTokenFromCookie();
			return false;
		}
	}
}

export const authService = new AuthService();
