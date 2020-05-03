import { Config, getConfig, loadConfigs } from '../configuration';

describe('configuration', () => {
  test('default Config', () => {
    delete process.env.ROOT_DIR;
    loadConfigs();
    expect(getConfig(Config.ROOT_DIR)).toEqual('.');
  });

  test('default Config', () => {
    process.env.ROOT_DIR = 'test';
    loadConfigs();
    expect(getConfig(Config.ROOT_DIR)).toEqual('test');
  });
});