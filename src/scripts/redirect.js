import {HSQUIZBOWL_URL_REGEX} from '../js/patterns';

const match = window.location.href.match(HSQUIZBOWL_URL_REGEX);
if (match) {
	if (match[3].length <= 1) {
		window.location.replace(`${match[1]}/stats/${match[2]}/standings/${match[4] ?? ''}`);
	}
}
