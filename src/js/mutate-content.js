// eslint-disable-next-line no-unused-vars
import h from 'vhtml';
import transformPageLinks from '../js/transform-page-links';
import transformTable from '../js/transform-table';
import el from "./html-to-element";
import htm from 'htm';

import { navigate, location, _pageCache } from './navigation';
import MODE from './mode';
import { mergeTables, removeHeadings } from './standings';

const html = htm.bind(h);

export default async function mutateContent(doc, mutatePageLinks, url) {
  const contentContainer = MODE === 'hsquizbowl' ? doc.querySelector('.ContentContainer') : doc.body;

  contentContainer.classList.add("qbsplus-content-container")
  contentContainer.classList.add('container')

  let mainContent = el(html`
    <div id="main-content"></div>
  `)

  const pageLinksTable = contentContainer.querySelector('table:first-child');
  let pageLinksTabs;
  if (pageLinksTable) {
    pageLinksTabs = await transformPageLinks(pageLinksTable, "page");

    contentContainer.removeChild(pageLinksTable);
  }

  const page = location.pageURLMap.get(url);
  if (page) {
    mainContent.classList.add(page);
  }

  contentContainer.insertBefore(mainContent, contentContainer.firstChild);

  let next;
  let t;
  while (next = mainContent.nextSibling) {
    if (next.firstElementChild?.tagName === "TABLE") {
      next = next.firstElementChild;
      t = "TABLE";
    }
  
    switch (t = next.tagName) {
      case "TABLE":
        let sortMode = "sort";
        if (page === "individuals") sortMode = "rerankFirst";
        if (page === "statKey") sortMode = "none";
        mainContent.appendChild(await transformTable(next, page !== "stat-key", sortMode))
        break
      case "H1":
      case "H2":
      case "H3":
      case "H4":
      case "H5":
      case "H6":
        const _next = next.cloneNode(true);
        _next.classList.add("title");
        _next.classList.add(`is-${+t.substring(1)}`)
        mainContent.appendChild(_next)
        break;
      default:
        mainContent.appendChild(next.cloneNode(true));
    }

    next.parentElement?.removeChild?.(next);
  }

  if (mutatePageLinks) {
    contentContainer.insertBefore(pageLinksTabs, mainContent);
  }

  if (page === "standings") {
    const containers = mainContent.querySelectorAll("div.table-container");
    if (containers.length > 1) {
      const button = el(html`
        <button class="button is-danger is-light merge-button">Merge</button>
      `)

      if (!mainContent.querySelector("h1")?.appendChild?.(button)) {
        mainContent.insertBefore(button, mainContent.firstChild)
      }

      let isMerged = false;
      let mergedHTML;
      let unmergedHTML = mainContent.innerHTML;

      function buttonClick (event) {
        if (isMerged) {
          console.log("Using found unmerged HTML")
          mainContent.innerHTML = unmergedHTML;
          isMerged = false;
        } else if (mergedHTML) {
          console.log("Using found merged HTML")
          mainContent.innerHTML = mergedHTML;
          isMerged = true;
        } else {
          try {
            mergeTables(mainContent.querySelectorAll("div.table-container"));
            removeHeadings(mainContent);
          } catch (e) {
            console.error(e)
            console.error(e.stack)
          }
          event.target.innerHTML = "Unmerge";

          mergedHTML = mainContent.innerHTML;
          isMerged = true;
        }

        document.querySelector("button.button")?.addEventListener("click", buttonClick);
      }

      button.addEventListener("click", buttonClick);
    }
  }

  contentContainer.querySelectorAll('a[name]').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); window.location.hash = "#" + a.name });
  })

  contentContainer.querySelectorAll('a[href]').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); navigate(a.href) });
  })

  return mainContent;
}