import TableSort from 'tablesort';

const reA = /[^a-zA-Z]/g;
const reN = /[^-.\d]/g;

TableSort.extend('alphanum', () => true, (a, b) => {
	const aA = a.replaceAll(reA, '');
	const bA = b.replaceAll(reA, '');
	if (aA === bA) {
		let aN = Number.parseFloat(a.replace(reN, ''));
		let bN = Number.parseFloat(b.replace(reN, ''));
		if (Number.isNaN(aN)) {
			aN = 0;
		}

		if (Number.isNaN(bN)) {
			bN = 0;
		}

		return aN === bN ? 0 : (aN > bN ? 1 : -1);
	}

	return aA > bA ? 1 : -1;
});

export function addTableSort(table, mode) {
	if (!mode || mode === 'none') {
		return;
	}

	table.querySelectorAll('thead > tr > th').forEach(th => {
		th.dataset.sortMethod = 'alphanum';
	});

	if (mode === 'rerankFirst') {
		const th = table.querySelector('thead > tr > th');
		th.dataset.sortMethod = 'none';
		th.textContent = '#';
	}

	return new TableSort(table);
}
