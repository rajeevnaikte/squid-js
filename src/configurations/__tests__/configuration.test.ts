import { Config, getConfig, loadConfigurations } from '../configuration';

describe('configuration', () => {
  test('default configs', () => {
    delete process.env.ROOT_DIR;
    loadConfigurations();
    expect(getConfig(Config.ROOT_DIR)).toEqual('.');
  });

  test('default configs', () => {
    process.env.ROOT_DIR = 'test';
    loadConfigurations();
    expect(getConfig(Config.ROOT_DIR)).toEqual('test');
  });
});