const ScryptWasm = require('./lib/scrypt.wasm')
const Scrypt = require('./lib/scrypt.js')
const Buffer = require('buffer/').Buffer
const isBuffer = require('is-buffer')

module.exports = function () {
  options = {
    instantiateWasm: function (info, successCallback) {
      return ScryptWasm(info)
              .then(function (i) {
                return successCallback(i.instance)
              })
    }
  }
  return new Promise(function (resolve, reject) {
    Scrypt(options).then(function (s) {
      let scrypt = {}

      // 769 is sign and recover context
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

      scrypt.copyToBuffer = function (src, len) {
        let out = new Buffer(len)
        for (var i=0; i<len; i++) {
          let v = this.s.getValue(src + i, 'i8')
          out[i] = v
        }
        return out
      }

      scrypt.kdf = function (pwd, salt, dkLen, options = {}) {
        return this._kdf(Buffer.from(pwd), Buffer.from(salt), dkLen, options)
      }

      scrypt._kdf = function (pwdBuf, saltBuf, dkLen, options = {}) {
        if (isBuffer(pwdBuf) !== true) {
          return false
        }
        if (isBuffer(saltBuf) !== true) {
          return false
        }
        const pwdLen = pwdBuf.length
        const saltLen = saltBuf.length
        const opts = Object.assign(this.defaultOptions, options)
        let pwd = this.s._malloc(pwdLen)
        let salt = this.s._malloc(saltLen)
        this.s.HEAP8.set(pwdBuf, pwd)
        this.s.HEAP8.set(saltBuf, salt)
        let dk = this.s._malloc(dkLen)
        let ret = this.s._crypto_scrypt(pwd, pwdLen, salt, saltLen, opts.N, opts.r, opts.p, dk, dkLen)
        if (ret != 0) {
          this.s._free(pwd)
          this.s._free(salt)
          this.s._free(dk)
          return false
        }
        let rdk = this.copyToBuffer(dk, dkLen)
        this.s._free(pwd)
        this.s._free(salt)
        this.s._free(dk)
        return rdk
      }

      resolve(scrypt)
    })
  })
}
