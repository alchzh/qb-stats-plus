import TableSort from "tablesort";

const reA = /[^a-zA-Z]/g;
const reN = /[^-.0-9]/g;

TableSort.extend('alphanum', () => true, function(a, b) {
  var aA = a.replaceAll(reA, "");
  var bA = b.replaceAll(reA, "");
  if(aA === bA) {
    var aN = parseFloat(a.replace(reN, ""));
    var bN = parseFloat(b.replace(reN, ""));
    if (isNaN(aN)){
      aN = 0;
    }
    if (isNaN(bN)){
      bN = 0;
    }
    return aN === bN ? 0 : aN > bN ? 1 : -1;
  } else {
    return aA > bA ? 1 : -1;
  }
});

export function addTableSort(table, mode) {
  if (!mode || mode === "none") {
    return;
  }

  table.querySelectorAll("thead > tr > th").forEach(th => th.setAttribute("data-sort-method", "alphanum"))

  if (mode === "rerankFirst") {
    const th = table.querySelector("thead > tr > th")
    th?.setAttribute?.("data-sort-method", "none")
    th.innerText = "#"
  }

  new TableSort(table)
}
