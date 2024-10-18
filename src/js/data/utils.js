import dataManager from './manager.js';

/**
 * Проверяем, принадлежит указанная молитва к разделу (одному или нескольким)
 * @param  {string} prayerId Id разделов
 * @param  {Array.<string>} parents  Id разделов
 * @return {boolean}
 */
function isPrayerInSection(prayerId, parents) {
	const prayers = dataManager.cache.prayers.e;
	if (!Array.isArray(parents))
		parents = [parents];

	const prayer = prayers.find(({id}) => id === prayerId);
	if (!prayer)
		return false;

	if (prayer.parents) {
		return prayer.parents.some((parent) => !!getSectionDepth(parent, parents, 1));
	}

	return !!getSectionDepth(prayer.parent, parents, 1);
}

/**
 * Получаем глубину молитвы в разделе/ах
 * @param  {string} prayerId Id молитвы
 * @param  {Array.<string>} parents  Id разделов
 * @return {number}
 */
function getPrayerSectionDepth(prayerId, parents) {
	const prayers = dataManager.cache.prayers.e;
	if (!Array.isArray(parents))
		parents = [parents];

	const prayer = prayers.find(({id}) => id === prayerId);
	if (!prayer)
		return 0;
	
	return getSectionDepth(prayer.parent, parents, 1);
}

/**
 * Получаем глубину раздела в разделе
 * @param  {string} prayerId Id разделов
 * @param  {Array.<string>} parents  Id разделов
 * @return {number} depth
 */
function getSectionDepth(sectionId, parents, depth = 1) {
	if (parents.includes(sectionId)) {
		return depth;
	}

	const sections = dataManager.cache.prayers.s;
	const section = sections.find(({id}) => id === sectionId);

	if (!section) {
		return 0;
	}

	if (section.parent === "0") {
		return 0;
	}

	return getSectionDepth(section.parent, parents, ++depth);
}

/**
 * Если элемент или раздел находится в книге, возвращаем его ID, если нет  - false
 * @param  {string} prayerId Id элемента
 * @param  {string} sectionId Id раздела
 * @return {string || boolean}
 */
function getPrayersBookId({prayerId, sectionId}) {
	let currSectionId = sectionId;
	if (prayerId) {
		const prayers = dataManager.cache.prayers.e;
		const prayer = prayers.find(({id}) => id === prayerId);
		if (!prayer) {
			return false;
		}
		currSectionId = prayer.parent;
	}

	const sections = dataManager.cache.prayers.s;
	while (true) {
		const section = sections.find(({id}) => id === currSectionId);

		if (!section) {
			return false;
		}

		if (section.book_root) {
			return section.id;
		}

		if (section.parent === "0") {
			return false;
		}

		currSectionId = section.parent;
	}
}

/**
 * Возвращаем массив из пути до элемента от корня книги
 * @param  {string} prayerId Id разделов
 * @return {Array.<PrayerSection>}
 */
function getPrayersPath(prayerId) {
	let prayers = dataManager.cache.prayers.e;
	let sections = dataManager.cache.prayers.s;
	let prayer = prayers.find(({id}) => id === prayerId);
	let path = [];
	if (!prayer) {
		return path;
	}

	let sectionId = prayer.parent;
	while (true) {
		const section = sections.find(({id}) => id === sectionId);

		if (!section) {
			return path;
		}

		path.unshift(section.name);

		if (section.book_root || section.parent === "0") {
			return path;
		}

		sectionId = section.parent;
	}
}

export {isPrayerInSection, getPrayerSectionDepth, getPrayersBookId, getPrayersPath}
