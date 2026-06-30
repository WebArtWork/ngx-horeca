import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	DestroyRef,
	effect,
	inject,
	PLATFORM_ID,
	signal,
	untracked,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
	buildFocusedDishCategoryPath,
	buildRenderedDishCategoryPath,
	DishCategory,
	DishMenuPage,
	filterCategoriesByDishes,
	filterDishesByMenuPage,
	findDishCategoryPath,
	findFirstDishCategory,
} from '@wawjs/ngx-horeca';
import { DishCategoryService } from '@wawjs/ngx-horeca';
import { DishService } from '@wawjs/ngx-horeca';
import { TranslateDirective } from '@wawjs/ngx-translate';
import {
	MenuCategoriesComponent,
	MenuCategorySelection,
} from '../../components/menu-categories/menu-categories.component';
import { MenuDishesComponent } from '../../components/menu-dishes/menu-dishes.component';

interface MenuPageConfig {
	emptyDescription: string;
	emptyTitle: string;
	icon: string;
	title: string;
	url: string;
}

const MENU_PAGE_CONFIG: Record<DishMenuPage, MenuPageConfig> = {
	menu: {
		emptyDescription: '',
		emptyTitle: '',
		icon: 'restaurant_menu',
		title: 'Меню',
		url: '/menu',
	},
	favorites: {
		emptyDescription: 'Додавайте позиції з меню до обраного, і вони з\'являться тут.',
		emptyTitle: 'Немає збережених страв',
		icon: 'favorite',
		title: 'Обране',
		url: '/favorites',
	},
	seasonal: {
		emptyDescription: 'Сезонні пропозиції з\'являться тут, коли будуть доступні.',
		emptyTitle: 'Немає сезонних пропозицій',
		icon: 'local_florist',
		title: 'Сезонні пропозиції',
		url: '/seasonal',
	},
	daily: {
		emptyDescription: "Меню дня з'явиться тут, коли воно буде доступне.",
		emptyTitle: "Меню дня недоступне",
		icon: 'today',
		title: "Меню дня",
		url: '/daily',
	},
};

