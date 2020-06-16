import { resolve as pathResolve } from 'path';
import { UX } from '../..';
import * as utils from '../../common/utils';
import { walkDirTree } from 'squid-node-utils';
import * as cp from 'child_process';

let elCount = 0;

walkDirTree(`${__dirname}/../data`, { fileNameMatcher: /[.]uxjs$/ })
  .forEach(uxjs => UX.add(require(uxjs)));

const uxuiPath = pathResolve('./.uxui');

cp.execSync(
  `rm -rf ${uxuiPath} && UI_MODULE_NAME=${__dirname}/../../ && uxui build -u ${__dirname}/../data/ux -e ${__dirname}/../data/app.ts`,
  { stdio: 'inherit' }
);

walkDirTree(uxuiPath, { fileNameMatcher: /[.]uxjs$/ })
  .forEach(uxjs => UX.add(require(uxjs)));

beforeEach(() => {
  document.body.innerHTML = '';
  jest.spyOn(utils, 'getUniqueElId').mockImplementation(() => `ux-${elCount++}`);
});

afterEach(() => {
  elCount = 0;
  jest.clearAllMocks();
});
