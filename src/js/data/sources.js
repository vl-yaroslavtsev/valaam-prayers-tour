import DataSource from './source.js';
import { API_URL } from '../config.js';
import { RITES_API_URL } from '../config.js';

export default [
	new DataSource({
		id: 'prayers',
		url: `${API_URL}prayers/?type=json`,
		store: 'collections',
		key: 'prayers',
		handler: 'cacheThenRevalidate',
	//	autoLoad: true,
	}),
	new DataSource({
		id: 'calendar',
		url: `${API_URL}days/calendar/?type=json`,
		store: 'collections',
		key: 'calendar',
		handler: 'cacheThenRevalidate',
	//	autoLoad: true
	}),
	new DataSource({
		id: 'ritesConfig',
		url: `${API_URL}rites-config.php?type=json`,
		handler: 'cacheThenNetwork'
	}),
	new DataSource({
		id: 'ritesTypes',
		url: `${RITES_API_URL}rites/types`,
		handler: 'cacheThenNetwork'
	}),
	new DataSource({
		id: 'ritesStatuses',
		url: `${RITES_API_URL}rites/statuses`,
		handler: 'cacheThenNetwork'
	}),
	new DataSource({
		id: 'ritesTypeRestrictions',
		url: `${RITES_API_URL}rites/typeRestrictions`,
		handler: 'cacheThenNetwork'
	}),
	new DataSource({
		id: 'valaamGid',
		url: `${RITES_API_URL}rites/valaamGid?referer1=valaam.tour`,
		handler: 'cacheThenNetwork'
	}),
	new DataSource({
		id: 'ritesHealthExplanations',
		url: `${RITES_API_URL}rites/explanations?type=health`,
		handler: 'cacheThenNetwork'
	}),
	new DataSource({
		id: 'ritesReposeExplanations',
		url: `${RITES_API_URL}rites/explanations?type=repose`,
		handler: 'cacheThenNetwork'
	}),
	new DataSource({
		id: 'ritesNames',
		url: `${RITES_API_URL}rites/names`,
		handler: 'cacheThenNetwork'
	}),
	new DataSource({
		id: 'prayer',
		url: (id) => `${API_URL}prayers/${id}`,
		store: 'prayers',
		key: (id) => id,
		handler: 'staleWhileRevalidate'
	}),
	new DataSource({
		id: 'saint',
		url: (id) => `${API_URL}saints/${id}`,
		store: 'saints',
		key: (id) => id,
		handler: 'staleWhileRevalidate'
	}),
	new DataSource({
		id: 'day',
		url: (code) => `${API_URL}days/${code}`,
		store: 'days',
		key: (code) => code,
		handler: 'staleWhileRevalidate'
	})
];
