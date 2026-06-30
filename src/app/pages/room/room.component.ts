import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MetaService } from '@wawjs/ngx-core';
import { LanguageService, TranslateDirective, TranslateService } from '@wawjs/ngx-translate';
import { findFallbackRoomBySlug } from '../../feature/bootstrap/fallback-data';
import { companyProfile } from '../../feature/company/company.data';
import type { Room } from '@wawjs/ngx-horeca';
import { RoomService } from '@wawjs/ngx-horeca';
import { RoomBookingFormComponent } from '../../components/room-booking-form/room-booking-form.component';
import { CanonicalService } from '../../services/canonical.service';
import { buildAbsoluteUrl } from '../../services/seo.utils';

const _fallbackRoom = _resolveFallbackRoom();

@Component({
	imports: [NgOptimizedImage, RoomBookingFormComponent, RouterLink, TranslateDirective],
	templateUrl: './room.component.html',
	styleUrl: './room.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomComponent {
	private readonly _canonicalService = inject(CanonicalService);
	private readonly _languageService = inject(LanguageService);
	private readonly _metaService = inject(MetaService);
	private readonly _roomService = inject(RoomService);
	private readonly _route = inject(ActivatedRoute);
	private readonly _title = inject(Title);
	private readonly _translateService = inject(TranslateService);
	private readonly _slug = toSignal(this._route.paramMap, {
		initialValue: this._route.snapshot.paramMap,
	});

	protected readonly room = computed(() => {
		const slug = this._slug().get('slug');
		const fromService = this._roomService.rooms().find((room) => room.slug === slug);

		return fromService ?? (slug ? findFallbackRoomBySlug(slug) : null) ?? _fallbackRoom;
	});
	protected readonly facts = computed(() =>
		[
			{ label: 'Площа номера', value: this.room().size },
			{ label: 'Розміщення', value: this.room().occupancy },
			{ label: 'Ліжко', value: this.room().bed },
			{ label: 'Ванна кімната', value: this.room().bathroom },
		].filter((fact) => fact.value),
	);
	protected readonly roomBookingOptions = computed(() => [this.room()]);

	constructor() {
		effect(() => {
			this._roomService.loadTranslations();
		});

		effect(() => {
			this._languageService.language();
			const room = this.room();
			const translatedTitle = this._translateService.translate(room.name)();
			const translatedDescription = this._translateService.translate(room.description)();

			this._title.setTitle(`${translatedTitle} | ${companyProfile.name}`);
			this._metaService.applyMeta({
				title: translatedTitle,
				description: translatedDescription,
				image: buildAbsoluteUrl(room.image),
			});
			this._canonicalService.setCanonicalUrl(`/room/${room.slug}`);
		});
	}
}

function _resolveFallbackRoom(): Room {
	const room = findFallbackRoomBySlug('');

	if (!room) {
		throw new Error('No rooms available in room data.');
	}

	return room;
}
