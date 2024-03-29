import debounce from 'javascript-debounce';

import generateReportMap from '../js/generate-report-map';
import mutateContent from '../js/mutate-content';

import {MODE} from '../js/mode';
import {scrollToHashIn, populateScrollOffsets, updateHashOnScroll} from '../js/scrolling';
import {_pageCache, navigate, location} from '../js/navigation';
import updateActive from '../js/update-active';
import {splitURL} from '../js/url-tools';

(async function () {
	if (window.__qbstatsplus) {
		return;
	}

	window.__qbstatsplus = true;

	browser.runtime.sendMessage({executeScript: {file: 'purify.min.js'}});
	browser.runtime.sendMessage({insertCSS: {file: 'statsplus.css', cssOrigin: 'author'}});

	if (MODE === 'hsquizbowl') {
		location.reportMap = await generateReportMap(document.querySelector('.SQBSHeader'));
	}

	const {url, hash} = splitURL(window.location.href);
	mutateContent(document, true, url.href)
		.then(mainContent => {
			if (hash) {
				window.location.hash = scrollToHashIn(hash, mainContent);
			}

			_pageCache.set(url.href, mainContent);
			updateActive();
			populateScrollOffsets(mainContent);

			window.history.replaceState({page: url.href + hash, pageURLMap: location.pageURLMap}, '', url.href + hash);

			window.addEventListener('scroll', debounce(updateHashOnScroll, 1000));

			window.onpopstate = event => {
				if (event.state) {
					navigate(event.state.page, event.state.pageURLMap);
				}
			};
		})
		.catch(error => {
			console.error(error);
			console.error(error.stack);
		});
})();
