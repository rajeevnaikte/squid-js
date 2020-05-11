import { Builder as WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import * as chromeDriver from 'chromedriver';
import { Config } from '../../configurations/configuration';

beforeAll(() => {
  jest.setTimeout(60000);
  chromeDriver.start();
  // @ts-ignore
  global.webDriver = new WebDriver()
    .forBrowser('chrome')
    .setChromeOptions((Config.ENV === 'dev' ? new chrome.Options() : new chrome.Options().headless()))
    .build();
});

afterAll(() => {
  // @ts-ignore
  global.webDriver.close();
  // @ts-ignore
  global.webDriver.quit();
  chromeDriver.stop();
})
