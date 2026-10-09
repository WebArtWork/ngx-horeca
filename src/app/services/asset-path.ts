export function assetPath(path: string): string {
	const normalized = path.trim().replace(/^\/+/, '');

	return normalized.startsWith('assets/')
		? `/${normalized.replace(/^assets\//, '')}`
		: `/${normalized}`;
}
