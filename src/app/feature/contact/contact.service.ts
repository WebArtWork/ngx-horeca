import { isPlatformBrowser } from '@angular/common';
import { inject, Service, PLATFORM_ID, WritableSignal } from '@angular/core';
import { HttpService } from '@wawjs/ngx-http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const CONTACT_PHONE_STORAGE_KEY = 'horeca.contact.phone';

export interface ContactSubmission<Request extends { phone: string }> {
	request: Request;
	submittedRequest: WritableSignal<Request | null>;
	submitMessage: WritableSignal<string>;
	submitError: WritableSignal<string>;
	normalize: (request: Request) => Request;
	message: (request: Request) => string;
	successMessage: string;
	errorMessage: string;
}

@Service()
export class ContactService {
	private readonly _httpService = inject(HttpService);
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

	contact(message: string): Observable<unknown> {
		return this._httpService.post('/api/telegram/contact', {
			slug: environment.companyId,
			message,
		});
	}

	async submit<Request extends { phone: string }>(submission: ContactSubmission<Request>): Promise<void> {
		if (submission.submittedRequest()) return;

		const request = submission.normalize(submission.request);
		submission.submitMessage.set('');
		submission.submitError.set('');
		this.savePhone(request.phone);

		try {
			await firstValueFrom(this.contact(submission.message(request)));
			submission.submittedRequest.set(request);
			submission.submitMessage.set(submission.successMessage);
		} catch {
			submission.submitError.set(submission.errorMessage);
		}
	}

	getSavedPhone(): string {
		if (!this._isBrowser) {
			return '';
		}

		return localStorage.getItem(CONTACT_PHONE_STORAGE_KEY) ?? '';
	}

	savePhone(phone: string): void {
		if (!this._isBrowser) {
			return;
		}

		const normalized = phone.trim();

		if (normalized) {
			localStorage.setItem(CONTACT_PHONE_STORAGE_KEY, normalized);
		}
	}
}
