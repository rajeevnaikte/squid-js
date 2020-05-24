import { UX } from '../..';
import * as utils from '../../common/utils';
import { walkDirTree } from 'squid-node-utils';

let elCount = 0;

walkDirTree(`${__dirname}/../data`)
  .forEach(uxjs => UX.add(require(uxjs)));

beforeEach(() => {
  document.body.innerHTML = '';
  jest.spyOn(utils, 'getUniqueElId').mockImplementation(() => `ux-${elCount++}`);
});

afterEach(() => {
  elCount = 0;
  jest.clearAllMocks();
});
