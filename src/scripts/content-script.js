import debounce from 'lodash.debounce';

import generateReportMap from '../js/generate-report-map';
import mutateContent from '../js/mutate-content';

import {MODE} from '../js/mode';
import {scrollToHashIn, populateScrollOffsets, updateHashOnScroll} from '../js/scrolling';
import {_pageCache, navigate, stripHash, location} from '../js/navigation';
import updateActive from '../js/update-active';

(async function () {
	if (window.__qbstatsplus) {
		return;
	}

	window.__qbstatsplus = true;

	browser.runtime.sendMessage({insertCSS: {file: 'statsplus.css', cssOrigin: 'author'}});

	if (MODE === 'hsquizbowl') {
		location.reportMap = await generateReportMap(document.querySelector('.SQBSHeader'));
	}

	const {url, hash} = stripHash(window.location.href);
	mutateContent(document, true, url.href)
		.then(mainContent => {
			if (hash) {
				window.location.hash = scrollToHashIn(hash, mainContent);
			}

			_pageCache.set(url, mainContent);
			updateActive();
			populateScrollOffsets(mainContent);

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
