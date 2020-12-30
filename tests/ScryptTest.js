const assert = require('assert')
const ScryptAsync = require('../dist/node-bundle.js')
const Scrypt = require('crypto').scrypt

describe('ScryptTest', function () {
  var scrypt
  const pwd = "hunter2"
  const salt = "DANGER -- this should be a random salt -- DANGER"

  beforeEach(async function () {
    try {
      scrypt = await ScryptAsync()
    } catch (err) {
      console.log(err)
      assert.fail(err)
    }
  })

  it ('Shoud return kdf', function (done) {
    const opts = {
      N: 16384,
      r: 4,
      p: 1
    }
    const dklen = 8

    let newKdf = scrypt.kdf(pwd, 'utf8', salt, 'utf8', dklen, opts)

    opts.dklen = dklen
    opts.maxmem = 128 * opts.N * opts.r * opts.p * opts.dklen;
    Scrypt(pwd, salt, opts.dklen, opts, function (err, kdf) {
      if (err) {
        assert.fail(err)
      }
      assert.strictEqual(kdf.toString('hex'), newKdf.toString('hex'))
      setTimeout(() => {
        done()
      }, 1000)
    })
  }, 100000)
})