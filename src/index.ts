import { UI, UX } from './ui/ui';

export { ComponentDef } from './ui/types';

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
