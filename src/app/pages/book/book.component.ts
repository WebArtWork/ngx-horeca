import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormField, FormRoot, form, required } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { firstValueFrom } from 'rxjs';
import { ContactService } from '../../feature/contact/contact.service';
import { companyProfile } from '../../feature/company/company.data';

type BookingKind = 'столик' | 'номер' | 'SPA';

interface BookingRequest {
	kind: BookingKind;
	phone: string;
	name: string;
	guests: string;
	date: string;
	time: string;
	comment: string;
}

interface BookingOption {
	value: BookingKind;
	label: string;
	icon: string;
	route: string;
	description: string;
}

const initialBookingRequest = (phone = ''): BookingRequest => ({
	kind: 'столик',
	phone,
	name: '',
	guests: '',
	date: '',
	time: '',
	comment: '',
});

@Component({
	imports: [FormField, FormRoot, RouterLink, TranslateDirective],
	templateUrl: './book.component.html',
	styleUrl: './book.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookComponent {
	private readonly _contactService = inject(ContactService);

	protected readonly bookingOptions: BookingOption[] = [
		{
			value: 'столик',
			label: 'Столик',
			icon: 'restaurant',
			route: '/menu',
			description: 'Забронюйте столик і перегляньте страви перед візитом.',
		},
		{
			value: 'номер',
			label: 'Номер',
			icon: 'hotel',
			route: '/rooms',
			description: 'Дізнайтеся про доступні номери та послуги для гостей.',
		},
		{
			value: 'SPA',
			label: 'SPA',
			icon: 'SPA',
			route: '/spa',
			description: 'Заплануйте wellness-візит, масаж, сауну або відновлення.',
		},
	];
	protected readonly submittedRequest = signal<BookingRequest | null>(null);
	protected readonly submitMessage = signal('');
	protected readonly submitError = signal('');
	protected readonly company = companyProfile;
	protected readonly bookingRequest = signal(
		initialBookingRequest(this._contactService.getSavedPhone()),
	);
	protected readonly bookingForm = form(
		this.bookingRequest,
		(path) => {
			required(path.phone, { message: 'Номер телефону обов’язковий' });
		},
		{
			name: 'booking',
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

	private _buildMessage(request: BookingRequest): string {
		return [
			'New booking request',
			`Type: ${this._bookingKindLabel(request.kind)}`,
			`Phone: ${request.phone}`,
			request.name ? `Name: ${request.name}` : '',
			request.date ? `Date: ${request.date}` : '',
			request.time ? `Time: ${request.time}` : '',
			request.guests ? `Guests: ${request.guests}` : '',
			request.comment ? `Comment: ${request.comment}` : '',
		]
			.filter(Boolean)
			.join('\n');
	}

	private _bookingKindLabel(kind: BookingKind): string {
		return this.bookingOptions.find((option) => option.value === kind)?.label ?? kind;
	}

	private _normalizeRequest(request: BookingRequest): BookingRequest {
		return {
			kind: request.kind,
			phone: request.phone.trim(),
			name: request.name.trim(),
			guests: request.guests.trim(),
			date: request.date.trim(),
			time: request.time.trim(),
			comment: request.comment.trim(),
		};
	}
}
