# scrypt-wasm
Scrypt wasm binding for nodejs, maybe web browser

# TODO
- [x] build openssl to wasm
- [x] build scrypt to wasm
- [ ] fix crypto_scrypt() always return -1
- [ ] add more tests

# Benchmark
Computer: 2.2 GHz 6-Core Intel Core i7
```
$ node -v
v12.18.1

> scrypt-benchmark@0.0.0 start /Users/peterlai/Desktop/Projects/js-scrypt/benchmarks
> node index.js

Scrypt JS x 114 ops/sec ±0.86% (83 runs sampled)
Scrypt x 400 ops/sec ±1.29% (88 runs sampled)
Scrypt node official  x 424 ops/sec ±0.49% (93 runs sampled)
Scrypt: fastest is Scrypt node official 
```