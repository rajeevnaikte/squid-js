import * as defaultConfigs from './configs.json';
import { JsonObjectType } from 'squid-utils';

export const Config: {
  ROOT_DIR: string;
  UX_FILE_EXTN: string;
  UXJS_FILE_EXTN: string;
  UX_FILES_DIR: string;
  UXJS_NODE_MODULES: string[];
} = defaultConfigs;

export const loadConfigs = (userConfigs: JsonObjectType) => {
  Object.assign(Config, userConfigs);
};
