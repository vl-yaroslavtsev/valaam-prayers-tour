/** Шаблон ServiceWorker для плагина webpack offline  */

// Добавляем обработку запросов с ошибкой по сети
self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);

	if (event.request.method != 'GET') return;

	//console.log('sw', url.origin, location.origin);
	//if (url.origin !== location.origin) return;

	// Android WebView выдает ошибку, если нет сети. Подменяем ее на 404
	if (/\.(?:png|gif|jpg|jpeg|webp)$/.test(url.pathname)) {
		return event.respondWith(
			fetchDef(event.request, {
				default: imgDefResponse()
			})
		);
	}

	// Серверные json из /phonegap/
	// Android WebView выдает ошибку, если нет сети. Подменяем ее на 503
	// console.log('sw', url.pathname);
	if (/\/rest-tour\//.test(url.pathname))  {
		return event.respondWith(
			fetchDef(event.request, {
				default: jsonDefResponse()
			})
		);
	}
});

/**
 * Обработка запроса request
 * Если возникает ошибка, отправляем ответ по умолчанию
 * @param {Request}             request
 * @param {object}              params Значения:
 * @param {Request}             [params.default] Запрос, возвращаемый при ошибке
 * @return {Promise}
 */
 function fetchDef(request, {default: defResponse}) {
	 	return fetch(request)
						.catch(ex => {
							return defResponse || Response.error();
						});
 }
// async function fetchDef(request, {default: defResponse}) {
// 	try {
// 		let response = await fetch(request);
// 		return response;
// 	} catch (err) {
// 		return defResponse || Response.error();
// 	}
// }

/**
 * Возвращаем Response c указанным json-объектом
 * @param {Object|Array} json
 * @return {Response}
 */
function imgDefResponse() {
	let blob = new Blob([], {type : 'image/png'});
	return new Response(blob, {
		"status": 404,
		"statusText": "Network Error"
	});
}

/**
 * Возвращаем Response c указанным json-объектом
 * @param {Object|Array} json
 * @return {Response}
 */
function jsonDefResponse() {
	let json = {error: 'network fail'};
	let status = 503;
	let blob = new Blob([JSON.stringify(json)], {type : 'application/json'});
	return new Response(blob, {
		"status": status,
		"statusText": "Network Error"
	});
}
