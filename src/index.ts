import { UX } from './services/UX';
import { UI } from './services/UI';

export { ComponentDef } from './services/types';

// @ts-ignore
window.i18n = { translate: () => 'l10n' };
// @ts-ignore
window.UX = UX;
// @ts-ignore
window.UI = UI;

export {
  UI,
  UX
}
