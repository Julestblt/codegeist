import { AlertTriangle, CheckCircle, FolderOpen, Shield } from 'lucide-svelte';
import type { DashboardAnalytics } from '$lib/types/api';
import type { ComponentType } from 'svelte';

export interface DashboardCard {
	title: string;
	value: number;
	icon: ComponentType;
	iconColor: string;
}

export function createDashboardCards(
	totalProjects: number,
	analytics: DashboardAnalytics | null
): DashboardCard[] {
	return [
		{
			title: 'Total Projects',
			value: totalProjects,
			icon: FolderOpen,
			iconColor: 'text-blue-600'
		},
		{
			title: 'Total Projects Analyzed',
			value: analytics?.totalProjectsAnalyzed || 0,
			icon: CheckCircle,
			iconColor: 'text-emerald-600'
		},
		{
			title: 'Total Vulnerabilities',
			value: analytics?.totalIssues || 0,
			icon: AlertTriangle,
			iconColor: 'text-yellow-600'
		},
		{
			title: 'Critical Vulnerabilities',
			value: analytics?.critical || 0,
			icon: Shield,
			iconColor: 'text-red-600'
		}
	];
}

export const DASHBOARD_CONFIG = {
	title: 'Security Dashboard',
	subtitle: 'Monitor and analyze your code repositories for security vulnerabilities',
	badgeText: 'Live Monitoring'
} as const;

export const DashboardFormatters = {
	/**
	 * Formate un nombre pour l'affichage (ex: 1000 -> 1K)
	 */
	formatNumber: (value: number): string => {
		if (value >= 1000000) {
			return `${(value / 1000000).toFixed(1)}M`;
		}
		if (value >= 1000) {
			return `${(value / 1000).toFixed(1)}K`;
		}
		return value.toString();
	},

	getCriticalityColor: (critical: number): string => {
		if (critical > 10) return 'text-red-600';
		if (critical > 5) return 'text-orange-600';
		if (critical > 0) return 'text-yellow-600';
		return 'text-green-600';
	}
};
