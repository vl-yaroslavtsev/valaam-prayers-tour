import {
	format as dateFormat,
	parse as dateParse,
	startOfWeek as dateStartOfWeek,
	endOfWeek as dateEndOfWeek,
	isLeapYear,
	addDays,
	subDays,
	getUnixTime
} from 'date-fns';
import { ru } from 'date-fns/locale';

let monthNames;

const EASTER = {
	'2018': '0408',
	'2019': '0428',
	'2020': '0419',
	'2021': '0502',
	'2022': '0424',
	'2023': '0416',
	'2024': '0505',
	'2025': '0420',
	'2026': '0412',
	'2027': '0502',
	'2028': '0416',
	'2029': '0408',
	'2030': '0428',
};

/**
 * Возращаем дату Пасхи по году
 * @param {string} year 
 * @returns {Date}
 */
function getEaster(year) {
	return parse(year + EASTER[year]);
}

function parse(str, format = 'yyyyMMdd') {
	return dateParse(str, format, new Date());
}

function format(date, str = 'yyyyMMdd') {
	return dateFormat(date, str, {locale: ru});
}

function startOfWeek(date) {
	return dateStartOfWeek(date, {locale: ru});
}

function endOfWeek(date) {
	return dateEndOfWeek(date, {locale: ru});
}

function months() {
	if (monthNames)
		return monthNames;

	monthNames = [];
	for (let i = 0; i < 12; i++) {
  	monthNames.push( ru.localize.month(i) );
	}

	return monthNames;
}

function weekdaysMin() {
	let weekdays = [];
	for (let i = 0; i < 7; i++) {
  	weekdays.push( ru.localize.day(i, { width: 'short' }) );
	}

	return weekdays;
}

function unixNow() {
	return getUnixTime(new Date());
}

/**
	 * Рассчитываем переходящую дату на основании специальной строки (E+10, E-5, SU>0215, Y0213)
	 * @param {string} str Строка для рассчета
	 * @param {string} year Текущий год
	 * @return {Date} Рассчитанная дата
	 */
function parseRelative(str, year = "") {
	const weekdays = [
		"", 
		"MO", 
		"TU", 
		"WE", 
		"TH", 
		"FR", 
		"SA",
		"SU",
	];
	let date;

	if (!year) {
		year = format(new Date(), 'yyyy');
	}

	if (/^\d{4}$/.test(str)) {
		str = "Y" + str;
	}

	if (str.indexOf('Y') === 0) {
		str = str.replace('Y', year);

		date = parse(str);		
		if (isNaN(date)) {
			return new Date();
		}
		
		if (isLeapYear(date) && 
			date >= parse(year + '0301') && 
			date <= parse(year + '0313')) {
			date = subDays(date, 1);
		}

		return date;

	// Отсчет даты от Пасхи
	} else if (str.indexOf('E') === 0) {
		date = getEaster(year);
		const days = parseInt(str.slice(2));

		if (isNaN(days)) {
			return date;
		}

		if (str.indexOf('+') === 1) {
			date = addDays(date, days);
		} else if (str.indexOf('-') === 1) {
			date = subDays(date, days);
		}
		return date;

	// Ближайшее воскресение
	} else if (str.indexOf('SU~') === 0) {
		const days = str.slice(3);

		date = parse(year + days);
		if (isNaN(date)) {
			return new Date();
		}
		
		let weekday = Number(format(date, "i")); // MO - 1, TU - 2, ..., FR - 5, SA - 6, SU - 7
		
		if (weekday <= 3) {
			date = subDays(date, weekday);
		} else if (weekday > 3 && weekday < 7) {
			weekday = 7 - weekday;
			date = addDays(date, weekday);
		}
		return date;

	// День недели перед и после
	} else if (weekdays.includes(str.slice(0, 2))) {    
		const days = str.slice(3);
		
		if (days.indexOf('E') === 0) {
			date = parseRelative(days, year);

		} else if (isNaN(parse(year + days))) {
			return new Date();

		} else {
			date = parse(year + days);
		}

		const srcWeekday = str.slice(0, 2);
		const srcWeekdayNum = weekdays.indexOf(srcWeekday);

		if (srcWeekdayNum === -1) {
			return date;
		}
		const currWeekdayNum = Number(format(date, "i")); // MO - 1, TU - 2, ..., FR - 5, SA - 6, SU - 7

		// Дата после, включает указанный день недели
		if (str.indexOf('>') === 2) {
			let toAdd = srcWeekdayNum - currWeekdayNum;
			if (toAdd < 0 ) {
				toAdd = 7 + toAdd;
			}
			
			date = addDays(date, toAdd);
		// Дата перед, исключает указанный день недели
		} else if (str.indexOf('<') === 2) {
			let toSub = currWeekdayNum - srcWeekdayNum;
			if (toSub <= 0 ) {
				toSub = 7 + toSub;
			} 
			date = subDays(date, toSub);
		}

		return date;
	}

	return parse(str);
}

export {
	set,
	addDays,
	subDays,
	addYears,
	startOfYear,
	endOfYear,
	getUnixTime,
	isLeapYear
} from 'date-fns';

export {
	getEaster,
	parse,
	format,
	startOfWeek,
	endOfWeek,
	months,
	weekdaysMin,
	unixNow,
	parseRelative
};
