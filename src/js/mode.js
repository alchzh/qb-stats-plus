import {HSQUIZBOWL_URL_REGEX} from './patterns';

export const MODE = HSQUIZBOWL_URL_REGEX.test(window.location.href) ?
	'hsquizbowl' :
	'raw';

export const LOCAL = new URL(window.location.href).protocol.toLowerCase() === 'file:';
