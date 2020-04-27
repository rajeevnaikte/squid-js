import { JsonType, NonNullPrimitive } from 'squid-utils';
import * as defaultConfigs from './configs.json';

export enum Config {
  ROOT_DIR = 'ROOT_DIR'
}

const configs: {
  ROOT_DIR: string;
} = defaultConfigs;

export const loadConfigurations = (): void => {
  for (const config in Config) {
    if (process.env[config] !== undefined) {
      configs[config as Config] = process.env[config] ?? '';
    }
  }
};

export const getConfig = (key: Config) => configs[key];
