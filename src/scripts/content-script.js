import generateReportMap from '../js/generate-report-map';
import mutateContent from '../js/mutate-content';

import MODE from '../js/mode'
import scrollToIn from '../js/scroll-to-in';
import { _pageCache, navigate, stripHash, location } from '../js/navigation';
import updateActive from '../js/update-active';

browser.runtime.sendMessage({insertCSS: {file: "statsplus.css", cssOrigin: "author"}})

(async function contentScript () {
  if (MODE === 'hsquizbowl') {  
    location.reportMap = await generateReportMap(document.querySelector('.SQBSHeader'))
  }

  const { url, hash } = stripHash(window.location.href)
  mutateContent(document, true, url.href)
    .then(mainContent => {
      if (hash) {
        window.location.hash = scrollToIn(hash, mainContent)
      }
      _pageCache.set(url, mainContent);
      updateActive();
      window.onpopstate = event => { if (event.state) { navigate(event.state.page, event.state.pageURLMap) } };
    })
    .catch(e => {
      console.error(e);
      console.error(e.stack)
    })
})()