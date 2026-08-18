import {
	APP_INITIALIZER,
	ApplicationConfig,
	provideBrowserGlobalErrorListeners,
	provideZonelessChangeDetection,
} from '@angular/core';

import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideNgxCore } from '@wawjs/ngx-core';
import { provideNgxHttp } from '@wawjs/ngx-http';
import { provideTranslate } from '@wawjs/ngx-translate';
import { provideNgxUi } from '@wawjs/ngx-ui';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { BootstrapService } from './feature/bootstrap/bootstrap.service';
import { companyProfile } from './feature/company/company.data';
import { buildAbsoluteUrl, seoTitleSuffix, stripTitleSuffix } from './services/seo.utils';

const initializeBootstrapData = (bootstrapService: BootstrapService) => () =>
	bootstrapService.initialize();

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideZonelessChangeDetection(),
		provideRouter(
			routes,
			withRouterConfig({
				onSameUrlNavigation: 'reload',
			}),
		),
		provideHttpClient(withFetch()),
		provideNgxHttp({
			http: {
				url: environment.apiUrl,
			},
		}),
		provideClientHydration(withEventReplay()),
		provideNgxCore({
			meta: {
				applyFromRoutes: true,
				useTitleSuffix: true,
				defaults: {
					title: stripTitleSuffix(companyProfile.defaultSeo.title),
					titleSuffix: seoTitleSuffix,
					description: companyProfile.defaultSeo.description,
					image: buildAbsoluteUrl(companyProfile.defaultSeo.image),
					robots: companyProfile.defaultSeo.robots,
				},
			},
		}),
		provideTranslate({
			defaultLanguage: environment.defaultLanguage,
			languages: environment.languages,
			folder: '/i18n/',
		}),
		provideNgxUi({
			mode: 'light',
			modes: ['light', 'dark'],
			density: 'comfortable',
			densities: ['comfortable', 'compact'],
			radius: 'rounded',
			radiuses: ['rounded', 'square'],
			tokens: {
				ffBase: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
				letterSpacing: '0',
				motion: '0.25s',
				motionFast: '0.15s',
				easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
			},
			lightTokens: {
				primary: '#256eff',
				primaryHover: '#0051f1',
				secondary: '#c53d3d',
				secondaryHover: '#c53d3d',
				bgPrimary: '#f3f4f7',
				bgSecondary: 'rgba(255, 255, 255, 0.88)',
				bgTertiary: '#fcfdfe',
				textPrimary: '#5f6066',
				textSecondary: '#17224f',
				textMuted: '#8b8d94',
				placeholder: '#8b8d94',
				border: '#eceef5',
				shadowSm: '0 1px 2px rgba(0, 0, 0, 0.06)',
				shadowMd: '0 10px 30px rgba(0, 0, 0, 0.08)',
				focusRing: '0 0 0 3px rgba(37, 110, 255, 0.35)',
			},
			darkTokens: {
				primary: '#4f86ff',
				primaryHover: '#256eff',
				secondary: '#e06464',
				secondaryHover: '#e06464',
				bgPrimary: '#0f172a',
				bgSecondary: 'rgba(30, 41, 59, 0.88)',
				bgTertiary: '#1e293b',
				border: '#334155',
				textPrimary: '#e8e8e8',
				textSecondary: '#ffffff',
				textMuted: '#b7b7b7',
				placeholder: '#b7b7b7',
				shadowSm: '0 1px 2px rgba(0, 0, 0, 0.35)',
				shadowMd: '0 10px 30px rgba(0, 0, 0, 0.45)',
				focusRing: '0 0 0 3px rgba(79, 134, 255, 0.35)',
			},
			compactTokens: {
				sp1: '2px',
				sp2: '6px',
				sp3: '10px',
				sp4: '14px',
				sp5: '18px',
				sp6: '22px',
			},
			roundedTokens: {
				radius: '8px',
				radiusCard: '10px',
				radiusBtn: '8px',
			},
			squareTokens: {
				radius: '0px',
				radiusCard: '0px',
				radiusBtn: '0px',
			},
		}),
		{
			provide: APP_INITIALIZER,
			useFactory: initializeBootstrapData,
			deps: [BootstrapService],
			multi: true,
		},
	],
};
