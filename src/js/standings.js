export function mergeTables(containers) {
  const _containers = Array.from(containers)

  const firstContainer = _containers.shift();
  const firstTBody = firstContainer.querySelector("table > tbody");

  _containers.forEach(container => {
    container.querySelectorAll("table > tbody > tr").forEach(tr => {
      firstTBody.appendChild(tr);
    })

    container.remove();
  })
}

export function removeHeadings(element) {
  element.querySelectorAll("h2, h3, h4, h5, h6").forEach(hn => hn.remove())
}
