import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const folders = ['src/i18n'];

for (const entry of readdirSync('src/data', { withFileTypes: true })) {
	const folder = path.join('src/data', entry.name, 'i18n');

	if (entry.isDirectory() && existsSync(path.join(folder, 'ua.json'))) {
		folders.push(folder);
	}
}

let valid = true;

for (const folder of folders) {
	const source = JSON.parse(readFileSync(path.join(folder, 'ua.json'), 'utf8'));

	if (!Array.isArray(source)) {
		console.error(`${folder}/ua.json is not an array.`);
		valid = false;
		continue;
	}

	for (const file of readdirSync(folder).filter((item) => item.endsWith('.json'))) {
		const payload = JSON.parse(readFileSync(path.join(folder, file), 'utf8'));

		if (!Array.isArray(payload)) {
			console.error(`${folder}/${file} is not an array.`);
			valid = false;
		} else if (payload.length !== source.length) {
			console.error(`${folder}/${file} length ${payload.length} != ua length ${source.length}.`);
			valid = false;
		}
	}
}

console.log(`Validated ${folders.length} i18n folders.`);
process.exit(valid ? 0 : 1);
