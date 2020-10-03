/* global html */
// eslint-disable-next-line no-unused-vars
import h from 'vhtml';
import el from './html-to-element';

import transformPageLinks from './transform-page-links';
import transformTable from './transform-table';

import {navigate, location, reportIDFromHREF} from './navigation';
import {MODE} from './mode';
import {addMergeUnmerge} from './standings';

export default async function mutateContent(doc, mutatePageLinks, url) {
	const contentContainer = MODE === 'hsquizbowl' ? doc.querySelector('.ContentContainer') : doc.body;

	contentContainer.classList.add('qbsplus-content-container');
	contentContainer.classList.add('container');

	const mainContent = el(html`
    <div id="main-content"></div>
  `);

	const pageLinksTable = contentContainer.querySelector('table:first-child');
	let pageLinksTabs;
	if (pageLinksTable) {
		pageLinksTabs = await transformPageLinks(pageLinksTable, 'page');

		pageLinksTable.remove();
	}

	const page = location.pageURLMap.get(url);
	if (page) {
		mainContent.classList.add(page);
	}

	const stickyContainer = el(html`
		<div class="qb-stats-plus-sticky-container">
			<div class="qb-stats-plus-sticky"></div>
		</div>
	`);

	const sticky = stickyContainer.firstChild;

	mainContent.append(stickyContainer);

	if (location.reportMap) {
		const reportID = reportIDFromHREF(url);

		const reportSelect = el(html`
      <div class="report-select select is-link">
        <select>
          ${Array.from(location.reportMap).map(([id, name]) => html`
            <option value=${id} selected=${reportID === id}>${name}</option>
          `)}
        </select>
      </div>
    `);

		reportSelect.firstChild.addEventListener('change', event => {
			navigate(event.target.value, undefined, true);
		});

		sticky.append(reportSelect);
	}

	contentContainer.insertBefore(mainContent, contentContainer.firstChild);

	let next;
	let t;
	while (next = mainContent.nextSibling) {
		if (next.firstElementChild?.tagName === 'TABLE') {
			next = next.firstElementChild;
			t = 'TABLE';
		}

		switch (t = next.tagName) {
			case 'TABLE': {
				if (next.classList.contains('phaseLegend')) {
					mainContent.append(next.cloneNode(true));
					break;
				}

				if (next.style.position === 'sticky') {
					const links = Array.from(next.querySelectorAll('td > a[href]'));

					sticky.insertBefore(el(html`
						<div class="round-links-container">
							<div class="tabs is-right is-toggle round-links">
								<ul>
									${links.map(a => html`
										<li data-is-active-hash=${new URL(a.href).hash}>
											<a href=${a.href} data-navigate>${a.textContent}</a>
										</li>
									`)}
								</ul>
							</div>
					</div>
          `), sticky.firstChild);

					break;
				}

				let sortMode = 'sort';
				if (page === 'individuals') {
					sortMode = 'rerankFirst';
				}

				if (page === 'statKey') {
					sortMode = 'none';
				}

				// eslint-disable-next-line no-await-in-loop
				mainContent.append(await transformTable(next, page !== 'stat-key', sortMode));
				break;
			}

			case 'H1':
			case 'H2':
			case 'H3':
			case 'H4':
			case 'H5':
			case 'H6': {
				const _next = next.cloneNode(true);
				_next.classList.add('title');
				_next.classList.add(`is-${Number(t.slice(1))}`);
				mainContent.append(_next);
				break;
			}

			default:
				mainContent.append(next.cloneNode(true));
		}

		next?.remove();
	}

	if (mutatePageLinks) {
		mainContent.before(pageLinksTabs);
	}

	if (page === 'standings') {
		addMergeUnmerge(mainContent);
	}

	contentContainer.querySelectorAll('a[name]').forEach(a => {
		a.addEventListener('click', event => {
			event.preventDefault();
			window.location.hash = '#' + a.name;
		});
	});

	contentContainer.querySelectorAll('a[href]').forEach(a => {
		a.addEventListener('click', event => {
			event.preventDefault();
			navigate(a.href);
		});
	});

	return mainContent;
}
