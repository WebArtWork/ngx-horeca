import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormField, FormRoot, form, required } from '@angular/forms/signals';
import type { Room } from '@wawjs/ngx-horeca';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { firstValueFrom } from 'rxjs';
import { ContactService } from '../../feature/contact/contact.service';
import { companyProfile } from '../../feature/company/company.data';

interface RoomBookingRequest {
	phone: string;
	room: string;
	date: string;
	message: string;
}

const initialRoomBookingRequest = (phone = ''): RoomBookingRequest => ({
	phone,
	room: '',
	date: '',
	message: '',
});

@Component({
	selector: 'app-room-booking-form',
	imports: [FormField, FormRoot, TranslateDirective],
	templateUrl: './room-booking-form.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomBookingFormComponent {
	private readonly _contactService = inject(ContactService);

	readonly rooms = input<Room[]>([]);
	readonly selectedRoom = input('');
	readonly idPrefix = input('room-booking');

	protected readonly hasRoomSelect = computed(() => !this.selectedRoom().trim());
	protected readonly phoneHelpId = computed(() => `${this.idPrefix()}-phone-help`);
	protected readonly submittedRequest = signal<RoomBookingRequest | null>(null);
	protected readonly submitMessage = signal('');
	protected readonly submitError = signal('');
	protected readonly company = companyProfile;
	protected readonly bookingRequest = signal(
		initialRoomBookingRequest(this._contactService.getSavedPhone()),
	);
	protected readonly bookingForm = form(
		this.bookingRequest,
		(path) => {
			required(path.phone, { message: 'Номер телефону обов’язковий' });
		},
		{
			name: 'roomBooking',
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

	private _buildMessage(request: RoomBookingRequest): string {
		return [
			'New room request',
			`Phone: ${request.phone}`,
			request.room ? `Room: ${request.room}` : '',
			request.date ? `Date: ${request.date}` : '',
			request.message ? `Comment: ${request.message}` : '',
		]
			.filter(Boolean)
			.join('\n');
	}

	private _normalizeRequest(request: RoomBookingRequest): RoomBookingRequest {
		return {
			phone: request.phone.trim(),
			room: this.selectedRoom().trim() || request.room.trim(),
			date: request.date.trim(),
			message: request.message.trim(),
		};
	}
}
