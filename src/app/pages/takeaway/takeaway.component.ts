import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService, TranslateDirective, TranslateService } from '@wawjs/ngx-translate';

const TAKEAWAY_TRANSLATION_PATH = '/data/takeaway/i18n';

@Component({
	imports: [RouterLink, TranslateDirective],
	template: `
		<main class="mx-auto max-w-[var(--container)] px-3 pb-8 pt-3 sm:px-4 sm:pb-10">
			<section class="overflow-hidden rounded-[1.2rem] border border-[var(--c-border)] bg-[var(--c-bg-secondary)] shadow-[var(--shadow-sm)]">
				<div class="border-b border-[var(--c-border)] bg-[linear-gradient(135deg,rgba(197,61,61,0.14),rgba(217,168,88,0.08))] px-4 py-6 sm:px-6 sm:py-8">
					<p class="text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--c-secondary)]">
						<span [translate]="'З собою'">З собою</span>
					</p>
					<h1 class="mt-2 max-w-[44rem] text-2xl font-semibold leading-tight text-[var(--c-text-secondary)] sm:text-4xl">
						<span [translate]="'Замовляйте заздалегідь і забирайте свіжі страви без очікування'">
							Замовляйте заздалегідь і забирайте свіжі страви без очікування
						</span>
					</h1>
					<p class="mt-3 max-w-[42rem] text-sm leading-6 text-[var(--c-text-muted)] sm:text-base">
						<span [translate]="'Оберіть страви з меню, підтвердьте час готовності й заберіть замовлення в точці видачі ресторану.'">
							Оберіть страви з меню, підтвердьте час готовності й заберіть замовлення в точці видачі ресторану.
						</span>
					</p>
				</div>

				<div class="grid gap-3 p-3 sm:grid-cols-3 sm:p-4">
					@for (item of steps; track item.title; let index = $index) {
						<article class="rounded-[1rem] border border-[var(--c-border)] bg-[var(--c-bg-primary)] p-4">
							<div class="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--c-bg-secondary)] text-[var(--c-secondary)]">
								<span class="material-symbols-outlined" aria-hidden="true">{{ item.icon }}</span>
							</div>
							<p class="mt-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--c-secondary)]">
								{{ index + 1 }}
							</p>
							<h2 class="mt-2 text-lg font-semibold text-[var(--c-text-secondary)]">
								<span [translate]="item.title">{{ item.title }}</span>
							</h2>
							<p class="mt-2 text-sm leading-6 text-[var(--c-text-muted)]">
								<span [translate]="item.description">{{ item.description }}</span>
							</p>
						</article>
					}
				</div>

				<div class="border-t border-[var(--c-border)] p-3 sm:p-4">
					<section class="rounded-[1rem] border border-[var(--c-border)] bg-[var(--c-bg-primary)] p-4 sm:flex sm:items-center sm:justify-between sm:gap-6">
						<div>
							<p class="text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--c-secondary)]">
								<span [translate]="'Місце видачі'">Місце видачі</span>
							</p>
							<h2 class="mt-2 text-xl font-semibold text-[var(--c-text-secondary)]">
								<span [translate]="'Забирайте замовлення на головній стійці'">Забирайте замовлення на головній стійці</span>
							</h2>
							<p class="mt-2 text-sm leading-6 text-[var(--c-text-muted)]">
								<span [translate]="&quot;Підійдіть до входу ресторану, назвіть ім'я або номер замовлення, і команда передасть пакунок.&quot;">
									Підійдіть до входу ресторану, назвіть ім'я або номер замовлення, і команда передасть пакунок.
								</span>
							</p>
						</div>

						<a class="ui-btn ui-btn-primary mt-4 shrink-0 sm:mt-0" routerLink="/menu">
							<span class="material-symbols-outlined" aria-hidden="true">restaurant_menu</span>
							<span [translate]="'Переглянути повне меню'">Переглянути повне меню</span>
						</a>
					</section>
				</div>
			</section>
		</main>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TakeawayComponent {
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
	private readonly _languageService = inject(LanguageService);
	private readonly _translateService = inject(TranslateService);

	protected readonly steps = [
		{
			icon: 'restaurant_menu',
			title: 'Оберіть з меню',
			description: 'Обирайте страви, напої та десерти, які зручно забрати з собою.',
		},
		{
			icon: 'schedule',
			title: 'Підтвердьте час приготування',
			description: 'Більшість замовлень готується швидко, а більші замовлення можуть потребувати більше часу.',
		},
		{
			icon: 'takeout_dining',
			title: 'Заберіть замовлення',
			description: 'Приходьте у погоджений час і забирайте все спакованим та готовим.',
		},
	];

	constructor() {
		effect(() => {
			if (!this._isBrowser) {
				return;
			}

			void this._translateService.loadExtraTranslation(TAKEAWAY_TRANSLATION_PATH, {
				language: this._languageService.language(),
			});
		});
	}
}
