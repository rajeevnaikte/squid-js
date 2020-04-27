import { BaseError } from 'squid-utils';

export class NamespaceMissing extends BaseError {
  constructor (uxFilePath: string) {
    super('MISSING_NAMESPACE', `${uxFilePath} doesn't contain namespace. Beginning should be `
      + `'namespace: <some namespace for this component>;' (semi-colon is important)`);
  }
}

export class MultipleStyles extends BaseError {
  constructor (uxFilePath: string) {
    super('MULTI_STYLE', `${uxFilePath} has multiple style tags. Expected only one.`);
  }
}

export class MultipleHtmlBody extends BaseError {
  constructor (uxFilePath: string) {
    super('MULTI_HTML', `${uxFilePath} has multiple body tags. Expected all html code to be wrapped in a single tag.`);
  }
}

export class MultipleScript extends BaseError {
  constructor (uxFilePath: string) {
    super('MULTI_SCRIPT', `${uxFilePath} has multiple script tags. Expected only one.`);
  }
}

export class HtmlBodyMissing extends BaseError {
  constructor (uxFilePath: string) {
    super('MISSING_HTML', `${uxFilePath} has no html for the view. Expected html code wrapped in a single tag.`);
  }
}
