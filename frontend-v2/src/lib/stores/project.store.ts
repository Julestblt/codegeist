import { writable, derived, get } from 'svelte/store';
import type { Project } from '$lib/types/api';
import { getProjects } from '$lib/services/api';

export const projectsStore = writable<Project[]>([]);

export const selectedProjectStore = writable<Project | null>(null);

export const projectsInitializedStore = writable<boolean>(false);

export const totalProjectsStore = derived(projectsStore, ($projects) => $projects.length);

export const hasProjectsStore = derived(projectsStore, ($projects) => $projects.length > 0);

export const projectActions = {
	async loadProjects(): Promise<void> {
		const projects = await getProjects();
		projectsStore.set(projects);
		projectsInitializedStore.set(true);
	},

	addProject(project: Project): void {
		projectsStore.update((projects) => [...projects, project]);
	},

	removeProject(projectId: string): void {
		projectsStore.update((projects) => projects.filter((project) => project.id !== projectId));
	},

	reset(): void {
		projectsStore.set([]);
		selectedProjectStore.set(null);
		projectsInitializedStore.set(false);
	}
};

export const projectStoreUtils = {
	getCurrentProjects(): Project[] {
		return get(projectsStore);
	}
};
