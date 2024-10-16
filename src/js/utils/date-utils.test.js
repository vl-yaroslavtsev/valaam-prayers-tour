import {
	format,
	parse,
	parseRelative,
	getEaster
} from './date-utils.js';


describe('getEaster', () => {
	test('Пасха в 2023 году равна 2023-04-16', () => {
	  	expect(getEaster('2023')).toEqual(new Date('2023-04-16 00:00:00'));
	});
  
	test('Пасха в 2024 году равна 2024-05-05', () => {
		expect(getEaster('2024')).toEqual(new Date('2024-05-05 00:00:00'));
	});
});


describe('format() по умолчанию', () => {
	test('для 2023-02-20 отдает 20230220', () => {
	  	expect(format(new Date('2023-02-20 00:00:00'))).toBe('20230220');
	});
  
	test('для 2024-05-15 отдаёт 20240515', () => {
		expect(format(new Date('2024-05-15 00:00:00'))).toBe('20240515');
	});
});

describe('parse() по умолчанию', () => {
	test('для 20230220 отдаёт 2023-02-20', () => {
	  	expect(parse('20230220')).toEqual(new Date('2023-02-20 00:00:00'));
	});
  
	test('для 20240515 отдаёт 2024-05-15', () => {
		expect(parse('20240515')).toEqual(new Date('2024-05-15 00:00:00'));
	});
});

describe('parseRelative', () => {
	test('Y0212 в текущем году будет 02-12', () => {
		expect(parseRelative("Y0212")).toEqual(new Date(new Date().getFullYear() + '-02-12 00:00:00'));
	});

	test('Y0212 в 2023 году будет 2023-02-12', () => {
		expect(parseRelative("Y0212", "2023")).toEqual(new Date('2023-02-12 00:00:00'));
	});

	test('Y0302 в 2024 году (високосный) будет 2024-03-01', () => {
		expect(parseRelative('Y0302', '2024')).toEqual(new Date('2024-03-01 00:00:00'));
	});

	test('Y0302 в 2023 году будет 2023-03-02', () => {
		expect(parseRelative("Y0302", '2023')).toEqual(new Date('2023-03-02 00:00:00'));
	});
	
	test('E-63 - Неделя о блудном сыне в 2024 году будет 2024-03-03', () => {
		expect( parseRelative("E-63", "2024")).toEqual(new Date('2024-03-03 00:00:00'));
	});
	
	test('E-8 - Вокрешение лазаря в 2024 году будет 2024-04-27', () => {
		expect(parseRelative("E-8", "2024")).toEqual(new Date('2024-04-27 00:00:00'));
	});

	test('E-7 - Вход Господень в Иерусалим - в 2024 году будет 2024-04-28', () => {
		expect(parseRelative("E-7", "2024")).toEqual(new Date('2024-04-28 00:00:00'));
	});

	test('E - Пасха - в 2024 году будет 2024-05-05', () => {
		expect(parseRelative("E", "2024")).toEqual(new Date('2024-05-05 00:00:00'));
	});

	test('E+7 - Антипасха - в 2024 году будет 2024-05-12', () => {
		expect(parseRelative("E+7", "2024")).toEqual(new Date('2024-05-12 00:00:00'));
	});

	test('E+49 - Пятидесятница - в 2024 году будет 2024-06-23', () => {
		expect(parseRelative("E+49", "2024")).toEqual(new Date('2024-06-23 00:00:00'));
	});

	test('E+50 - День Святого Духа - в 2024 году будет 2024-06-24', () => {
		expect(parseRelative("E+50", "2024")).toEqual(new Date('2024-06-24 00:00:00'));
	});

	test('E+63 - Неделя 2-я по Пятидесятнице - в 2024 году будет 2024-07-07', () => {
		expect(parseRelative("E+63", "2024")).toEqual(new Date('2024-07-07 00:00:00'));
	});

	test('SU>0701 - Воскресение после 1-го июля - в 2024 году будет 2024-07-07', () => {
		expect(parseRelative("SU>0701", "2024")).toEqual(new Date('2024-07-07 00:00:00'));
	});

	test('SU>0712 - Воскресение после 12-го июля - в 2024 году будет 2024-07-14', () => {
		expect(parseRelative("SU>0712", "2024")).toEqual(new Date('2024-07-14 00:00:00'));
	});

	test('SU<0908 - Воскресение перед 8 сентября - в 2024 году будет 2024-09-01', () => {
		expect(parseRelative("SU<0908", "2024")).toEqual(new Date('2024-09-01 00:00:00'));
	});

	test('SU>0908 - Воскресение после 8 сентября - в 2024 году равно 8 сентября 2024-09-08', () => {
		expect(parseRelative("SU>0908", "2024")).toEqual(new Date('2024-09-08 00:00:00'));
	});

	test('SU~0912 - Воскресение ближайшее к 12 сентября - в 2024 году будет 2024-09-15', () => {
		expect(parseRelative("SU~0912", "2024")).toEqual(new Date('2024-09-15 00:00:00'));
	});

	test('SA>1121 - Суббота после 21 ноября - в 2024 году будет 2024-11-23', () => {
		expect(parseRelative("SA>1121", "2024")).toEqual(new Date('2024-11-23 00:00:00'));
	});
});