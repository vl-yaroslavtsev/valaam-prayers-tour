/**
 * Обработка главный view приложения
 */
import {Dom7 as $$} from 'framework7';
import { isMobile, animate } from './utils/utils.js';

let app;
const viewsIds = [
	'#view-valaam',
	'#view-prayers',
	'#view-calendar',
	'#view-rites'
];

function init(appInstance) {
	app = appInstance;
	initViewTabs();
}

/**
 * Разбираем хэш.
 * Если он в виде #view-valaam:/url , грузим url во #view-valaam
 */
function parseHash() {
	let [viewId = '#view-prayers', url] = document.location.hash.split(':');

	if (!viewsIds.includes(viewId)) return;

	app.tab.show(viewId);

	let view = app.views.get(viewId);

	//console.log('parseHash', view);
	// if (!view) {
		// view = createView(viewId);
	// }

	if (url) {
		view.router.navigate(url);
		document.location.hash = viewId;
	}
}

/**
 * Инициализируем табы - представления
 */
function initViewTabs() {
	location.hash = location.hash || '#view-prayers';

	app.root.find('.views.tabs').on('tab:show', (event) => {
		let id = event.target.id;
		if (!id || !id.startsWith('view-'))
		 	return;

		if (!location.hash.startsWith('#' + id)) {
			location.hash = '#' + id;
		}

		createView('#' + id);
	});

	// app.on('pageBeforeIn', (page) => updateStatusbar(page.$el));
	// app.on('pageTabShow', (page) => updateStatusbar($$(page)));

	app.root.on('mouseup', 'a[data-view-tab]', function(event) {
		let $target = $$(this);
		app.tab.show($target.data('view'));
	});

	//app.tab.show(location.hash.split(':')[0]);

	parseHash();
	$$(window).on('hashchange', parseHash);

	app.on('pageInit', (page) => {
		handleScrollbar(page.$el);
	});
}

/**
 * Показываем/скрываем скроллбар
 * @param  {Dom7} $page страница
 */
function handleScrollbar($page) {
	let timer, lastScroll, cancel;
	if ($page.hasClass('read-mode')) {
		return;
	}
	const $content = $page.find('.page-content');
	const scrollbarShownAlpha = getComputedStyle($page[0]).getPropertyValue('--scrollbar-thumb-shown-alpha');
	$content.on('scroll', () => {
		lastScroll = performance.now();

		if (timer) {
			return;
		}

		if (cancel) {
			cancel();
		}

		const style = $page[0].style;
		style.setProperty('--scrollbar-thumb-alpha', scrollbarShownAlpha);

		timer = setTimeout( function hide() {
			const diff = Math.round(performance.now() - lastScroll);
			if (diff < 800) {
				 timer = setTimeout( hide, 800 - diff);
				 return;
			}

			cancel = animate({
				draw(progress) {
					const val = parseFloat(scrollbarShownAlpha) * (1 - progress);
					style.setProperty('--scrollbar-thumb-alpha', `${val.toFixed(3)}`);
				},
				duration: 800,
				end() {
					cancel = null;
				}
			});

			timer = null;
		}, 800);
	});
}

/**
 * Создаем вью по запросу
 * @param  {string} id айдишник
 */
function createView(id) {
	let view;
	if (!viewsIds.includes(id)) return;

	if (id == '#view-calendar') {
		app.methods.storageSet('calendar-date');
		app.emit('calendarClearDate');
	}

	if (view = app.views.get(id)) {
		app.emit('viewShown', view);
		return;
	}

	switch (id) {
		case '#view-valaam':
			view = app.views.create('#view-valaam', {
				name: 'Валаамский монастырь',
				url: '/prayers/1736'
			});
			break;

		case '#view-prayers':
			view = app.views.create('#view-prayers', {
				name: 'Полный молитвослов',
				url: '/prayers/842'
			});
			break;

		case '#view-calendar':
			view = app.views.create('#view-calendar', {
				name: 'Календарь',
				url: '/calendar'
			});
			break;

		case '#view-rites':
			view = app.views.create('#view-rites', {
				name: 'Поминовения',
				url: '/rites'
			});
			break;

		default:
			break;
	}

	app.emit('viewShown', view);
	return view;
}

/**
 * Обновляем статусбар страницы (темный или светлый)
 * @param  {Dom7} $page
 */
function updateStatusbar($page) {
	let isWhite = $page.hasClass('page-white') ||
							  $page.hasClass('smart-select-page');
	let isDarkMode = $$('html').hasClass('theme-dark');
	if (isWhite && !isDarkMode) {
		//app.phonegap.statusbar.styleDefault();
	} else {
		//app.phonegap.statusbar.styleLightContent();
	}
}

export default {init};
