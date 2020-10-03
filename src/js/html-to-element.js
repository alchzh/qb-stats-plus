/* global DOMPurify */

export default function htmlToElement(html) {
	return DOMPurify.sanitize(html, {RETURN_DOM_FRAGMENT: true, RETURN_DOM_IMPORT: true}).firstElementChild;
}
