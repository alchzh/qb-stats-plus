export default function scrollToIn(hash, element) {
  if (hash.length > 1) {
    const h = hash.substring(1);
    const _scrollTo = element.querySelector(`*[name=${h}], *[id=${h}]`)
    if (_scrollTo) {
      _scrollTo.scrollIntoView();
    } else {
      hash = ""
      window.scrollTo(0, 0);
    }
  } else {
    hash = ""
    window.scrollTo(0, 0);
  }

  return hash;
}