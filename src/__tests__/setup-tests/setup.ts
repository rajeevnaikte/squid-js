import { UX } from '../..';
import * as utils from '../../common/utils';
import { walkDirTree } from 'squid-node-utils';

let elCount = 0;

beforeAll(() => {
  walkDirTree(`${__dirname}/../data`)
    .forEach(uxjs => UX.add(require(uxjs)));
});

beforeEach(() => {
  jest.spyOn(utils, 'getUniqueElId').mockImplementation(() => `ux-${elCount++}`);
});

afterEach(() => {
  elCount = 0;
  document.body.innerHTML = '';
  jest.clearAllMocks();
});
