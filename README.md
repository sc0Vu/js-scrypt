# scrypt-wasm
Scrypt wasm binding for nodejs and web browser

# Usage

* KDF
```JS
const opts = {
  N: 16384,
  r: 4,
  p: 1
}
const dklen = 8
const kdf = scrypt.kdf(pwd, 'utf8', salt, 'utf8', dklen, opts)
```

# Benchmark
Computer: 2.2 GHz 6-Core Intel Core i7
```
$ node -v
v12.18.1

> scrypt-benchmark@0.0.0 start /Users/peterlai/Desktop/Projects/js-scrypt/benchmarks
> node index.js

Scrypt JS  x 115 ops/sec ±0.52% (83 runs sampled)
Scrypt node official  x 419 ops/sec ±0.55% (92 runs sampled)
Scrypt wasm  x 106 ops/sec ±0.82% (78 runs sampled)
Scrypt: fastest is Scrypt node official
```