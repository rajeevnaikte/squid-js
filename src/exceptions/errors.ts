import { BaseError } from 'squid-utils';

export class ElementMissing extends BaseError {
  constructor (elementRef: string) {
    super('ELEMENT_MISSING', `Element '${elementRef}' not found.`);
  }
}

export class UXExists extends BaseError {
  constructor (uxName: string) {
    super('UX_EXISTS', `UX '${uxName}' already exists.`);
  }
}

export class UXNameNotValid extends BaseError {
  constructor (uxName: string) {
    super('UX_NAME_NOT_VALID', `UX '${uxName}' is not a valid name.`);
  }
}

export class ItemsNotAllowed extends BaseError {
  constructor (uxName: string, itemsFor: string) {
    super('ITEMS_NOT_ALLOWED', `Adding ${itemsFor} items not allowed for the UX ${uxName}.`);
  }
}

export class MultipleItemsRefs extends BaseError {
  constructor (uxName: string, ref: string) {
    super('MULTIPLE_ITEMS_TAGS', `Multiple items tag for ref ${ref} found in UX ${uxName}.`);
  }
}

export class UXUndefined extends BaseError {
  constructor (uxName: string) {
    super('UX_UNDEFINED', `UX '${uxName}' not defined.`);
  }
}

export class ComponentUndefined extends BaseError {
  constructor (compName: string) {
    super('COMP_NOT_FOUND', `Component '${compName}' not defined.`);
  }
}
