export const MODE = document.querySelector('.Container > .OverallBody > .MainHeader') ?
	'hsquizbowl' :
	'raw';

export const LOCAL = new URL(window.location.href).protocol.toLowerCase() === 'file:';
