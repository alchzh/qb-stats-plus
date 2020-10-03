// eslint-disable-next-line no-unused-vars
import h from 'vhtml';
import el from "./html-to-element";

import { mapLinks, location } from "./navigation";

// function isLinkToHere (href, hash) {
//   const linkURL = new URL(href, document.baseURI);
//   linkURL.hash = "";

//   const locationURL = new URL(window.location.href);
//   locationURL.hash = "";

//   return linkURL.href === locationURL.href;
// }

export default async function transformPageLinks (table) {
  if (!table) return;

  const links = Array.from(table.querySelectorAll("td > a[href]"))
  location.pageURLMap = mapLinks(links);

  return el(html`
    <div class="tabs is-centered">
      <ul>
        ${links.map(a => html`
          <li data-is-active-page=${a.href}>
            <a href=${a.href} data-navigate>${a.textContent}</a>
          </li>
        `)}
      </ul>
    </div>
  `)
}