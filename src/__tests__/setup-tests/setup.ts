import { UX } from '../..';
import * as utils from '../../common/utils';

let elCount = 0;

beforeAll(() => {
  UX.add(require('../data/panel-my-panel.uxjs'));
  UX.add(require('../data/valid.uxjs'));
});

beforeEach(() => {
  jest.spyOn(utils, 'getUniqueElId').mockImplementation(() => `ux-${elCount++}`);
});

afterEach(() => {
  elCount = 0;
  document.body.innerHTML = '';
  jest.clearAllMocks();
});
