// eslint-disable-next-line no-unused-vars
import h from 'vhtml';

import {HSQUIZBOWL_URL_REGEX} from './patterns';
import {reportIDFromHREF} from './navigation';

export function mapReports(reports) {
	return new Map(
		Array.from(reports)
			.map(a => [reportIDFromHREF(a.href), a.textContent.trim()])
	);
}

export default async function generateReportMap(SQBSHeader) {
	if (!SQBSHeader) {
		return;
	}

	const tournamentURL =
    SQBSHeader.querySelector('.Tournament > a')?.href ??
    window.location.href.match(HSQUIZBOWL_URL_REGEX)?.[1];
	if (!tournamentURL) {
		throw new Error('Tournament URL not found. Exiting.');
	}

	const html = await (await fetch(tournamentURL)).text();
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');

	const reportsAll = Array.from(doc.querySelectorAll('.Stats li > a[href]'));
	if (!reportsAll) {
		return false;
	}

	return mapReports(reportsAll);
}
