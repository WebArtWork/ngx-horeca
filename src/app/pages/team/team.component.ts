import { NgOptimizedImage } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { ProfileService } from '@wawjs/ngx-horeca';

@Component({
	imports: [NgOptimizedImage, RouterLink, TranslateDirective],
	templateUrl: './team.component.html',
	styleUrl: './team.component.scss',
})
export class TeamComponent {
	private readonly _profileService = inject(ProfileService);

	protected readonly profiles = this._profileService.profiles;

	constructor() {
		effect(() => {
			this._profileService.loadTranslations();
		});
	}
}
