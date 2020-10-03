import mutateContent from './mutate-content';
import {scrollToHashIn, populateScrollOffsets} from './scrolling';
import updateActive from './update-active';
import {HSQUIZBOWL_URL_REGEX} from './patterns';
import {LOCAL} from './mode';

export function mapLinks(links) {
	return new Map(
		Array.from(links)
			.map(a => {
				const u = new URL(a.href);
				u.hash = '';
				return [u.href, a.textContent.trim().replace(/ +/g, '-').toLowerCase()];
			})
	);
}

export function reportIDFromHREF(href) {
	return href?.match?.(HSQUIZBOWL_URL_REGEX)?.[2];
}

export function stripHash(href) {
	const url = new URL(href.href ?? href, document.baseURI);
	const hash = url.hash.trim();
	url.hash = '';
	return {url, hash};
}

export function getPageOfHREF(href) {
	return location.pageURLMap.get(stripHash(href).url?.href);
}

export const location = {
	get currentPageURL() {
		const u = new URL(window.location.href);
		u.hash = '';
		return u.href;
	},
	get currentHash() {
		return window.location.hash;
	},

	_pageURLMap: null,
	get pageURLMap() {
		return this._pageURLMap;
	},
	set pageURLMap(map) {
		this._pageURLMap = map;

		if (LOCAL) {
			browser.runtime.sendMessage({pageURLMap: Object.fromEntries(map)});
		}
	},
	_forcePage: null,
	get currentPage() {
		return this._forcePage ?? this.pageURLMap.get(this.currentPageURL);
	},

	reportMap: null,
	get currentReport() {
		const match = window.location.href.match(HSQUIZBOWL_URL_REGEX);
		return match ? `${match[2]}` : null;
	}
};

export const _pageCache = new Map();

export const safeFetch = LOCAL ?
	url => browser.runtime.sendMessage({fetch: url}) :
	url => window.fetch(url).then(response => response.text());

export async function navigate(to, pageURLMap, isReport) {
	let url;
	let hash;
	if (isReport) {
		if (!location.reportMap.has(to)) {
			return;
		}

		const match = window.location.href.match(HSQUIZBOWL_URL_REGEX);
		if (!match) {
			return;
		}

		url = new URL(`${match[1]}/stats/${to}/${match[3]}`);
		hash = window.location.hash;
	} else {
		({url, hash} = stripHash(to));
	}

	const mainContent = document.querySelector('#main-content');

	if (LOCAL && url.href === location.currentPageURL && !hash) {
		return;
	}

	if (LOCAL || (url.href === location.currentPageURL && hash && !pageURLMap)) {
		window.location.href = url.href + hash;
	} else if (isReport || (location.pageURLMap ?? pageURLMap).has(url.href)) {
		try {
			let newContent;
			if (!(newContent = _pageCache.get(url.href))) {
				const html = await safeFetch(url);
				const parser = new DOMParser();
				const doc = parser.parseFromString(html, 'text/html');

				newContent = await mutateContent(doc, false, url.href);
				_pageCache.set(url.href, newContent);
			}

			mainContent.replaceWith(newContent);

			hash = scrollToHashIn(hash, newContent);

			populateScrollOffsets(newContent);

			if (!pageURLMap) {
				try {
					window.history.pushState({page: url.href + hash, pageURLMap: location.pageURLMap}, null, url.href + hash);

					// eslint-disable-next-line require-atomic-updates
					location._forcePage = null;
				} catch {
					// eslint-disable-next-line require-atomic-updates
					location._forcePage = getPageOfHREF(url.href);
				}
			}
		} catch (error) {
			console.error(error);
			console.error(error.stack);
		}
	} else {
		window.location.href = url.href + hash;
	}

	updateActive();
}