@Component({
	imports: [MenuCategoriesComponent, MenuDishesComponent, RouterLink, TranslateDirective],
	templateUrl: './menu.component.html',
	styleUrl: './menu.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
	private readonly _destroyRef = inject(DestroyRef);
	private readonly _document = inject(DOCUMENT);
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
	private readonly _router = inject(Router);
	private _sectionRefreshTimer: ReturnType<typeof setTimeout> | null = null;
	private _scrollFrame: number | null = null;
	private _scrollStartTimer: ReturnType<typeof setTimeout> | null = null;
	private _scrollEndTimer: ReturnType<typeof setTimeout> | null = null;
	private _programmaticScroll = false;

	readonly activePage = this._resolvePage(this._router.url);
	readonly pageConfig = MENU_PAGE_CONFIG[this.activePage];
	readonly dishCategoryService = inject(DishCategoryService);
	readonly dishService = inject(DishService);
	readonly focusedCategories = signal<DishCategory[]>([]);
	readonly categoryLinks = Object.values(MENU_PAGE_CONFIG).map((config) => ({
		icon: config.icon,
		label: config.title,
		url: config.url,
	}));
	readonly filteredDishes = computed(() => {
		const dishes = this.dishService.dishes();

		return filterDishesByMenuPage(dishes, this.activePage, this.dishService.favoriteDishes());
	});
	readonly filteredCategories = computed(() => {
		const categories = this.dishCategoryService.categories();
		const dishes = this.filteredDishes();

		return this.activePage === 'menu'
			? categories
			: filterCategoriesByDishes(categories, dishes);
	});
	readonly filteredSelectedCategories = computed(() => {
		const selectedCategories = this.dishCategoryService.selectedCategories();
		const dishes = this.filteredDishes();

		return this.activePage === 'menu'
			? selectedCategories
			: filterCategoriesByDishes(selectedCategories, dishes);
	});
	readonly showEmptyState = computed(
		() => this.activePage !== 'menu' && this.filteredDishes().length === 0,
	);

	constructor() {
		this._destroyRef.onDestroy(() => {
			if (this._sectionRefreshTimer) {
				clearTimeout(this._sectionRefreshTimer);
			}

			if (this._scrollFrame !== null) {
				this._document.defaultView?.cancelAnimationFrame(this._scrollFrame);
			}

			this._document.defaultView?.removeEventListener('scroll', this._onWindowScroll);

			if (this._scrollStartTimer) {
				clearTimeout(this._scrollStartTimer);
			}

			if (this._scrollEndTimer) {
				clearTimeout(this._scrollEndTimer);
			}
		});

		effect(() => {
			this.dishService.loadTranslations();
		});

		effect(() => {
			const categories = this.filteredCategories();
			untracked(() => {
				if (
					categories.length &&
					this.dishCategoryService.selectedCategories()[0]?.slug !== categories[0].slug
				) {
					const selectedCategories = [categories[0]];

					this.dishCategoryService.setSelectedCategories(selectedCategories);
					this.focusedCategories.set(
						buildFocusedDishCategoryPath(categories[0], this.filteredDishes()),
					);
				}
			});
		});

		effect(() => {
			this.filteredDishes();
			this.filteredSelectedCategories();

			untracked(() => {
				this._queueSectionTrackingRefresh();
			});
		});
	}

	onCategorySelected(selection: MenuCategorySelection) {
		const selectedCategories = buildRenderedDishCategoryPath(
			selection.category,
			selection.ancestors,
		);
		const focusedCategories = buildFocusedDishCategoryPath(
			selection.category,
			this.filteredDishes(),
			selection.ancestors,
		);
		const targetCategory =
			selection.ancestors.length > 0
				? selection.category
				: findFirstDishCategory(selection.category, this.filteredDishes());

		this.dishCategoryService.setSelectedCategories(selectedCategories);
		this.focusedCategories.set(focusedCategories);
		this._scrollToCategory(targetCategory.slug);
	}

	private _queueSectionTrackingRefresh() {
		if (!this._isBrowser) {
			return;
		}

		if (this._sectionRefreshTimer) {
			clearTimeout(this._sectionRefreshTimer);
		}

		this._sectionRefreshTimer = setTimeout(() => {
			this._sectionRefreshTimer = null;
			this._bindMenuSectionScroll();
		});
	}

	private _bindMenuSectionScroll() {
		const view = this._document.defaultView;

		view?.removeEventListener('scroll', this._onWindowScroll);

		if (!view) {
			return;
		}

		view.addEventListener('scroll', this._onWindowScroll, { passive: true });
		this._updateFocusedCategoryFromScroll();
	}

	private readonly _onWindowScroll = () => {
		if (this._programmaticScroll) {
			return;
		}

		const view = this._document.defaultView;

		if (!view || this._scrollFrame !== null) {
			return;
		}

		this._scrollFrame = view.requestAnimationFrame(() => {
			this._scrollFrame = null;
			this._updateFocusedCategoryFromScroll();
		});
	};

	private _updateFocusedCategoryFromScroll() {
		if (this._programmaticScroll) {
			return;
		}

		const sections = Array.from(
			this._document.querySelectorAll<HTMLElement>('[data-menu-section]'),
		);
		const focusOffset = 140;
		const visibleSection =
			sections.find((section, index) => {
				const currentTop = section.getBoundingClientRect().top - focusOffset;
				const nextTop =
					sections[index + 1]?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;

				return currentTop <= 0 && nextTop - focusOffset > 0;
			}) ??
			sections
				.filter((section) => section.getBoundingClientRect().top >= 0)
				.sort(
					(first, second) =>
						first.getBoundingClientRect().top - second.getBoundingClientRect().top,
				)[0] ??
			sections[0];
		const slug = visibleSection?.id;

		if (!slug || this.focusedCategories().at(-1)?.slug === slug) {
			return;
		}

		const categoryPath = findDishCategoryPath(slug, this.filteredCategories());

		if (categoryPath.length) {
			this.focusedCategories.set(categoryPath);
		}
	}

	private _scrollToCategory(slug: string) {
		if (!this._isBrowser) {
			return;
		}

		if (this._scrollStartTimer) {
			clearTimeout(this._scrollStartTimer);
		}

		this._programmaticScroll = true;
		this._scrollStartTimer = setTimeout(() => {
			this._scrollStartTimer = null;
			const target = this._document.getElementById(slug);

			if (target) {
				target.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}

			if (this._scrollEndTimer) {
				clearTimeout(this._scrollEndTimer);
			}

			this._scrollEndTimer = setTimeout(() => {
				this._programmaticScroll = false;
				this._scrollEndTimer = null;
			}, 700);
		});
	}

	private _resolvePage(url: string): DishMenuPage {
		const path = (url.split(/[?#]/)[0] || '/menu').replace(/\/+$/, '');

		if (path === '/favorites' || path === '/seasonal' || path === '/daily') {
			return path.slice(1) as DishMenuPage;
		}

		return 'menu';
	}
}
