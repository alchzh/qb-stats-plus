/* global html */
// eslint-disable-next-line no-unused-vars
import h from 'vhtml';
import el from './html-to-element';

export function mergeTables(containers) {
	const _containers = Array.from(containers);

	const firstContainer = _containers.shift();
	const firstTBody = firstContainer.querySelector('table > tbody');

	_containers.forEach(container => {
		container.querySelectorAll('table > tbody > tr').forEach(tr => {
			firstTBody.append(tr);
		});

		container.remove();
	});
}

export function removeHeadings(element) {
	element.querySelectorAll('h2, h3, h4, h5, h6').forEach(hn => hn.remove());
}

export function addMergeUnmerge(mainContent) {
	const containers = mainContent.querySelectorAll('div.table-container');
	if (containers.length > 1) {
		const button = el(html`
			<button class="button is-danger is-light merge-button">Merge</button>
		`);

		if (mainContent.querySelector('h1')?.append?.(button) === null) {
			mainContent.insertBefore(button, mainContent.firstChild);
		}

		let isMerged = false;
		let mergedHTML;
		const unmergedHTML = mainContent.innerHTML;

		// eslint-disable-next-line no-inner-declarations
		function buttonClick(event) {
			if (isMerged) {
				console.log('Using found unmerged HTML');
				mainContent.innerHTML = unmergedHTML;
				isMerged = false;
			} else if (mergedHTML) {
				console.log('Using found merged HTML');
				mainContent.innerHTML = mergedHTML;
				isMerged = true;
			} else {
				try {
					mergeTables(mainContent.querySelectorAll('div.table-container'));
					removeHeadings(mainContent);
				} catch (error) {
					console.error(error);
					console.error(error.stack);
				}

				event.target.innerHTML = 'Unmerge';

				mergedHTML = mainContent.innerHTML;
				isMerged = true;
			}

			document.querySelector('button.button')?.addEventListener('click', buttonClick);
		}

		button.addEventListener('click', buttonClick);
	}
}
