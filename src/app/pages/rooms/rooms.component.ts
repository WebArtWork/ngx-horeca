import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RoomService } from '@wawjs/ngx-horeca';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { RoomBookingFormComponent } from '../../components/room-booking-form/room-booking-form.component';
import { companyPhoneHref, companyProfile } from '../../feature/company/company.data';

type ContactLink = {
	label: string;
	href: string;
	description: string;
};

@Component({
	imports: [NgOptimizedImage, RoomBookingFormComponent, RouterLink, TranslateDirective],
	templateUrl: './rooms.component.html',
	styleUrl: './rooms.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomsComponent {
	private readonly _roomService = inject(RoomService);

	protected readonly amenities = [
		'ÐšÐ¾Ð¼Ñ„Ð¾Ñ€Ñ‚Ð½Ñ– Ð½Ð¾Ð¼ÐµÑ€Ð¸',
		'Ð¡Ð½Ñ–Ð´Ð°Ð½Ð¾Ðº Ð´Ð»Ñ Ð³Ð¾ÑÑ‚ÐµÐ¹',
		'Ð ÐµÑÑ‚Ð¾Ñ€Ð°Ð½ Ð°Ð±Ð¾ ÐºÐ°Ñ„Ðµ Ð½Ð° Ñ‚ÐµÑ€Ð¸Ñ‚Ð¾Ñ€Ñ–Ñ—',
		'ÐžÐ±ÑÐ»ÑƒÐ³Ð¾Ð²ÑƒÐ²Ð°Ð½Ð½Ñ Ð½Ð¾Ð¼ÐµÑ€Ñ–Ð²',
		'Wi-Fi Ñƒ Ð½Ð¾Ð¼ÐµÑ€Ð°Ñ…',
		'ÐŸÐ°Ñ€ÐºÑ–Ð½Ð³',
		'Ð Ð¾Ð±Ð¾Ñ‡Ð° Ð·Ð¾Ð½Ð°',
		'ÐšÐ¾Ð½Ð´Ð¸Ñ†Ñ–Ð¾Ð½ÐµÑ€',
		'Ð¢Ñ€Ð°Ð½ÑÑ„ÐµÑ€ Ð½Ð° Ð·Ð°Ð¿Ð¸Ñ‚',
		'ÐŸÑ–Ð´Ñ‚Ñ€Ð¸Ð¼ÐºÐ° Ð±Ñ€Ð¾Ð½ÑŽÐ²Ð°Ð½Ð½Ñ',
	];
	protected readonly loadingCards = [1, 2, 3];
	protected readonly rooms = this._roomService.rooms;
	protected readonly isLoading = this._roomService.isLoading;
	protected readonly hasRooms = computed(() => this.rooms().length > 0);
	protected readonly company = companyProfile;

	protected readonly contactLinks: ContactLink[] = [
		{
			label: 'Ð—Ð°Ñ‚ÐµÐ»ÐµÑ„Ð¾Ð½ÑƒÐ¹Ñ‚Ðµ Ð½Ð°Ð¼',
			href: companyPhoneHref,
			description: companyProfile.phone,
		},
		{
			label: 'ÐÐ°Ð¿Ð¸ÑÐ°Ñ‚Ð¸ Ñƒ Viber',
			href: 'https://horeca.itkamianets.com/',
			description: 'Ð¨Ð²Ð¸Ð´ÐºÐ¸Ð¹ Ñ‡Ð°Ñ‚ Ð´Ð»Ñ Ð±Ñ€Ð¾Ð½ÑŽÐ²Ð°Ð½Ð½Ñ',
		},
		{
			label: 'ÐÐ°Ð¿Ð¸ÑÐ°Ñ‚Ð¸ Ñƒ Telegram',
			href: 'https://horeca.itkamianets.com/',
			description: '@horeca_hotel',
		},
	];

	constructor() {
		effect(() => {
			this._roomService.loadTranslations();
		});
	}
}
