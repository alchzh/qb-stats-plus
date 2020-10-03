import '../js/options-storage';
import {stripHash} from '../js/url-tools';

const pageURLMaps = new Map();

function loadIntoTab(id) {
	browser.tabs.executeScript(id, {
		file: '/browser-polyfill.min.js'
	});

	browser.tabs.executeScript(id, {
		file: '/content-script.js'
	});
}

function onUpdated(tabId, changeInfo) {
	if (changeInfo.url) {
		const newURL = stripHash(changeInfo.url);
		if (pageURLMaps?.get(tabId)?.has(newURL)) {
			browser.tabs.executeScript(tabId, {
				file: '/browser-polyfill.min.js'
			});

			browser.tabs.executeScript(tabId, {
				file: '/content-script.js'
			});
		}
	}
}

browser.tabs.onUpdated.addListener(onUpdated);

browser.browserAction.onClicked.addListener(tab => loadIntoTab(tab.id));

browser.runtime.onMessage.addListener((request, sender) => {
	if (request.insertCSS) {
		browser.tabs.insertCSS(sender.tab.id, request.insertCSS);
	}

	if (request.executeScript) {
		browser.tabs.executeScript(sender.tab.id, request.executeScript);
	}

	if (request.pageURLMap) {
		pageURLMaps.set(sender.tab.id, new Map(Object.entries(request.pageURLMap)));
	}

	if (request.fetch) {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.addEventListener('load', () => {
				resolve(xhr.responseText);
			});

			xhr.addEventListener('error', () => {
				reject(new TypeError('Local request failed'));
			});

			xhr.open('GET', request.fetch);
			xhr.send(null);
		});
	}
});
