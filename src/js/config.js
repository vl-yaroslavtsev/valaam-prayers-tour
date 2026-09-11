/**
 * Конфигурация приложения
 */

// В dev режиме webpack-dev-server проксирует запросы, используем относительные пути
export const IS_DEV = process.env.NODE_ENV === 'development';

export const BASE_URL = IS_DEV ? '' : 'https://app.valaam.ru';
export const API_URL = IS_DEV ? '/rest-tour/' : `${BASE_URL}/rest-tour/`;
export const RITES_API_URL = IS_DEV ? '/api/' : 'https://valaam.ru/api/';
export const IMG_URL = IS_DEV ? '' : 'https://valaam.ru';

