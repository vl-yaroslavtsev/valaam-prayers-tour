/**
 * Миграция из valaam-phonegap в phonegap
 * @module data/db
 */
import { openDB, deleteDB, wrap, unwrap } from 'idb';
import { jsonSize } from '../utils/utils.js';
import {
	format,
	startOfYear,
	endOfYear,
	parse,
} from '../utils/date-utils.js';
import getDownloadItems from '../download/items.js';

import db from './db.js';

let oldIdb;
let prayerSections = [];
let dowloadItems = [];
let oldDbReloadTs;

const OLD_DB_NAME = 'valaam-phonegap';

const PRAYERS_ROOT_SECTION = {
  spiritual_books: 976,  // Духованя литература,
  liturgical_books: 937,  // Богослужебные книги,
  prayers: 842,  // Полный молитвослов
  valaam: 1736, // Валаам
};

const PRAYERS_ROOT_SECTION_LIST = Object.values(PRAYERS_ROOT_SECTION);

const START_OF_YEAR = format(startOfYear(new Date));
const END_OF_YEAR = format(endOfYear(new Date));

let dataSize = {
  calendarColl: 0,
  prayersColl: 0,
  calendar: 0,
  saints: 0,
  prayers: 0,
  liturgical_books: 0,
  spiritual_books: 0
};


async function migrate(progessCb = () => {}) {
  await db.open();
  let state = (await db.state.get('db-migrate')) || {id: 'db-migrate'};
  if (state.done || state.error) {
    return;
  }

	try {
		oldIdb = await openDB(OLD_DB_NAME);
	  if (oldIdb.objectStoreNames.length === 0) {
			return;
		}
		progessCb(0);

	  dowloadItems = getDownloadItems();

	  let calendarColl = await oldIdb.get('collections', 'calendar');
	  if (calendarColl) {
	    await db.collections.put(calendarColl, 'calendar');
	    countSize(calendarColl, 'collections', 'calendar');
	    console.log(`[db-migrate] copy collections: calendar saved, size: ${dataSize.calendarColl}`);
	  }
	  progessCb(1);

	  let prayersColl = await oldIdb.get('collections', 'prayers');
	  if (prayersColl) {
	    await db.collections.put(prayersColl, 'prayers');
	    prayerSections = prayersColl.s;
	    countSize(prayersColl, 'collections', 'prayers');
	    console.log(`[db-migrate] copy collections: prayers saved, size: ${dataSize.prayersColl}`);
	  } else {
	    prayersColl = await db.collections.get('prayers');
	    prayerSections = prayersColl.s;
	  }
	  await oldIdb.clear('collections');

	  oldDbReloadTs = await oldIdb.get('stat', 'last_reload_full_ts');
	  progessCb(2);

	  await copyAll('days', 'days', (progress) => {
	    progessCb(2 + progress * 0.13)
	  });

	  await copyAll('saints', 'saints', (progress) => {
	    progessCb(15 + progress * 0.25);
	  });

	  await copyAll('prayers', 'prayers', (progress) => {
	    progessCb(40 + progress * 0.6);
	  });

		state.done = true;
		state.date = new Date;
		await db.state.put(state);

	} catch (error) {

		state.error = error;
		state.date = new Date;
		await db.state.put(state);

		throw error;
	} finally {
		if (oldIdb) {
			oldIdb.close();
		}
		deleteDB(OLD_DB_NAME);
	}
}

/**
 * Копируем все элементы из хранилища storeFrom в хранилище storeTo
 * @param {string} storeFrom
 * @param {string} storeTo
 * @param {Function} [progressCb] коллбэк с прогрессом
 * @return {Promise}
 */
