// text encoding
// TODO: remove fast-text-encoding
require('fast-text-encoding')

const scryptWasm = require('./lib/scrypt_wasm_bg.wasm')
const Buffer = require('buffer/').Buffer
const textDecoder = new TextDecoder('utf-8')

module.exports = async function (opts) {
  const impOpts = Object.assign({
    'global': {},
    'env': {
      'memory': new WebAssembly.Memory({initial: 256, limit: 256}),
      'memoryBase': 1024,
      'table': new WebAssembly.Table({initial: 0, element: 'anyfunc'})
    },
    './scrypt_wasm': {
      'memory': new WebAssembly.Memory({initial: 256, limit: 256}),
      'memoryBase': 1024,
      'table': new WebAssembly.Table({initial: 0, element: 'anyfunc'}),
      'tableBase': 0,
      __wbindgen_throw: function (ptr, len) {
        // TODO: fetch error
        return new Error(`Got error at ${ptr} len ${len}`)
      },
    }
  }, opts)
  const s = await scryptWasm(impOpts)
  let scrypt = {}

  Object.defineProperties(scrypt, {
    s: {
      writable: false,
      value: s.instance.exports
    },
    defaultOptions: {
      writable: false,
      value: {
        N: 16384,
        r: 8,
        p: 1,
      }
    },
    globalArgumentPtr: {
      writable: false,
      value: s.instance.exports.__wbindgen_global_argument_ptr(),
    },
  })

  scrypt.malloc = function (str) {
    const buf = this.toBuffer(str, 'utf8')
    const ptr = this.s.__wbindgen_malloc(buf.length);
    const uint8Memory = new Buffer(s.instance.exports.memory.buffer)
    uint8Memory.set(buf, ptr)
    return [ptr, buf.length]
  }

  scrypt.free = function (ptr, len) {
    this.s.__wbindgen_free(ptr, len);
  }

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

  scrypt.toBuffer = function (str, enc='utf8') {
    if (typeof str !== 'string') {
      throw new Error('toBuffer str should use string')
    }
    if (typeof enc !== 'string') {
      throw new Error('toBuffer enc should use string')
    }
    if (enc !== 'utf8' && enc !== 'hex') {
      throw new Error('toBuffer unsupport encoding')
    }
    return Buffer.from(str, enc)
  }

  // pwd, salt should be string
  scrypt.kdf = function (pwd, pwdEnc, salt, saltEnc, dkLen, options = {}) {
    if (typeof pwd !== 'string' || typeof salt !== 'string') {
      throw new Error('kdf pwd/salt should be string')
    }
    let pwdLen, saltLen = 0
    if (pwdEnc != 'hex') {
      pwd = this.toHex(pwd, pwdEnc)
    }
    [pwd, pwdLen] = this.malloc(pwd)
    if (saltEnc != 'hex') {
      salt = this.toHex(salt, saltEnc)
    }
    [salt, saltLen] = this.malloc(salt)
    const retptr = this.globalArgumentPtr
    try {
      this.s.scrypt(retptr, pwd, pwdLen, salt, saltLen, options.N, options.r, options.p, dkLen)
      const mem = new Uint32Array(s.instance.exports.memory.buffer)
      const rustptr = mem[retptr / 4]
      const rustlen = mem[retptr / 4 + 1]
      const uint8Memory = new Buffer(s.instance.exports.memory.buffer)
      const realRet = textDecoder.decode(uint8Memory.subarray(rustptr, rustptr + rustlen)).slice()
      this.free(rustptr, rustlen * 1)
      return Buffer.from(realRet, 'hex')
    } finally {
      this.free(pwd)
      this.free(salt)
    }
  }
  return scrypt
}
