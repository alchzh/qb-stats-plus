import h from 'vhtml';
import htm from 'htm';
import el from './html-to-element';

import {addTableSort} from './add-table-sort';

const html = htm.bind(h);

export default async function transformTable(table, withHeader, sortMode) {
	if (table.classList.contains('phaseLegend')) {
		return table.cloneNode(true);
	}

	if (table.style.position === 'sticky') {
		const links = Array.from(table.querySelectorAll('td > a[href]'));

		return el(html`
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
    `);
	}

	const rows = Array.from(table.querySelectorAll('tr'));

	let headerTDs;
	if (withHeader) {
		headerTDs = Array.from(rows.shift().querySelectorAll('td'));
	}

	const tableContainer = el(html`
    <div class="table-container">
      <table class="table is-fullwidth is-striped is-bordered">
        ${withHeader ? html`
          <thead>
            <tr>
              ${headerTDs.map(td => html`<th align=${td.align} title=${td.title} dangerouslySetInnerHTML=${{__html: td.innerHTML}}></th>`)}
            </tr>
          </thead>` :
		html``}
        <tbody dangerouslySetInnerHTML=${{__html: rows.map(row => row.outerHTML).join('\n')}}></tbody>
      </table>
    </div>
  `);

	const _table = tableContainer.firstChild;
	addTableSort(_table, sortMode);
	if (sortMode === 'rerankFirst') {
		_table.addEventListener('afterSort', () => {
			_table.querySelectorAll('tbody > tr > td:first-of-type').forEach((td, idx) => {
				td.textContent = idx + 1;
			});
		});
	}

	return tableContainer;
}
