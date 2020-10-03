import '../js/options-storage';

browser.browserAction.onClicked.addListener(() => {
  browser.tabs.executeScript({
		file: '/browser-polyfill.min.js'
  });

	browser.tabs.executeScript({
		file: '/content-script.js'
  });
  
  browser.tabs.insertCSS({
    file: '/statsplus.css'
  })
});

browser.runtime.onMessage.addListener((request, sender) => {
  if (request.insertCSS) {
    browser.tabs.insertCSS(sender.tab.id, request.insertCSS);
  }
})
