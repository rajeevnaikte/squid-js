import * as defaultConfigs from './configs.json';
import { JsonType, loadConfigs, Primitive } from 'squid-utils';

export const Config = loadConfigs(defaultConfigs);
/**
 * Set configurations.
 * @param configs
 */
export const setConfigs = (
  configs: { [key: string]: JsonType | Primitive } | typeof import('./configs.json')
): void => {
  loadConfigs(Object.assign(Config, configs));
};
