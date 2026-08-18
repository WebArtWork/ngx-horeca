import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');
const outputDirs = [path.join(rootDir, 'public'), path.join(rootDir, 'dist/app/browser')];

const staticRoutes = [
	'/',
	'/menu',
	'/about',
	'/spa',
	'/book',
	'/favorites',
	'/seasonal',
	'/daily',
	'/rooms',
	'/navigation',
	'/gallery',
	'/discounts',
	'/loyalty',
	'/takeaway',
	'/catering',
	'/articles',
	'/quests',
	'/questions',
	'/rules',
	'/reviews',
	'/events',
	'/products',
	'/jobs',
	'/team',
	'/socials',
];

const company = await readJson('src/data/company/company.json');
const dishes = await readJson('src/data/dish/dishes.json');
const rooms = await readJson('src/data/room/rooms.json');
const discounts = await readJson('src/data/discount/discounts.json');
const articles = await readJson('src/data/article/articles.json');
const quests = await readJson('src/data/quest/quests.json');
const reviews = await readJson('src/data/review/reviews.json');
const events = await readJson('src/data/event/events.json');
const products = await readJson('src/data/product/products.json');
const jobs = await readJson('src/data/job/jobs.json');
const profiles = await readJson('src/data/profile/profiles.json');
const siteUrl = trimTrailingSlash(company.siteUrl || 'https://example.com');
const pageSeo = company.pageSeo ?? {};

const routes = [
	...staticRoutes.filter((route) => isIndexable(route, pageSeo)),
	...toSlugRoutes('/dish', dishes),
	...toSlugRoutes('/room', rooms),
	...toSlugRoutes('/discount', discounts),
	...toSlugRoutes('/article', articles),
	...toSlugRoutes('/quest', quests),
	...toSlugRoutes('/review', reviews),
	...toSlugRoutes('/event', events),
	...toSlugRoutes('/product', products),
	...toSlugRoutes('/job', jobs),
	...toSlugRoutes('/profile', profiles),
];
const lastmod = new Date().toISOString().slice(0, 10);

await Promise.all(
	outputDirs.map(async (outputDir) => {
		await mkdir(outputDir, { recursive: true });
		await writeFile(path.join(outputDir, 'sitemap.xml'), buildSitemap(routes, siteUrl, lastmod));
		await writeFile(path.join(outputDir, 'robots.txt'), buildRobots(siteUrl));
	}),
);

function buildSitemap(routes, siteUrl, lastmod) {
	const urls = routes
		.map(
			(route) => `	<url>
		<loc>${escapeXml(toAbsoluteUrl(siteUrl, route))}</loc>
		<lastmod>${lastmod}</lastmod>
	</url>`,
		)
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function buildRobots(siteUrl) {
	return `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
}

function isIndexable(route, pageSeo) {
	const robots = pageSeo[route]?.robots;

	return typeof robots !== 'string' || !robots.toLowerCase().includes('noindex');
}

function toSlugRoutes(prefix, entries) {
	return Array.isArray(entries)
		? entries
				.map((entry) => entry?.slug)
				.filter((slug) => typeof slug === 'string' && slug.trim().length > 0)
				.map((slug) => `${prefix}/${slug.trim()}`)
		: [];
}

async function readJson(relativePath) {
	return JSON.parse(await readFile(path.join(rootDir, relativePath), 'utf8'));
}

function toAbsoluteUrl(siteUrl, route) {
	return `${siteUrl}${route === '/' ? '' : route}`;
}

function trimTrailingSlash(value) {
	return value.endsWith('/') ? value.slice(0, -1) : value;
}

function escapeXml(value) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}
