import { Builder as WebDriver, ThenableWebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import * as chromeDriver from 'chromedriver';
import { Config } from '../../configurations/configuration';

let webDriver: ThenableWebDriver;
beforeAll(() => {
  jest.setTimeout(60000);
  chromeDriver.start();
  webDriver = new WebDriver().forBrowser('chrome')
    .setChromeOptions((Config.ENV === 'dev' ? new chrome.Options() : new chrome.Options().headless()))
    .build();
});

afterAll(() => {
  webDriver.close();
  webDriver.quit();
  chromeDriver.stop();
})

export {
  webDriver
}
