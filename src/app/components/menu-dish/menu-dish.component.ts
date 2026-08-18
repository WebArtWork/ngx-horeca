import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DishCard } from '@wawjs/ngx-horeca';
import { DishService } from '@wawjs/ngx-horeca';
import { ImageComponent } from '../image/image.component';
import { TranslateDirective } from '@wawjs/ngx-translate';
import { companyProfile } from '../../feature/company/company.data';

@Component({
	selector: 'app-menu-dish',
	imports: [ImageComponent, TranslateDirective],
	templateUrl: './menu-dish.component.html',
	styleUrl: './menu-dish.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuDishComponent {
	readonly dishService = inject(DishService);

	readonly dish = input.required<DishCard>();
	protected readonly currency = companyProfile.currency;
	protected readonly isFavorite = computed(() =>
		this.dishService.favoriteDishes().includes(this.dish().slug),
	);
}
