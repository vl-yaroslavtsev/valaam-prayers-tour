/**
 * Конфигурация приложения
 */

// В dev режиме webpack-dev-server проксирует запросы, используем относительные пути
const isDev = process.env.NODE_ENV === 'development';

export const BASE_URL = isDev ? '' : 'https://app.valaam.ru';
export const API_URL = isDev ? '/rest-tour/' : `${BASE_URL}/rest-tour/`;
export const RITES_API_URL = isDev ? '/api/' : 'https://valaam.ru/api/';
export const IMG_URL = isDev ? '' : 'https://valaam.ru';

