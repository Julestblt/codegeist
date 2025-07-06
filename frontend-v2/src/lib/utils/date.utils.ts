const formatDateTime = (date: Date | string | null | undefined): string => {
	if (!date) return 'Unknown';

	const d = typeof date === 'string' ? new Date(date) : date;

	// Vérifier si la date est valide
	if (isNaN(d.getTime())) return 'Invalid date';

	const day = d.getDate().toString().padStart(2, '0');
	const month = (d.getMonth() + 1).toString().padStart(2, '0'); // +1 car les mois commencent à 0
	const year = d.getFullYear();
	const hours = d.getHours().toString().padStart(2, '0');
	const minutes = d.getMinutes().toString().padStart(2, '0');

	return `${day}/${month}/${year}, ${hours}:${minutes}`;
};

export { formatDateTime };
