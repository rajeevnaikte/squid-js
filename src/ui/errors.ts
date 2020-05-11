import { BaseError } from 'squid-utils';

export class ElementMissing extends BaseError {
  constructor (elementRef: string) {
    super('ELEMENT_MISSING', `Element ${elementRef} not found.`);
  }
}

export class UXExists extends BaseError {
  constructor (uxName: string) {
    super('UX_EXISTS', `UX ${uxName} already exists.`);
  }
}

export class UXNameNotValid extends BaseError {
  constructor (uxName: string) {
    super('UX_NAME_NOT_VALID', `UX ${uxName} is not a valid name.`);
  }
}
