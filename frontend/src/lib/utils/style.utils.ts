import { AlertCircle, AlertTriangle, Info, XCircle } from 'lucide-svelte';

const getSeverityIcon = (severity: string) => {
	const sev = severity.toLowerCase();
	switch (sev) {
		case 'critical':
			return { component: XCircle, class: 'text-red-600' };
		case 'high':
			return { component: AlertCircle, class: 'text-orange-600' };
		case 'medium':
			return { component: AlertTriangle, class: 'text-yellow-600' };
		case 'low':
			return { component: Info, class: 'text-blue-600' };
		default:
			return { component: Info, class: 'text-gray-600' };
	}
};

const getSeverityColor = (severity: string) => {
	const sev = severity.toLowerCase();
	switch (sev) {
		case 'critical':
			return 'bg-red-100/50 dark:bg-red-900/20';
		case 'high':
			return 'bg-orange-100/50 dark:bg-orange-900/20';
		case 'medium':
			return 'bg-yellow-100/50 dark:bg-yellow-900/20';
		case 'low':
			return 'bg-blue-100/50 dark:bg-blue-900/20';
		default:
			return 'bg-gray-100/50 border-gray-200';
	}
};

export { getSeverityIcon, getSeverityColor };
