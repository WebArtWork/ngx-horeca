import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DishCategoryService } from '@wawjs/ngx-horeca';
import { Dish, DishCategory } from '@wawjs/ngx-horeca';
import { DishService } from '@wawjs/ngx-horeca';
import { resolveDishSectionCategories, toDishSections } from '@wawjs/ngx-horeca';
import { MenuDishComponent } from '../menu-dish/menu-dish.component';
import { TranslateDirective } from '@wawjs/ngx-translate';

@Component({
	selector: 'app-menu-dishes',
	imports: [MenuDishComponent, TranslateDirective],
	templateUrl: './menu-dishes.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuDishesComponent {
	private readonly _dishService = inject(DishService);
	private readonly _dishCategoryService = inject(DishCategoryService);
	readonly selectedCategories = input<DishCategory[]>();
	readonly dishes = input<Dish[]>();

	private readonly categories = computed(() => {
		const selectedCategories =
			this.selectedCategories() ?? this._dishCategoryService.selectedCategories();

		return resolveDishSectionCategories(
			selectedCategories,
			this._dishCategoryService.flatCategories(),
		);
	});

	protected readonly sections = computed(() =>
		toDishSections(
			this.categories(),
			this.dishes() ?? this._dishService.dishes(),
			this._dishCategoryService.flatCategories(),
		),
	);
}
