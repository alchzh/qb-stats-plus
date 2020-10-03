// eslint-disable-next-line no-unused-vars
import h from 'vhtml';
import el from "./html-to-element";

import {HSQUIZBOWL_URL_REGEX} from './patterns';

import { location, mapReports, reportIDFromHREF, navigate } from "./navigation";

export default async function transformSQBSHeader(SQBSHeader) {
	if (!SQBSHeader) return;

	const ReportNameSpan = SQBSHeader.querySelector('.ReportName');
	const currentReportName = ReportNameSpan.textContent.slice('Statistics report for '.length);

	const tournamentURL =
    SQBSHeader.querySelector('.Tournament > a')?.href ??
    window.location.href.match(HSQUIZBOWL_URL_REGEX)?.[1];
	if (!tournamentURL) {
		throw new Error('Tournament URL not found. Exiting.');
	}

	const html = await (await fetch(tournamentURL)).text()
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');

	const reportsAll = Array.from(doc.querySelectorAll('.Stats li > a[href]'));
	if (!reportsAll) {
		return false;
	}

	location.reportURLMap = mapReports(reportsAll);

	const reportSelect = el(html`
		<div class="select">
			<select class="report-select">
				${reportsAll.map(report => html`
					<option value=${reportIDFromHREF(report.href)} selected=${report.textContent === currentReportName}>${report.textContent}</option>
				`)}
			</select>
		</div>
	`)

	reportSelect.firstChild.addEventListener("change", event => {
		navigate(event.target.value, undefined, true);
	})

	const newSQBSHeader = SQBSHeader.cloneNode(true);
	const newReportNameSpan = newSQBSHeader.querySelector('.ReportName');
	newReportNameSpan.innerText = "Statistics report for ";
	newReportNameSpan.appendChild(reportSelect);

	return newSQBSHeader;
}
