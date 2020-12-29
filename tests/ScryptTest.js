const assert = require('assert')
const { ConsoleWriter } = require('istanbul-lib-report')
const Buffer = require('buffer').Buffer
const ScryptAsync = require('../dist/node-bundle.js')
const Scrypt = require('crypto').scrypt

describe('ScryptTest', function () {
  var scrypt
  const pwd = "hunter2"
  const salt = "DANGER -- this should be a random salt -- DANGER"

  beforeEach(async function () {
    scrypt = await ScryptAsync()
  })

  it ('Shoud return kdf', function (done) {
    const opts = {
      N: 16384,
      r: 4,
      p: 1
    }
    const dklen = 8

    let newKdf = scrypt.kdf(pwd, salt, dklen, opts)

    opts.dklen = dklen
    opts.maxmem = 128 * opts.N * opts.r * opts.p * opts.dklen;
    Scrypt(pwd, salt, opts.dklen, opts, function (err, dk) {
      // if (err) {
      //   console.log(err)
      // } else {
      //   console.log(dk)
      // }
      console.log(dk, newKdf)
      console.log(dk, newKdf)
      console.log(dk, newKdf)
      setTimeout(() => {
        done()
      }, 1000)
    })
  }, 100000)
})