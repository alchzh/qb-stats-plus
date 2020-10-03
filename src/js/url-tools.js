export function splitURL(href) {
	const url = new URL(href.href ?? href, document.baseURI);
	const hash = url.hash.trim();
	url.hash = '';
	return {url, hash};
}

export function stripHash(href) {
	return splitURL(href).url.href;
}

export function getHash(href) {
	return splitURL(href).hash;
}

