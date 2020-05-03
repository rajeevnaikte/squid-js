import * as defaultConfigs from './configs.json';

export enum Config {
  ROOT_DIR = 'ROOT_DIR',
  UX_FILE_EXTN = 'UX_FILE_EXTN',
  UXJS_FILE_EXTN = 'UXJS_FILE_EXTN'
}

const configs: {
  ROOT_DIR: string;
  UX_FILE_EXTN: string;
  UXJS_FILE_EXTN: string;
} = defaultConfigs;

export const loadConfigurations = (): void => {
  for (const config in Config) {
    if (process.env[config] !== undefined) {
      configs[config as Config] = process.env[config] ?? '';
    }
  }
};

export const getConfig = (key: Config) => configs[key];
