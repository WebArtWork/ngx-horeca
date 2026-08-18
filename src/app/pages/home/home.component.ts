import { isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService, TranslateDirective, TranslateService } from '@wawjs/ngx-translate';

import { ArticleService } from '@wawjs/ngx-horeca';
import { companyProfile } from '../../feature/company/company.data';
import { DiscountService } from '@wawjs/ngx-horeca';
import { EventService } from '@wawjs/ngx-horeca';
import { JobService } from '@wawjs/ngx-horeca';
import { ProductService } from '@wawjs/ngx-horeca';
import { ProfileService } from '@wawjs/ngx-horeca';
import { QuestService } from '@wawjs/ngx-horeca';
import { ReviewService } from '@wawjs/ngx-horeca';
import { RoomService } from '@wawjs/ngx-horeca';

const HOME_TRANSLATION_PATH = '/data/home/i18n';

type FeaturePreview = {
	eyebrow: string;
	title: string;
	summary: string;
	meta?: string;
	itemRoute: string;
	allRoute: string;
	seeAllLabel: string;
	imageSrc?: string;
	imageAlt?: string;
};

@Component({
	imports: [NgOptimizedImage, RouterLink, TranslateDirective],
	templateUrl: './home.component.html',
	styleUrl: './home.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
	private readonly _languageService = inject(LanguageService);
	private readonly _translateService = inject(TranslateService);
	private readonly _articleService = inject(ArticleService);
	private readonly _discountService = inject(DiscountService);
	private readonly _eventService = inject(EventService);
	private readonly _jobService = inject(JobService);
	private readonly _productService = inject(ProductService);
	private readonly _profileService = inject(ProfileService);
	private readonly _questService = inject(QuestService);
	private readonly _reviewService = inject(ReviewService);
	private readonly _roomService = inject(RoomService);

	protected readonly company = companyProfile;
	protected readonly horecaHighlights = [
		'Ресторани, кафе, готелі, бари та кейтерингові команди можуть показати головне в одному місці.',
		'Гості можуть перейти від знайомства до дії через меню, контекст закладу, відгуки та контактні опції.',
		'Статичні SEO-дружні сторінки роблять ключову інформацію про бізнес легкою для перегляду на комп\'ютері й телефоні.',
	];
	protected readonly featurePreviews = computed(() => {
		const article = this._articleService.articles()[0];
		const discount = this._discountService.discounts()[0];
		const event = this._eventService.events()[0];
		const job = this._jobService.jobs()[0];
		const product = this._productService.products()[0];
		const profile = this._profileService.profiles()[0];
		const quest = this._questService.quests()[0];
		const review = this._reviewService.reviews()[0];
		const room = this._roomService.rooms()[0];
		const previews: Array<FeaturePreview | null> = [
			article
				? {
						eyebrow: 'Стаття',
						title: article.title,
						summary: article.summary,
						meta: article.category,
						itemRoute: `/article/${article.slug}`,
						allRoute: '/articles',
						seeAllLabel: 'Переглянути всі статті',
					}
				: null,
			room
				? {
						eyebrow: 'Номер',
						title: room.name,
						summary: room.description,
						meta: room.price,
						itemRoute: `/room/${room.slug}`,
						allRoute: '/rooms',
						seeAllLabel: 'Переглянути всі номери',
						imageSrc: room.image,
						imageAlt: room.imageAlt,
					}
				: null,
			discount
				? {
						eyebrow: 'Знижка',
						title: discount.title,
						summary: discount.summary,
						meta: discount.period,
						itemRoute: `/discount/${discount.slug}`,
						allRoute: '/discounts',
						seeAllLabel: 'Переглянути всі знижки',
					}
				: null,
			event
				? {
						eyebrow: 'Подія',
						title: event.title,
						summary: event.summary,
						meta: event.dateLabel,
						itemRoute: `/event/${event.slug}`,
						allRoute: '/events',
						seeAllLabel: 'Переглянути всі події',
					}
				: null,
			product
				? {
						eyebrow: 'Товар',
						title: product.title,
						summary: product.summary,
						meta: product.price,
						itemRoute: `/product/${product.slug}`,
						allRoute: '/products',
						seeAllLabel: 'Переглянути всі товари',
					}
				: null,
			review
				? {
						eyebrow: 'Відгук',
						title: review.title,
						summary: review.body,
						meta: review.author,
						itemRoute: `/review/${review.slug}`,
						allRoute: '/reviews',
						seeAllLabel: 'Переглянути всі відгуки',
					}
				: null,
			quest
				? {
						eyebrow: 'Квест',
						title: quest.title,
						summary: quest.summary,
						meta: quest.duration,
						itemRoute: `/quest/${quest.slug}`,
						allRoute: '/quests',
						seeAllLabel: 'Переглянути всі квести',
					}
				: null,
			job
				? {
						eyebrow: 'Вакансія',
						title: job.title,
						summary: job.summary,
						meta: job.location,
						itemRoute: `/job/${job.slug}`,
						allRoute: '/jobs',
						seeAllLabel: 'Переглянути всі вакансії',
					}
				: null,
			profile
				? {
						eyebrow: 'Профіль команди',
						title: profile.name,
						summary: profile.description,
						meta: profile.role,
						itemRoute: `/profile/${profile.slug}`,
						allRoute: '/team',
						seeAllLabel: 'Переглянути всю команду',
						imageSrc: profile.image,
						imageAlt: profile.name,
					}
				: null,
		];

		return previews.filter((preview): preview is FeaturePreview => preview !== null);
	});

	constructor() {
		effect(() => {
			if (!this._isBrowser) {
				return;
			}

			const language = this._languageService.language();

			void this._translateService.loadExtraTranslations([
				HOME_TRANSLATION_PATH,
				'/data/article/i18n',
				'/data/discount/i18n',
				'/data/event/i18n',
				'/data/job/i18n',
				'/data/product/i18n',
				'/data/profile/i18n',
				'/data/quest/i18n',
				'/data/review/i18n',
				'/data/room/i18n',
			], { language });
		});
	}
}
