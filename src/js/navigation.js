import mutateContent from "./mutate-content";
import scrollToIn from "./scroll-to-in";
import updateActive from "./update-active";
import { HSQUIZBOWL_URL_REGEX } from "./patterns";
import dumbFetch from "./dumb-fetch";

export function mapLinks (links) {
  return new Map(
    Array.from(links)
      .map(a => {
        const u = new URL(a.href);
        a.hash = "";
        return [a.href, a.textContent.trim().replace(/ +/g, '-').toLowerCase()]
      })
  )
}

export function reportIDFromHREF (href) {
  return href?.match?.(HSQUIZBOWL_URL_REGEX)?.[2];
}

export function mapReports (reports) {
  return new Set(
    Array.from(reports)
      .map(a => reportIDFromHREF(a.href))
  )
}


export function stripHash(href) {
  const url = new URL(href.href ?? href, document.baseURI);
  const hash = url.hash.trim();
  url.hash = "";
  return { url, hash };
}

export const location = {
  get currentPageURL () {
    const u = new URL(window.location.href);
    u.hash = "";
    return u.href;
  },
  get currentHash () {
    return window.location.hash;
  },

  pageURLMap: null,
  get currentPage() {
    return pageURLMap.get(this.currentPageURL)
  },

  reportURLMap: null,
  get currentReport() {
    const match = window.location.href.match(HSQUIZBOWL_URL_REGEX);
    return match ? `${match[2]}` : null;
  }
}

export const _pageCache = new Map();

export default fetch = new URL(window.location.href).protocol.toLowerCase() === "file:"
  ? dumbFetch
  : window.fetch;

export async function navigate(to, pageURLMap, isReport) {
  let url, hash;
  if (isReport) {
    if (!location.reportURLMap.has(to)) return;

    const match = window.location.href.match(HSQUIZBOWL_URL_REGEX);
    if (!match) return

    url = new URL(`${match[1]}/stats/${to}/${match[3]}`);
    hash = window.location.hash;
  } else {
    ({ url, hash } = stripHash(to));
  }

  const mainContent = document.getElementById("main-content")

  if (url.href === location.currentPageURL && hash && !pageURLMap) {
    window.location.href = url.href + hash;
  } else if (isReport || (location.pageURLMap ?? pageURLMap).has(url.href)) {
    try {
      let newContent;
      if (!(newContent = _pageCache.get(url.href))) {
        const html = await (await fetch(url)).text()
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        newContent = await mutateContent(doc, false, url.href);
        _pageCache.set(url.href, newContent);
      }

      mainContent.replaceWith(newContent);

      hash = scrollToIn(hash, newContent);

      if (!pageURLMap) {
        window.history.pushState({ page: url.href + hash, pageURLMap: location.pageURLMap }, null, url.href + hash);
      }
    } catch (e) {
      console.error(e);
      console.error(e.stack)
    }
  } else {
    window.location.href = url.href + hash;
  }

  updateActive();
}