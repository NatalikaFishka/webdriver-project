const webdriver = require('selenium-webdriver');
const assert = require('assert');
const until = webdriver.until;

const SELENIUM_HOST = 'http://localhost:4444/wd/hub';
const URL = 'https://training.by/';

const DEFAULT_TARGET_URL = 'https://training.by/#!/Home?lang=ru';
const ENGLISH_TARGET_URL = 'https://training.by/#!/Home?lang=en';

const EXPECTED_SITE_TITLE = 'Тренинг-центр EPAM в Беларуси - программы обучения для студентов, а также тех, кто хочет начать карьеру в IT | training.by';
const TRAINING_LIST_LINK_TEXT_RU = 'Список тренингов';
const TRAINING_LIST_LINK_RU = 'https://training.by/#!/TrainingList?lang=ru';
const PRIVACY_PILICY_LINK_TEXT_RU = 'Политика конфиденциальности';
const PRIVACY_PILICY_LINK = 'https://www.epam.com/privacy-policy';

const LOGIN = 'automation_test@qa.team';
const PASSWORD = 'automationTest';
const USER_NAME = 'automation_test';

let SELECTED_CITY;
let filteredTrainings;
let allTrainings;

const client = new webdriver.Builder()
  .usingServer(SELENIUM_HOST)
  .withCapabilities({ browserName: 'chrome' })
  .build();

/**
 *  Test#1: Go to URL and verify correct page title
 */

