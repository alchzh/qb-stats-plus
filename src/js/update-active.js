import { location } from './navigation';

export default function updateActive () {
  const { currentPageURL, currentHash } = location;

  document.querySelectorAll("*[data-is-active-hash]").forEach(element => {
    if (element.getAttribute('data-is-active-hash') === currentHash) {
      element.classList.add("is-active");
    } else {
      element.classList.remove("is-active");
    }
  })

  document.querySelectorAll("*[data-is-active-page]").forEach(element => {
    if (element.getAttribute('data-is-active-page') === currentPageURL) {
      element.classList.add("is-active");
    } else {
      element.classList.remove("is-active");
    }
  })
}