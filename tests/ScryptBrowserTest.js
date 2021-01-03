const assert = require('assert')
const { Builder, until } = require('selenium-webdriver')
const firefox = require('selenium-webdriver/firefox')
const path = require('path')

require('geckodriver')

describe('ScryptBrowserTest', function () {
  var driver

  beforeEach(async function () {
    const options = new firefox.Options()
    options.addArguments('-headless')
    driver = new Builder().forBrowser('firefox')
      .setFirefoxOptions(options).build()
  })

  it ('Shoud return kdf', async function () {
    const url = `file://${path.join(__dirname, 'index.html')}`
    try {
      await driver.get(url)
      await driver.wait(until.titleIs('Scrypt test succed'), 9000)
      assert(true)
    } catch (err) {
      assert(false)
    } finally {
      return driver.quit()
    }
  })
})