client.get(URL)
  .then(() => client.manage().window().maximize())
  .then(() => client.getTitle())
  .then((title) => {
    assert.strictEqual(title, EXPECTED_SITE_TITLE, title);
    console.log('Test#1: Go to URL and verify correct page title: PASSED')
  })
  .catch((error) => {
    console.log('Test#1: Go to URL and verify correct page title: FAILED. Recieved title:', error.message)
  })


  /**
  *  Test#2: Go to URL and confirm that default page language is Russian"
  */
  .then(() => client.sleep(1000))
  .then(() => client.get(URL))
  .then(() => client.getCurrentUrl())
  .then((currentUrl) => {
    assert.strictEqual(currentUrl, DEFAULT_TARGET_URL, currentUrl)
    console.log('Test#2: Go to URL and confirm that default page language is Russian: PASSED')
  })
  .catch((error) => {
    console.log('Test#2: Go to URL and confirm that default page language is Russian: FAILED. Current URL is:', error.message)
  })



  /**
  *  Test#3: Switch to English language
  */
  .then(() => client.sleep(1000))
  .then(() => client.get(URL))
  .then(() => client.findElement({ css: '.location-selector' }).click())
  .then(() => client.findElement({ css: '.location-selector__panel' }).isDisplayed())
  .then(() => client.findElement({ linkText: 'English' }).click())
  .then(() => client.wait(until.urlIs(ENGLISH_TARGET_URL), 1000))
  .then((result) => {
    assert.ok(result, "Current URL is different from the expected")
    console.log('Test#3-1: Switch to English language: PASSED')
  })
  .catch((error) => {
    console.log('Test#3-1: Switch to English language: FAILED. Current langualge URL is:', error.message)
  })
  .then(() => client.sleep(2000))
  .then(() => client.findElement({ css: '.location-selector' }).click())
  .then(() => client.findElement({ css: '.location-selector__panel' }).isDisplayed())
  .then(() => client.findElement({ linkText: 'Русский' }).click())
  .then(() => client.wait(until.urlIs(DEFAULT_TARGET_URL), 1000))
  .then(() => {
    console.log('Test#3-2: Switch back to Russian language: PASSED')
  })
  .catch((error) => {
    console.log('Test#3-2: Switch back to Russian language: FAILED. Current langualge URL is:', error.message)
  })


  /**
  *  Test#4: Go to training list and navigate back
  */
  .then(() => client.sleep(1000))
  .then(() => client.get(URL))
  .then(() => client.findElement({ linkText: TRAINING_LIST_LINK_TEXT_RU.toUpperCase() }).click())
  .then(() => client.getCurrentUrl())
  .then((currentUrl) => {
    assert.strictEqual(currentUrl, TRAINING_LIST_LINK_RU, currentUrl)
    console.log('Test#4-1: Go to training list: PASSED')
  })
  .catch((error) => {
    console.log('Test#4-1: Go to training list: FAILED. Current URL is:', error)
  })
  .then(() => client.navigate().back())
  .then(() => client.getCurrentUrl())
  .then((currentUrl) => {
    assert.strictEqual(currentUrl, DEFAULT_TARGET_URL, currentUrl)
    console.log('Test#4-2: Navigate back: PASSED')
  })
  .catch((error) => {
    console.log('Test#4-2: Navigate back: FAILED. Current URL is:', error.message)
  })


  /**
  *  Test#5: Filter trainings by city location
  */
  .then(() => client.sleep(1000))
  .then(() => client.get(URL))
  .then(() => client.executeScript("scroll(0, 250)"))
  .then(() => client.sleep(1000))
  .then(() => client.findElement({ css: '.filter-toggle' }).click())
  .then(() => client.sleep(1000))
  .then(() => client.findElement({ css: '.cities:nth-child(3) span' }).click())
  .then(() => client.findElement({ css: '.cities:nth-child(3)' }).getText())
  .then((selectedCity) => SELECTED_CITY = selectedCity)
  .then(() => client.findElement({ css: '.filter-toggle__arrow-icon' }).click())
  .then(() => client.sleep(1000))
  .then(() => client.findElements({ css: '.training-item__location' }))
  .then((result) => {
    let finalResult = result.every((curr) => curr.getText().then((text) => text.startsWith(SELECTED_CITY)));
    assert.ok(finalResult);
    console.log(`Test#5: Filter trainings by '${SELECTED_CITY}' city: PASSED`)
  })
  .catch((error) => console.log(`Test#5: Filter trainings by '${SELECTED_CITY}' city: FAILED. Error:`, error.message))


  /**
  *  Test#6: Clear filter
  */
  .then(() => client.sleep(1000))
  .then(() => client.findElements({ css: '.training-item' }))
  .then((result) => filteredTrainings = result.length)
  .then(() => client.findElement({ css: '.filter-field__title span' }).click())
  .then(() => client.findElements({ css: '.training-item' }))
  .then((result) => {
    allTrainings = result.length;
    assert.ok(allTrainings >= filteredTrainings);
    console.log('Test#6: Clear filter: PASSED')
  })
  .catch((error) => {
    console.log('Test#6: Clear filter FAILED. Error:', error.message)
  })

  /**
  *  Test#7: Go to Privacy Policy
  */
  .then(() => client.sleep(1000))
  .then(() => client.executeScript('window.scrollTo(0, document.body.scrollHeight)'))
  .then(() => client.sleep(2000))
  .then(() => client.findElement({ linkText: PRIVACY_PILICY_LINK_TEXT_RU.toUpperCase() }).click())
  .then(() => client.getCurrentUrl())
  .then((currentUrl) => {
    assert.strictEqual(currentUrl, PRIVACY_PILICY_LINK, currentUrl)
    console.log('Test#7: Go to Privacy Policy: PASSED')
  })
  .catch((error) => {
    console.log('Test#7: Go to Privacy Policy: FAILED. Recieved link:', error.message)
  })

  /**
  *  Test#8: Login
  */
  .then(() => client.sleep(1000))
  .then(() => client.navigate().to(URL))
  .then(() => client.findElement({ css: '.header-auth__signin' }).click())
  .then(() => client.sleep(1000))
  .then(() => {
    client.findElement({ id: 'signInEmail' }).sendKeys(LOGIN);
    client.findElement({ id: 'signInPassword' }).sendKeys(PASSWORD);
  })
  .then(() => client.sleep(1000))
  .then(() => client.findElement({ css: 'input[value="Войти"]' }).click())
  .then(() => client.sleep(1000))
  .then(() => client.findElement({ css: ".user-info__name" }).getText())
  .then((userName) => {
    assert.strictEqual(userName, USER_NAME, userName);
    console.log('Test#8: User logged in: PASSED')
  })
  .catch((error) => {
    console.log('Test#8: Login test. Actual user name is:', error.message)
  })

  /**
  *  Test#9: Logout
  */
  .then(() => client.sleep(1000))
  .then(() => client.findElement({ css: ".user-info__arrow" }).click())
  .then(() => client.findElement({ linkText: "Выйти" }).click())
  .then(() => client.wait(until.elementIsVisible(client.findElement({ css: '.header-auth__signin' })), 2000))
  .then((result) => {
    assert.ok(result, 'Not logged out');
    console.log('Test#9: Logout test. PASSED')
  })
  .catch((error) => {
    console.log('Test#9: Logout test: FEILED. Error:', error.message)
  })
  .then(() => client.close());