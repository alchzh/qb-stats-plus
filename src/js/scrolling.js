import {stripHash} from './url-tools';

export function scrollToHashIn(hash, element) {
	if (hash.length > 1) {
		const h = hash.slice(1);
		const _scrollTo = element.querySelector(`[id=${h}], [name=${h}]`);
		if (_scrollTo) {
			_scrollTo.scrollIntoView();
		} else {
			hash = '';
			window.scrollTo(0, 0);
		}
	} else {
		hash = '';
		window.scrollTo(0, 0);
	}

	return hash;
}

function getCoords(element) {
	const box = element.getBoundingClientRect();

	const body = document.body;
	const docElement = document.documentElement;

	const scrollTop = window.pageYOffset || docElement.scrollTop || body.scrollTop;
	const scrollLeft = window.pageXOffset || docElement.scrollLeft || body.scrollLeft;

	const clientTop = docElement.clientTop || body.clientTop || 0;
	const clientLeft = docElement.clientLeft || body.clientLeft || 0;

	const top = box.top + scrollTop - clientTop;
	const left = box.left + scrollLeft - clientLeft;

	return {top: Math.floor(top), left: Math.floor(left)};
}

let offsetCache = null;

export function populateScrollOffsets(element) {
	const _offsetCache = [];

	element.querySelectorAll('[id]').forEach(element => {
		_offsetCache.push([getCoords(element).top, element.id]);
	});

	element.querySelectorAll('[name]').forEach(element => {
		_offsetCache.push([getCoords(element).top, element.name]);
	});

	offsetCache = _offsetCache.sort((a, b) => a[0] - b[0]);
}

export function updateHashOnScroll() {
	const boundary = window.pageYOffset + (0.3 * document.documentElement.clientHeight);

	let last;
	for (const entry of offsetCache) {
		if (entry[0] > boundary) {
			break;
		}

		last = entry;

		if (entry[0] === window.pageYOffset) {
			break;
		}
	}

	if (last && last[0] > window.pageYOffset - (0.5 * document.documentElement.clientHeight)) {
		history.replaceState(history.state, null, stripHash(window.location.href) + '#' + last[1]);
	}
}
