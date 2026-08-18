import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormField, FormRoot, form, required } from '@angular/forms/signals';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { ContactService } from '../../feature/contact/contact.service';
import {
	companyEmailHref,
	companyPhoneHref,
	companyProfile,
	companyTranslateVars,
} from '../../feature/company/company.data';

interface SocialContactRequest {
	phone: string;
	message: string;
}

const initialSocialContactRequest = (phone = ''): SocialContactRequest => ({
	phone,
	message: '',
});

@Component({
	imports: [FormField, FormRoot, NgOptimizedImage, TranslateDirective],
	templateUrl: './socials.component.html',
	styleUrl: './socials.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialsComponent {
	private readonly _contactService = inject(ContactService);

	protected readonly submittedRequest = signal<SocialContactRequest | null>(null);
	protected readonly submitMessage = signal('');
	protected readonly submitError = signal('');
	protected readonly company = companyProfile;
	protected readonly companyVars = companyTranslateVars;
	protected readonly companyPhoneHref = companyPhoneHref;
	protected readonly companyEmailHref = companyEmailHref;
	protected readonly contactRequest = signal(
		initialSocialContactRequest(this._contactService.getSavedPhone()),
	);
	protected readonly contactForm = form(
		this.contactRequest,
		(path) => {
			required(path.phone, { message: 'Номер телефону обов’язковий' });
		},
		{
			name: 'socialContact',
			submission: {
				action: async () => {
					await this._contactService.submit({
						request: this.contactRequest(), submittedRequest: this.submittedRequest,
						submitMessage: this.submitMessage, submitError: this.submitError,
						normalize: request => this._normalizeRequest(request), message: request => this._buildMessage(request),
						successMessage: 'Повідомлення надіслано', errorMessage: 'Не вдалося надіслати повідомлення. Спробуйте ще раз або зателефонуйте нам.',
					});
					return null;
				},
				onInvalid: (field) => {
					field.phone().focusBoundControl();
				},
			},
		},
	);

	private _buildMessage(request: SocialContactRequest): string {
		return ['New contact message', `Phone: ${request.phone}`, request.message]
			.filter(Boolean)
			.join('\n');
	}

	private _normalizeRequest(request: SocialContactRequest): SocialContactRequest {
		return {
			phone: request.phone.trim(),
			message: request.message.trim(),
		};
	}
}
