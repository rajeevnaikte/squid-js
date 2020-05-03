import { BaseError } from 'squid-utils';

export class ElementMissing extends BaseError {
  constructor (elementRef: string) {
    super('ELEMENT_MISSING', `Element ${elementRef} not found.`);
  }
}