import {Template7} from 'framework7';
import {format, parse, addDays, subDays} from './utils/date-utils.js';
import { BASE_URL } from './config.js';

let helpers = {format, parse, addDays, subDays};

Template7.registerHelper('date', function (date, options) {
  if (date.hash) {
		options = date;
		date = undefined;
	}

	let res = parse(date);

	Object
		.entries(options.hash)
		.forEach(([key, value]) => {
			res = helpers[key](res, value);
		});

  return res;
});

Template7.registerHelper('baseUrl', function () {
  return BASE_URL;
});

export default ['date', 'baseUrl'];
