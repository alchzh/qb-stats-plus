import { HSQUIZBOWL_URL_REGEX } from './patterns'

const MODE = HSQUIZBOWL_URL_REGEX.test(window.location.href)
  ? 'hsquizbowl'
  : 'raw';

console.log("QB Stats+ Mode:", MODE);

export default MODE;