async function copyAll(storeFrom, storeTo, progressCb = () => {}) {
  let pool = [];
  let transactions = [];
  let progress = 0;
  let total = await oldIdb.count(storeFrom);

  if (!total) {
    progressCb(100);
    return;
  }

  let cursor = await oldIdb.transaction(storeFrom).store.openCursor();
  let cnt = 0;

  progressCb(progress);

  while (cursor) {
    let value = cursor.value;

    if (storeTo === 'prayers') {
      value.root_id = prayersRoot(value);
    }

    countSize(value, storeTo);
    pool.push(value);
    cnt++;

    let poolLength = pool.length;
    if (poolLength >= 100) {
      transactions.push(
        db[storeTo].putAll(pool).then(() => {
          progress += (poolLength / total) * 100;
          progressCb(progress);
        })
      );
      pool = [];
    }
    cursor = await cursor.continue();
  }
  let poolLength = pool.length;
  transactions.push(
    db[storeTo].putAll(pool).then(() => {
      progress += (poolLength / total) * 100;
      progressCb(progress);
    })
  );
  await Promise.all(transactions);
  await oldIdb.clear(storeFrom);

  switch (storeFrom) {
    case 'days':
      await updateDowloadItem('calendar');
      break;

    case 'saints':
      await updateDowloadItem('saints');
      break;

    case 'prayers':
      await updateDowloadItem('prayers');
      await updateDowloadItem('liturgical_books');
      await updateDowloadItem('spiritual_books');
      break;
  }

  console.log(`[db-migrate] copy ${storeFrom}: ${cnt} saved`);
}

/**
 * Расчет размера json элемента value и сохранение его в dataSize
 * @param  {Object} value json value
 * @param  {string} store  название хранилища, в которое будет сохранен value
 * @param  {string} [key]  Необязательно. Ключ в хранилище
 */
function countSize(value, store, key) {
  if (store === 'prayers') {
    switch (value.root_id) {
      case PRAYERS_ROOT_SECTION.spiritual_books:
        updateSize(value, 'spiritual_books');
        break;
      case PRAYERS_ROOT_SECTION.liturgical_books:
        updateSize(value, 'liturgical_books');
        break;
      case PRAYERS_ROOT_SECTION.prayers:
      case PRAYERS_ROOT_SECTION.valaam:
        updateSize(value, 'prayers');
        break;
    }

  } else if (
    store === 'days' &&
    value.code >= START_OF_YEAR &&
    value.code <= END_OF_YEAR
  ) {
    updateSize(value, 'calendar');

  } else if (store === 'saints') {
    updateSize(value, 'saints');

  } else if (store === 'collections') {
    updateSize(value, key + 'Coll')
  }

  function updateSize(value, key) {
    dataSize[key] += jsonSize(value);
  }
}

/**
 * Обновляем статистику скачанных элементов
 * @param {string} id
 * @return {Promise}
 */
async function updateDowloadItem(id) {
  if (!oldDbReloadTs) return;

  let item = dowloadItems.find(({id: itemId}) => itemId === id);
  if (!item) return;
  let size = 0;

  switch (id) {
    case 'calendar':
      if (!dataSize.calendar) {
        return;
      }
      size = dataSize.calendarColl + dataSize.prayersColl + dataSize.calendar;
      break;

    case 'saints':
      if (!dataSize.saints) {
        return;
      }
      size = dataSize.prayersColl + dataSize.saints;
      break;

    case 'prayers':
      if (!dataSize.prayers) {
        return;
      }
      size = dataSize.prayersColl + dataSize.prayers;
      break;

    case 'liturgical_books':
      if (!dataSize.liturgical_books) {
        return;
      }
      size = dataSize.prayersColl + dataSize.liturgical_books;
      break;

    case 'spiritual_books':
      if (!dataSize.spiritual_books) {
        return;
      }
      size = dataSize.prayersColl + dataSize.spiritual_books;
      break;
  }

  await item.statePromise;
  await item.setState({
    status: 'fresh',
    loadedSize: size,
    loadedDate: new Date(oldDbReloadTs * 1000)
  });
}

/**
 * Получаем root section для prayers
 * @param  {Object} prayer элемент молитвослова
 * @return {number}
 */
function prayersRoot({ parent }) {
	let sectionId = parent * 1;

  if (PRAYERS_ROOT_SECTION_LIST.includes(sectionId)) {
    return sectionId;
  }

	while (true) {
		let section = prayerSections.find(({id}) => id * 1 === sectionId);

    if (!section || section.parent === "0") {
			return sectionId;
		}

    sectionId = section.parent * 1;

    if (PRAYERS_ROOT_SECTION_LIST.includes(sectionId)) {
      return sectionId;
    }
	}
}

export {migrate};
