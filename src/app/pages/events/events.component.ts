import { Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventService } from '@wawjs/ngx-horeca';
import { TranslateDirective } from '@wawjs/ngx-translate';

@Component({
	imports: [RouterLink, TranslateDirective],
	templateUrl: './events.component.html',
	styleUrl: './events.component.scss',
})
export class EventsComponent {
	private readonly _eventService = inject(EventService);

	protected readonly events = this._eventService.events;
	protected readonly isLoading = this._eventService.isLoading;

	constructor() {
		effect(() => {
			this._eventService.loadTranslations();
		});
	}
}
