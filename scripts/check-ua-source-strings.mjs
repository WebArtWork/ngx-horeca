import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const issues = [];

const walk = (folder, extensions, skip = () => false) => {
	const files = [];

	for (const entry of readdirSync(folder, { withFileTypes: true })) {
		const file = path.join(folder, entry.name);

		if (skip(file, entry)) {
			continue;
		}

		if (entry.isDirectory()) {
			files.push(...walk(file, extensions, skip));
		} else if (entry.isFile() && extensions.includes(path.extname(file))) {
			files.push(file);
		}
	}

	return files;
};

const hasLatin = (text) => /[A-Za-z]/.test(text);
const hasCyrillic = (text) => /[А-Яа-яІіЇїЄєҐґ]/.test(text);
const ignoredJsonTrail = (trail) =>
	/(^|\.|])(slug|categorySlug|parent|suggested|src|icon|url|image|images|imageAlt|href|email|phone|website|mapUrl|applyUrl|_id|name|lang|locale|code|author|robots|type|twitterCard|servesCuisine|addressCountry)$/.test(
		trail,
	) ||
	trail.includes('.suggested') ||
	trail.includes('.images') ||
	trail.includes('.keywords') ||
	trail.endsWith('.links[0].href') ||
	trail.endsWith('.links[1].href');

for (const file of walk('src/app', ['.html', '.ts'])) {
	const content = readFileSync(file, 'utf8');
	const lines = content.split(/\r?\n/);

	lines.forEach((line, index) => {
		if (
			(/\[translate\]="'.*[A-Za-z].*'"/.test(line) ||
				/translate>[^<]*[A-Za-z]/.test(line) ||
				/translate\('.*[A-Za-z].*'\)/.test(line)) &&
			!hasCyrillic(line) &&
			!line.includes('http')
		) {
			issues.push(`${file}:${index + 1}: ${line.trim()}`);
		}
	});
}

for (const file of walk('src/data', ['.json'], (file) => file.includes(`${path.sep}i18n${path.sep}`))) {
	const data = JSON.parse(readFileSync(file, 'utf8'));

	const visit = (value, trail) => {
		if (typeof value === 'string') {
			if (
				hasLatin(value) &&
				!hasCyrillic(value) &&
				!ignoredJsonTrail(trail) &&
				value !== 'Wi-Fi' &&
				!/^(https?:|mailto:|tel:|\/|[a-z0-9-]+\.(webp|png|jpg|jpeg|svg))/.test(value)
			) {
				issues.push(`${file}:${trail}: ${value}`);
			}

			return;
		}

		if (Array.isArray(value)) {
			value.forEach((item, index) => visit(item, `${trail}[${index}]`));
			return;
		}

		if (value && typeof value === 'object') {
			for (const [key, item] of Object.entries(value)) {
				visit(item, trail ? `${trail}.${key}` : key);
			}
		}
	};

	visit(data, '');
}

if (issues.length) {
	console.error(`Found ${issues.length} possible non-Ukrainian source strings:`);
	for (const issue of issues.slice(0, 120)) {
		console.error(issue);
	}
	process.exit(1);
}

console.log('No obvious Latin source strings found in translate bindings or data JSON.');
