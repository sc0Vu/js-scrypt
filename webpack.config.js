const webpack = require("webpack")
const path = require("path")
const nodeEnv = process.env.NODE_ENV
const nodeConfig = {
  mode: nodeEnv,
  target: 'node',
  context: path.resolve(__dirname, "."),
  entry: "./index.js",
  output: {
    library: 'SCRYPT',
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, "dist"),
    filename: "node-bundle.js"
  },
  node: {
    fs: 'empty'
  },
  module: {
    rules: [
      // won't load module, have to dig into: https://github.com/WebAssembly/binaryen/issues/670
      // also: https://www.assemblyscript.org/exports-and-imports.html#imports
      {
        test: /scrypt_wasm_bg\.wasm$/,
        type: "javascript/auto",
        loader: "wasm-loader",
      },
    ]
  }
}

const browserConfig = {
  mode: nodeEnv,
  target: 'web',
  context: path.resolve(__dirname, "."),
  entry: "./index.js",
  output: {
    library: 'SCRYPT',
    libraryTarget: 'var',
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js"
  },
  node: {
    fs: 'empty'
  },
  module: {
    rules: [
      {
        test: /scrypt_wasm_bg\.wasm$/,
        type: "javascript/auto",
        loader: "wasm-loader",
      },
    ]
  }
}

module.exports = [ nodeConfig, browserConfig ]