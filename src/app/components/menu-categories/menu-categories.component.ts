import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	effect,
	inject,
	input,
	output,
	PLATFORM_ID,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DishCategory } from '@wawjs/ngx-horeca';
import { TranslateDirective } from '@wawjs/ngx-translate';

export interface MenuCategoryExtraLink {
	icon: string;
	url: string;
	label?: string;
}

export interface MenuCategorySelection {
	ancestors: DishCategory[];
	category: DishCategory;
}

@Component({
	selector: 'app-menu-categories',
	imports: [RouterLink, RouterLinkActive, TranslateDirective],
	templateUrl: './menu-categories.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuCategoriesComponent {
	private readonly _document = inject(DOCUMENT);
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
	readonly filteredCategories = input.required<DishCategory[]>();
	readonly filteredSelectedCategories = input.required<DishCategory[]>();
	readonly focusedCategories = input<DishCategory[]>([]);
	readonly extraLinks = input<MenuCategoryExtraLink[]>([]);
	readonly categorySelected = output<MenuCategorySelection>();
	protected readonly activeCategories = computed(() => {
		const focusedCategories = this.focusedCategories();

		return focusedCategories.length ? focusedCategories : this.filteredSelectedCategories();
	});

	protected selectCategory(category: DishCategory, ancestors: DishCategory[] = []) {
		this.categorySelected.emit({ ancestors, category });
	}

	constructor() {
		effect(() => {
			const activeCategory = this.activeCategories().at(-1);

			if (activeCategory) {
				this._scrollCategoryIntoView(activeCategory.slug);
			}
		});
	}

	private _scrollCategoryIntoView(slug: string) {
		if (!this._isBrowser) {
			return;
		}

		this._document
			.querySelector<HTMLElement>(`[data-menu-category-slug="${slug}"]`)
			?.scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
				inline: 'start',
			});
	}
}
