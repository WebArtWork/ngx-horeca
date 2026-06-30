import { isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	effect,
	inject,
	PLATFORM_ID,
	signal,
} from '@angular/core';
import { FormField, FormRoot, form, required } from '@angular/forms/signals';
import { LanguageService, TranslateDirective, TranslateService } from '@wawjs/ngx-translate';
import { firstValueFrom } from 'rxjs';
import spaData from '../../../data/spa/spa.json';
import { ContactService } from '../../feature/contact/contact.service';
import { companyProfile } from '../../feature/company/company.data';

interface SpaScheduleItem {
	label: string;
	price: string;
}

interface SpaSchedule {
	days: string;
	items: SpaScheduleItem[];
}

interface SpaService {
	slug: string;
	title: string;
	subtitle: string;
	description: string;
	features: string[];
	schedule: SpaSchedule[];
	note: string;
	images: string[];
}

interface SpaPageData {
	eyebrow: string;
	title: string;
	description: string;
	tags: string[];
	services: SpaService[];
	booking: {
		title: string;
		text: string;
	};
}

interface SpaBookingRequest {
	phone: string;
	date: string;
	time: string;
	message: string;
}

const initialSpaBookingRequest = (phone = ''): SpaBookingRequest => ({
	phone,
	date: '',
	time: '',
	message: '',
});

const SPA_TRANSLATION_PATH = '/data/spa/i18n';

@Component({
	imports: [FormField, FormRoot, NgOptimizedImage, TranslateDirective],
	templateUrl: './spa.component.html',
	styleUrl: './spa.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpaComponent {
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
	private readonly _contactService = inject(ContactService);
	private readonly _languageService = inject(LanguageService);
	private readonly _translateService = inject(TranslateService);

	protected readonly page = spaData as SpaPageData;
	protected readonly unavailableImages = signal<ReadonlySet<string>>(new Set());
	protected readonly submittedRequest = signal<SpaBookingRequest | null>(null);
	protected readonly submitMessage = signal('');
	protected readonly submitError = signal('');
	protected readonly company = companyProfile;
	protected readonly bookingRequest = signal(
		initialSpaBookingRequest(this._contactService.getSavedPhone()),
	);
	protected readonly bookingForm = form(
		this.bookingRequest,
		(path) => {
			required(path.phone, { message: 'Номер телефону обов’язковий' });
		},
		{
			name: 'spaBooking',
			submission: {
				action: async () => {
					if (this.submittedRequest()) {
						return null;
					}

					const request = this._normalizeRequest(this.bookingRequest());

					this.submitMessage.set('');
					this.submitError.set('');
					this._contactService.savePhone(request.phone);

					try {
						await firstValueFrom(
							this._contactService.contact(this._buildMessage(request)),
						);
						this.submittedRequest.set(request);
						this.submitMessage.set('Запит збережено');
					} catch {
						this.submitError.set(
							'Не вдалося надіслати запит. Спробуйте ще раз або зателефонуйте нам.',
						);
					}

					return null;
				},
				onInvalid: (field) => {
					field.phone().focusBoundControl();
				},
			},
		},
	);

	constructor() {
		effect(() => {
			if (!this._isBrowser) {
				return;
			}

			const language = this._languageService.language();

			void this._translateService.loadExtraTranslation(SPA_TRANSLATION_PATH, {
				language,
			});
		});
	}

	protected imageSrc(path: string): string {
		return _assetPath(path);
	}

	protected isImageUnavailable(path: string): boolean {
		return this.unavailableImages().has(path);
	}

	protected markImageUnavailable(path: string) {
		this.unavailableImages.update((images) => new Set(images).add(path));
	}

	private _buildMessage(request: SpaBookingRequest): string {
		return [
			'New spa request',
			`Phone: ${request.phone}`,
			request.date ? `Date: ${request.date}` : '',
			request.time ? `Time: ${request.time}` : '',
			request.message ? `Comment: ${request.message}` : '',
		]
			.filter(Boolean)
			.join('\n');
	}

	private _normalizeRequest(request: SpaBookingRequest): SpaBookingRequest {
		return {
			phone: request.phone.trim(),
			date: request.date.trim(),
			time: request.time.trim(),
			message: request.message.trim(),
		};
	}
}

function _assetPath(path: string): string {
	const normalized = path.trim().replace(/^\/+/, '');

	if (normalized.startsWith('assets/')) {
		return `/${normalized.replace(/^assets\//, '')}`;
	}

	return `/${normalized}`;
}
