// TextEncoder polyfill
require('fast-text-encoding')

const Buffer = require('buffer/').Buffer

module.exports = async function () {
  const s = await import('scrypt-wasm')
  let scrypt = {}

  Object.defineProperties(scrypt, {
    s: {
      writable: false,
      value: s
    },
    defaultOptions: {
      writable: false,
      value: {
        N: 16384,
        r: 8,
        p: 1,
      }
    },
  })

  scrypt.toHex = function (str, enc='utf8') {
    if (typeof str !== 'string') {
      throw new Error('toHex str should use string')
    }
    if (typeof enc !== 'string') {
      throw new Error('toHex enc should use string')
    }
    if (enc !== 'utf8' && enc !== 'hex') {
      throw new Error('toHex unsupport encoding')
    }
    return Buffer.from(str, enc).toString('hex')
  }

  // pwd, salt should be string
  scrypt.kdf = function (pwd, pwdEnc, salt, saltEnc, dkLen, options = {}) {
    if (typeof pwd !== 'string' || typeof salt !== 'string') {
      throw new Error('kdf pwd/salt should be string')
    }
    if (pwdEnc != 'hex') {
      pwd = this.toHex(pwd, pwdEnc)
    }
    if (saltEnc != 'hex') {
      salt = this.toHex(salt, saltEnc)
    }
    const _kdf = this.s.scrypt(pwd, salt, options.N, options.r, options.p, dkLen)
    return Buffer.from(_kdf, 'hex')
  }
  return scrypt
}
