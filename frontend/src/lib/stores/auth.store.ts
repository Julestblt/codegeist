import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { authService } from '$lib/services/auth.service';

export interface User {
	id?: string;
	username?: string;
	email?: string;
}

export interface AuthState {
	isAuthenticated: boolean;
	isLoading: boolean;
	user: User | null;
}

const createAuthStore = () => {
	const { subscribe, set, update } = writable<AuthState>({
		isAuthenticated: false,
		isLoading: true,
		user: null
	});

	return {
		subscribe,
		init: async () => {
			if (!browser) return;

			try {
				await authService.init();

				const isAuthenticated = authService.isAuthenticated();

				set({
					isAuthenticated,
					isLoading: false,
					user: isAuthenticated ? {} : null
				});
			} catch (error) {
				console.error("Erreur lors de l'initialisation de l'auth store:", error);
				set({
					isAuthenticated: false,
					isLoading: false,
					user: null
				});
			}
		},
		login: async () => {
			await authService.login();
		},
		logout: async () => {
			await authService.logout();
			set({
				isAuthenticated: false,
				isLoading: false,
				user: null
			});
		},
		setAuthenticated: (authenticated: boolean) => {
			update((state) => ({
				...state,
				isAuthenticated: authenticated,
				user: authenticated ? {} : null
			}));
		}
	};
};

export const authStore = createAuthStore();
