/**
 * Конфигурация приложения
 */

// В dev режиме webpack-dev-server проксирует запросы, используем относительные пути
const isDev = process.env.NODE_ENV === 'development';

export const BASE_URL = isDev ? '' : 'https://new.molitvoslov.valaam.ru';
export const API_URL = isDev ? '/rest-tour/' : `${BASE_URL}/rest-tour/`;
export const RITES_API_URL = isDev ? '/api/' : 'https://new.valaam.ru/api/';
export const IMG_URL = isDev ? '' : 'https://new.valaam.ru';

