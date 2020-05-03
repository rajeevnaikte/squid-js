import { UXCode } from '../services/types';
import { kebabCase } from 'lodash';

export const getCustomElementName = (ux: UXCode | string) => {
  if (typeof ux === 'string') return kebabCase(ux);
  return `${kebabCase(ux.namespace)}-${ux.name}`;
}