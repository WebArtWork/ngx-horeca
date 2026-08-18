import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateDirective } from '@wawjs/ngx-translate';

@Component({
	imports: [RouterLink, TranslateDirective],
	templateUrl: './navigation.component.html',
	styleUrl: './navigation.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationComponent {
	protected readonly navItems = [
		{ label: 'Про нас', icon: 'info', route: '/about' },
		{ label: 'Товари', icon: 'shopping_bag', route: '/products' },

		{ label: "Меню дня", icon: 'today', route: '/daily' },
		{ label: 'Сезонні пропозиції', icon: 'local_florist', route: '/seasonal' },

		{ label: 'Питання', icon: 'help', route: '/questions' },
		{ label: 'Правила', icon: 'gavel', route: '/rules' },

		{ label: 'Номери', icon: 'hotel', route: '/rooms' },
		{ label: 'Знижки', icon: 'local_offer', route: '/discounts' },

		{ label: 'Команда', icon: 'group', route: '/team' },
		{ label: 'Вакансії', icon: 'work', route: '/jobs' },

		{ label: 'Статті', icon: 'article', route: '/articles' },
		{ label: 'Відгуки', icon: 'rate_review', route: '/reviews' },

		{ label: 'Події', icon: 'event', route: '/events' },
		{ label: 'Квести', icon: 'map', route: '/quests' },

		{ label: 'SPA', icon: 'SPA', route: '/spa' },
		{ label: 'Лояльність', icon: 'workspace_premium', route: '/loyalty' },

		{ label: 'З собою', icon: 'takeout_dining', route: '/takeaway' },
		{ label: 'Кейтеринг', icon: 'room_service', route: '/catering' },
	];
}
